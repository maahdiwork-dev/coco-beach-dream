import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { requireAdmin } from "../_lib/auth";
import { getServiceClient } from "../_lib/supabase";
import { logAudit } from "../_lib/audit";

const bodySchema = z.object({
  storage_path: z.string().min(1),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  if (!requireAdmin(req, res)) return;

  try {
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "validation_error", message: parsed.error.message });
    }

    const { storage_path } = parsed.data;
    const supabase = getServiceClient();

    // Deactivate all existing hero_video rows
    const { error: deactivateError } = await supabase
      .schema("coco_beach")
      .from("hero_video")
      .update({ active: false })
      .eq("active", true);

    if (deactivateError) throw deactivateError;

    // Insert the new active row
    const { data, error: insertError } = await supabase
      .schema("coco_beach")
      .from("hero_video")
      .insert({ storage_path, active: true })
      .select()
      .single();

    if (insertError) throw insertError;

    logAudit("hero_video_updated", { storage_path }, req);
    return res.status(200).json({ hero_video: data });
  } catch (err) {
    console.error("[api/admin/hero-video] error:", err);
    return res.status(500).json({ error: "internal_error" });
  }
}
