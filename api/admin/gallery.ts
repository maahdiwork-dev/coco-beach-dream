import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { requireAdmin } from "../_lib/auth";
import { getServiceClient } from "../_lib/supabase";
import { logAudit } from "../_lib/audit";

// ---------------------------------------------------------------------------
// /api/admin/gallery — handles both collection and item-level operations
//
// Collection (no ?id param):
//   GET  — list all images including inactive
//   POST — create a new row from existing storage_path
//
// Item (?id=<uuid>):
//   PATCH  — update display_order, alt text, active flag
//   DELETE — hard delete + remove from storage bucket
// ---------------------------------------------------------------------------

const patchSchema = z.object({
  display_order: z.number().int().optional(),
  alt_fr: z.string().optional(),
  alt_ar: z.string().optional(),
  active: z.boolean().optional(),
}).strict();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAdmin(req, res)) return;

  const supabase = getServiceClient();
  const id = req.query.id as string | undefined;

  // ---------------------------------------------------------------------------
  // Collection routes — no id param
  // ---------------------------------------------------------------------------

  if (!id) {
    // GET /api/admin/gallery — list all (including inactive)
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

    // POST /api/admin/gallery — create row from existing storage_path
    if (req.method === "POST") {
      const { storage_path, alt_fr, alt_ar } = req.body ?? {};
      if (!storage_path) {
        return res.status(400).json({ error: "bad_request", message: "storage_path requis" });
      }
      try {
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

  // ---------------------------------------------------------------------------
  // Item routes — id param present
  // ---------------------------------------------------------------------------

  // PATCH /api/admin/gallery?id=<uuid>
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
      console.error("[api/admin/gallery PATCH] error:", err);
      return res.status(500).json({ error: "internal_error" });
    }
  }

  // DELETE /api/admin/gallery?id=<uuid>
  if (req.method === "DELETE") {
    try {
      const { data: row, error: fetchError } = await supabase
        .schema("coco_beach")
        .from("gallery_images")
        .select("storage_path")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Remove from storage bucket (best-effort)
      if (row?.storage_path && !row.storage_path.startsWith("http")) {
        const { error: storageError } = await supabase.storage
          .from("coco-beach-public")
          .remove([row.storage_path]);
        if (storageError) {
          console.warn("[api/admin/gallery DELETE] storage remove warning:", storageError.message);
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
      console.error("[api/admin/gallery DELETE] error:", err);
      return res.status(500).json({ error: "internal_error" });
    }
  }

  return res.status(405).json({ error: "method_not_allowed" });
}
