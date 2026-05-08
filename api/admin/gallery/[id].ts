import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { requireAdmin } from "../../_lib/auth";
import { getServiceClient } from "../../_lib/supabase";
import { logAudit } from "../../_lib/audit";

const patchSchema = z.object({
  display_order: z.number().int().optional(),
  alt_fr: z.string().optional(),
  alt_ar: z.string().optional(),
  active: z.boolean().optional(),
}).strict();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAdmin(req, res)) return;

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "bad_request", message: "id requis" });
  }

  const supabase = getServiceClient();

  // PATCH — reorder, alt text, active toggle
  if (req.method === "PATCH") {
    try {
      const parsed = patchSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "validation_error", message: parsed.error.message });
      }
      if (Object.keys(parsed.data).length === 0) {
        return res.status(400).json({ error: "bad_request", message: "Aucun champ à mettre à jour" });
      }

      const { data, error } = await supabase
        .schema("coco_beach")
        .from("gallery_images")
        .update(parsed.data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      logAudit("gallery_image_updated", { id, fields: Object.keys(parsed.data) }, req);
      return res.status(200).json({ gallery_image: data });
    } catch (err) {
      console.error("[api/admin/gallery/[id] PATCH] error:", err);
      return res.status(500).json({ error: "internal_error" });
    }
  }

  // DELETE — hard delete + remove from storage
  if (req.method === "DELETE") {
    try {
      // Fetch storage_path first so we can remove from bucket
      const { data: row, error: fetchError } = await supabase
        .schema("coco_beach")
        .from("gallery_images")
        .select("storage_path")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Remove from storage bucket (best-effort — don't fail the request if this errors)
      if (row?.storage_path && !row.storage_path.startsWith("http")) {
        const { error: storageError } = await supabase.storage
          .from("coco-beach-public")
          .remove([row.storage_path]);
        if (storageError) {
          console.warn("[api/admin/gallery/[id] DELETE] storage remove warning:", storageError.message);
        }
      }

      const { error: deleteError } = await supabase
        .schema("coco_beach")
        .from("gallery_images")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      logAudit("gallery_image_deleted", { id, storage_path: row?.storage_path }, req);
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error("[api/admin/gallery/[id] DELETE] error:", err);
      return res.status(500).json({ error: "internal_error" });
    }
  }

  return res.status(405).json({ error: "method_not_allowed" });
}
