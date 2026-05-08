import type { VercelRequest, VercelResponse } from "@vercel/node";
import { timingSafeEqual } from "crypto";
import { parse as parseCookies } from "cookie";
import {
  signSession,
  verifySession,
  setSessionCookie,
  clearSessionCookie,
  requireAdmin,
} from "../_lib/auth";
import { logAudit } from "../_lib/audit";

// ---------------------------------------------------------------------------
// In-memory IP-based rate limiter — max 5 failed login attempts per 15 min.
//
// CAVEAT (v2 TODO): Vercel serverless functions are stateless and can run on
// multiple instances concurrently. This Map is NOT shared across instances, so
// a determined attacker could parallelize requests across instances to bypass
// it. This is acceptable for v1. The correct v2 fix is Upstash Ratelimit + KV:
//   import { Ratelimit } from "@upstash/ratelimit";
//   import { Redis } from "@upstash/redis";
// ---------------------------------------------------------------------------
const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILURES = 5;

interface RateBucket {
  failures: number;
  windowStart: number;
}

const rateBuckets = new Map<string, RateBucket>();

function getClientIp(req: VercelRequest): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
    req.socket?.remoteAddress ??
    "unknown"
  );
}

/** Returns remaining seconds until the window resets, or 0 if not rate-limited. */
function checkRateLimit(ip: string): number {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);

  // Evict stale buckets while we're here
  for (const [key, b] of rateBuckets) {
    if (now - b.windowStart > RATE_WINDOW_MS) rateBuckets.delete(key);
  }

  if (!bucket || now - bucket.windowStart > RATE_WINDOW_MS) return 0;
  if (bucket.failures >= MAX_FAILURES) {
    return Math.ceil((RATE_WINDOW_MS - (now - bucket.windowStart)) / 1000);
  }
  return 0;
}

function recordFailure(ip: string): void {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || now - bucket.windowStart > RATE_WINDOW_MS) {
    rateBuckets.set(ip, { failures: 1, windowStart: now });
  } else {
    bucket.failures += 1;
  }
}

function resetBucket(ip: string): void {
  rateBuckets.delete(ip);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // GET /api/admin/auth → me (check session)
  if (req.method === "GET") {
    const cookieHeader = req.headers.cookie ?? "";
    const cookies = parseCookies(cookieHeader);
    const token = cookies["coco_admin_session"];
    if (!token) return res.status(200).json({ authenticated: false });
    const result = verifySession(token);
    return res.status(200).json({ authenticated: result.ok });
  }

  // POST /api/admin/auth — body: { action: 'login'|'logout', password? }
  if (req.method === "POST") {
    const { action, password } = req.body ?? {};

    // LOGOUT
    if (action === "logout") {
      if (!requireAdmin(req, res)) return;
      logAudit("logout", {}, req);
      clearSessionCookie(res);
      return res.status(200).json({ ok: true });
    }

    // LOGIN
    if (action === "login") {
      if (!password || typeof password !== "string") {
        return res.status(400).json({ error: "bad_request", message: "Mot de passe requis" });
      }

      const ip = getClientIp(req);

      // Rate limit check — reject before touching the password
      const retryAfter = checkRateLimit(ip);
      if (retryAfter > 0) {
        const minutes = Math.ceil(retryAfter / 60);
        logAudit("login_rate_limited", { ip }, req);
        res.setHeader("Retry-After", String(retryAfter));
        return res.status(429).json({
          error: "rate_limited",
          message: `Trop de tentatives. Réessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}.`,
          retry_after_seconds: retryAfter,
        });
      }

      try {
        const expected = process.env.COCO_BEACH_ADMIN_PASSWORD ?? "";
        const a = Buffer.from(password.padEnd(256).slice(0, 256));
        const b = Buffer.from(expected.padEnd(256).slice(0, 256));
        const match = timingSafeEqual(a, b) && password === expected;

        if (!match) {
          recordFailure(ip);
          logAudit("login_failed", { reason: "wrong_password" }, req);
          return res.status(401).json({ error: "unauthorized", message: "Mot de passe incorrect" });
        }

        // Successful login — reset failure counter
        resetBucket(ip);
        const expiryMs = Date.now() + 30 * 24 * 60 * 60 * 1000;
        const token = signSession(expiryMs);
        setSessionCookie(res, token);
        logAudit("login_success", {}, req);
        return res.status(200).json({ ok: true });
      } catch (err) {
        console.error("[api/admin/auth login] error:", err);
        return res.status(500).json({ error: "internal_error" });
      }
    }

    return res.status(400).json({ error: "bad_request", message: "action must be login or logout" });
  }

  return res.status(405).json({ error: "method_not_allowed" });
}
