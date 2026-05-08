import { createHmac, timingSafeEqual } from "crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { parse as parseCookies } from "cookie";

const COOKIE_NAME = "coco_admin_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function getSecret(): string {
  const secret = process.env.COCO_BEACH_SESSION_SECRET;
  if (!secret) throw new Error("Missing COCO_BEACH_SESSION_SECRET");
  return secret;
}

export function signSession(expiryMs: number = Date.now() + SESSION_TTL_MS): string {
  const secret = getSecret();
  const payload = String(expiryMs);
  const hmac = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${hmac}`;
}

export function verifySession(token: string): { ok: true } | { ok: false } {
  try {
    const secret = getSecret();
    const lastDot = token.lastIndexOf(".");
    if (lastDot === -1) return { ok: false };
    const payload = token.slice(0, lastDot);
    const providedHmac = token.slice(lastDot + 1);
    const expectedHmac = createHmac("sha256", secret).update(payload).digest("hex");

    // Timing-safe comparison
    const a = Buffer.from(providedHmac, "hex");
    const b = Buffer.from(expectedHmac, "hex");
    if (a.length !== b.length) return { ok: false };
    if (!timingSafeEqual(a, b)) return { ok: false };

    // Check expiry
    const expiryMs = Number(payload);
    if (isNaN(expiryMs) || Date.now() > expiryMs) return { ok: false };

    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export function setSessionCookie(res: VercelResponse, token: string): void {
  const maxAge = SESSION_TTL_MS / 1000;
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}; Path=/`
  );
}

export function clearSessionCookie(res: VercelResponse): void {
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/`
  );
}

/**
 * Middleware: reads the session cookie, verifies it.
 * Returns true if authenticated. Returns false and writes 401 if not.
 */
export function requireAdmin(req: VercelRequest, res: VercelResponse): boolean {
  const cookieHeader = req.headers.cookie ?? "";
  const cookies = parseCookies(cookieHeader);
  const token = cookies[COOKIE_NAME];
  if (!token) {
    res.status(401).json({ error: "unauthorized", message: "Session manquante" });
    return false;
  }
  const result = verifySession(token);
  if (!result.ok) {
    res.status(401).json({ error: "unauthorized", message: "Session invalide ou expirée" });
    return false;
  }
  return true;
}
