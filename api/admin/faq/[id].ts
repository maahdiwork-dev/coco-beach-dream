import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { requireAdmin } from "../../_lib/auth";
import { getServiceClient } from "../../_lib/supabase";
import { logAudit } from "../../_lib/audit";

// _ar fields accept empty strings — owner is allowed to skip AR translations
// per the walkthrough doc. Public-site components fall back to FR when AR is empty.
const patchSchema = z.object({
  display_order: z.number().int().optional(),
  question_fr: z.string().min(1).optional(),
  question_ar: z.string().optional(),
  answer_fr: z.string().min(1).optional(),
  answer_ar: z.string().optional(),
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
        .from("faq")
        .update(parsed.data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      logAudit("faq_updated", { id, fields: Object.keys(parsed.data) }, req);
      return res.status(200).json({ faq: data });
    } catch (err) {
      console.error("[api/admin/faq/[id] PATCH] error:", err);
      return res.status(500).json({ error: "internal_error" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { error } = await supabase
        .schema("coco_beach")
        .from("faq")
        .update({ active: false })
        .eq("id", id);

      if (error) throw error;

      logAudit("faq_deactivated", { id }, req);
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error("[api/admin/faq/[id] DELETE] error:", err);
      return res.status(500).json({ error: "internal_error" });
    }
  }

  return res.status(405).json({ error: "method_not_allowed" });
}
