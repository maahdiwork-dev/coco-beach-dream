import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { requireAdmin } from "../_lib/auth";
import { getServiceClient } from "../_lib/supabase";
import { logAudit } from "../_lib/audit";

const iconSlugs = ["flame", "fish", "utensils-crossed", "soup", "salad", "chef-hat"] as const;
const categories = ["main", "side"] as const;

const createSchema = z.object({
  display_order: z.number().int().optional(),
  name: z.string().min(1),
  price: z.string().min(1),
  category: z.enum(categories),
  highlight: z.boolean().optional().default(false),
  icon: z.enum(iconSlugs).nullable().optional(),
  active: z.boolean().optional().default(true),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAdmin(req, res)) return;

  const supabase = getServiceClient();

  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .schema("coco_beach")
        .from("supplements")
        .select("*")
        .order("category")
        .order("display_order");

      if (error) throw error;
      return res.status(200).json({ supplements: data });
    } catch (err) {
      console.error("[api/admin/supplements GET] error:", err);
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
        .from("supplements")
        .insert(parsed.data)
        .select()
        .single();

      if (error) throw error;

      logAudit("supplement_created", { id: data.id, name: data.name }, req);
      return res.status(201).json({ supplement: data });
    } catch (err) {
      console.error("[api/admin/supplements POST] error:", err);
      return res.status(500).json({ error: "internal_error" });
    }
  }

  return res.status(405).json({ error: "method_not_allowed" });
}
