import type { VercelRequest } from "@vercel/node";
import { getServiceClient } from "./supabase";

export function logAudit(
  action: string,
  details: Record<string, unknown>,
  req: VercelRequest
): void {
  // Fire-and-forget — don't block the response
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
    req.socket?.remoteAddress ??
    "unknown";
  const userAgent = req.headers["user-agent"] ?? "unknown";

  void Promise.resolve(
    getServiceClient()
      .schema("coco_beach")
      .from("admin_audit")
      .insert({ action, details, ip, user_agent: userAgent })
  ).then(({ error }) => {
    if (error) {
      console.error("[audit] insert failed:", error.message);
    }
  }).catch((err: unknown) => {
    console.error("[audit] unexpected error:", err);
  });
}
