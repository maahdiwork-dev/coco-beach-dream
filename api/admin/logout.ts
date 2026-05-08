import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin, clearSessionCookie } from "../_lib/auth";
import { logAudit } from "../_lib/audit";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  // Auth check (optional on logout but logs the action properly)
  const authed = requireAdmin(req, res);
  if (!authed) return;

  logAudit("logout", {}, req);
  clearSessionCookie(res);
  return res.status(200).json({ ok: true });
}
