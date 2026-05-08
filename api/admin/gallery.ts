import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "../_lib/auth";
import { getServiceClient } from "../_lib/supabase";
import { logAudit } from "../_lib/audit";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAdmin(req, res)) return;

  const supabase = getServiceClient();

  // GET /api/admin/gallery — list all images including inactive
  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .schema("coco_beach")
        .from("gallery_images")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return res.status(200).json({ gallery_images: data ?? [] });
    } catch (err) {
      console.error("[api/admin/gallery GET] error:", err);
      return res.status(500).json({ error: "internal_error" });
    }
  }

  // POST /api/admin/gallery — create a row from existing storage_path
  if (req.method === "POST") {
    const { storage_path, alt_fr, alt_ar } = req.body ?? {};
    if (!storage_path) {
      return res.status(400).json({ error: "bad_request", message: "storage_path requis" });
    }
    try {
      // Determine next display_order
      const { data: existing } = await supabase
        .schema("coco_beach")
        .from("gallery_images")
        .select("display_order")
        .order("display_order", { ascending: false })
        .limit(1);
      const nextOrder = existing && existing.length > 0 ? (existing[0].display_order ?? 0) + 1 : 0;

      const { data, error } = await supabase
        .schema("coco_beach")
        .from("gallery_images")
        .insert({
          storage_path,
          alt_fr: alt_fr ?? "",
          alt_ar: alt_ar ?? "",
          display_order: nextOrder,
          active: true,
        })
        .select()
        .single();
      if (error) throw error;
      logAudit("gallery_image_created", { storage_path }, req);
      return res.status(201).json({ gallery_image: data });
    } catch (err) {
      console.error("[api/admin/gallery POST] error:", err);
      return res.status(500).json({ error: "internal_error" });
    }
  }

  return res.status(405).json({ error: "method_not_allowed" });
}
