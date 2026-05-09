import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { requireAdmin } from "../_lib/auth";
import { getServiceClient } from "../_lib/supabase";
import { logAudit } from "../_lib/audit";

// _ar fields are optional on create — owner is allowed to skip AR translations.
// Public-site components fall back to the FR field when AR is empty.
const createSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  display_order: z.number().int().optional(),
  name_fr: z.string().min(1),
  name_ar: z.string().optional().default(""),
  price_fr: z.string().min(1),
  price_ar: z.string().optional().default(""),
  items_fr: z.array(z.string()).min(1),
  items_ar: z.array(z.string()).optional().default([]),
  active: z.boolean().optional().default(true),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAdmin(req, res)) return;

  const supabase = getServiceClient();

  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .schema("coco_beach")
        .from("forfaits")
        .select("*")
        .order("display_order");

      if (error) throw error;
      return res.status(200).json({ forfaits: data });
    } catch (err) {
      console.error("[api/admin/forfaits GET] error:", err);
      return res.status(500).json({ error: "internal_error" });
    }
  }

  if (req.method === "POST") {
    try {
      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "validation_error", message: parsed.error.message });
      }

      const { data, error } = await supabase
        .schema("coco_beach")
        .from("forfaits")
        .insert(parsed.data)
        .select()
        .single();

      if (error) throw error;

      logAudit("forfait_created", { id: data.id, slug: data.slug }, req);
      return res.status(201).json({ forfait: data });
    } catch (err) {
      console.error("[api/admin/forfaits POST] error:", err);
      return res.status(500).json({ error: "internal_error" });
    }
  }

  return res.status(405).json({ error: "method_not_allowed" });
}
