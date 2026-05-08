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
      try {
        const expected = process.env.COCO_BEACH_ADMIN_PASSWORD ?? "";
        const a = Buffer.from(password.padEnd(256).slice(0, 256));
        const b = Buffer.from(expected.padEnd(256).slice(0, 256));
        const match = timingSafeEqual(a, b) && password === expected;

        if (!match) {
          logAudit("login_failed", { reason: "wrong_password" }, req);
          return res.status(401).json({ error: "unauthorized", message: "Mot de passe incorrect" });
        }

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
