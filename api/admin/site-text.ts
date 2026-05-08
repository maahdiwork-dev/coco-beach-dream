import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { requireAdmin } from "../_lib/auth";
import { getServiceClient } from "../_lib/supabase";
import { logAudit } from "../_lib/audit";

const bodySchema = z.object({
  entries: z.array(
    z.object({
      key: z.string().min(1),
      value: z.string(),
    })
  ).min(1),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  if (!requireAdmin(req, res)) return;

  try {
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "validation_error", message: parsed.error.message });
    }

    const { entries } = parsed.data;
    const now = new Date().toISOString();
    const rows = entries.map((e) => ({ key: e.key, value: e.value, updated_at: now }));

    const { error } = await getServiceClient()
      .schema("coco_beach")
      .from("site_text")
      .upsert(rows, { onConflict: "key" });

    if (error) throw error;

    logAudit("site_text_updated", { keys: entries.map((e) => e.key) }, req);
    return res.status(200).json({ ok: true, count: entries.length });
  } catch (err) {
    console.error("[api/admin/site-text] error:", err);
    return res.status(500).json({ error: "internal_error" });
  }
}
