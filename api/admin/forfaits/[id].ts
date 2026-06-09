import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { requireAdmin } from "../../_lib/auth";
import { getServiceClient } from "../../_lib/supabase";
import { logAudit } from "../../_lib/audit";

// _ar fields accept empty strings/arrays — owner is allowed to skip AR
// translations per the walkthrough doc. Public-site components fall back to
// the FR field when AR is empty.
const patchSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  display_order: z.number().int().optional(),
  name_fr: z.string().min(1).optional(),
  name_ar: z.string().optional(),
  price_fr: z.string().min(1).optional(),
  price_ar: z.string().optional(),
  items_fr: z.array(z.string()).min(1).optional(),
  items_ar: z.array(z.string()).optional(),
  active: z.boolean().optional(),
}).strict();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAdmin(req, res)) return;

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "bad_request", message: "id requis" });
  }

  const supabase = getServiceClient();

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
        .from("forfaits")
        .update({ ...parsed.data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      logAudit("forfait_updated", { id, fields: Object.keys(parsed.data) }, req);
      return res.status(200).json({ forfait: data });
    } catch (err) {
      console.error("[api/admin/forfaits/[id] PATCH] error:", err);
      return res.status(500).json({ error: "internal_error" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { error } = await supabase
        .schema("coco_beach")
        .from("forfaits")
        .update({ active: false, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      logAudit("forfait_deactivated", { id }, req);
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error("[api/admin/forfaits/[id] DELETE] error:", err);
      return res.status(500).json({ error: "internal_error" });
    }
  }

  return res.status(405).json({ error: "method_not_allowed" });
}
