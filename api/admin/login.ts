import type { VercelRequest, VercelResponse } from "@vercel/node";
import { timingSafeEqual } from "crypto";
import { signSession, setSessionCookie } from "../_lib/auth";
import { logAudit } from "../_lib/audit";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  try {
    const { password } = req.body ?? {};

    if (!password || typeof password !== "string") {
      return res.status(400).json({ error: "bad_request", message: "Mot de passe requis" });
    }

    const expected = process.env.COCO_BEACH_ADMIN_PASSWORD ?? "";

    // Constant-time compare — pad to same length to avoid timing leak on length
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
    console.error("[api/admin/login] error:", err);
    return res.status(500).json({ error: "internal_error" });
  }
}
