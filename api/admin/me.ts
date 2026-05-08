import type { VercelRequest, VercelResponse } from "@vercel/node";
import { parse as parseCookies } from "cookie";
import { verifySession } from "../_lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const cookieHeader = req.headers.cookie ?? "";
  const cookies = parseCookies(cookieHeader);
  const token = cookies["coco_admin_session"];

  if (!token) {
    return res.status(200).json({ authenticated: false });
  }

  const result = verifySession(token);
  return res.status(200).json({ authenticated: result.ok });
}
