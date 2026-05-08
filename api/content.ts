import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAnonClient } from "./_lib/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  try {
    const supabase = getAnonClient();

    const [siteTextRes, forfaitsRes, supplementsRes, faqRes, heroVideoRes, galleryRes] =
      await Promise.all([
        supabase.schema("coco_beach").from("site_text").select("key, value"),
        supabase
          .schema("coco_beach")
          .from("forfaits")
          .select("*")
          .eq("active", true)
          .order("display_order"),
        supabase
          .schema("coco_beach")
          .from("supplements")
          .select("*")
          .eq("active", true)
          .order("category")
          .order("display_order"),
        supabase
          .schema("coco_beach")
          .from("faq")
          .select("*")
          .eq("active", true)
          .order("display_order"),
        supabase
          .schema("coco_beach")
          .from("hero_video")
          .select("storage_path")
          .eq("active", true)
          .limit(1)
          .maybeSingle(),
        supabase
          .schema("coco_beach")
          .from("gallery_images")
          .select("id, storage_path, alt_fr, alt_ar, display_order")
          .eq("active", true)
          .order("display_order"),
      ]);

    if (siteTextRes.error) throw siteTextRes.error;
    if (forfaitsRes.error) throw forfaitsRes.error;
    if (supplementsRes.error) throw supplementsRes.error;
    if (faqRes.error) throw faqRes.error;
    if (heroVideoRes.error) throw heroVideoRes.error;
    // gallery errors are non-fatal — fall back to empty array so public site still loads
    if (galleryRes.error) {
      console.warn("[api/content] gallery_images error (non-fatal):", galleryRes.error.message);
    }

    // Build site_text map
    const site_text: Record<string, string> = {};
    for (const row of siteTextRes.data ?? []) {
      site_text[row.key] = row.value;
    }

    res.setHeader(
      "Cache-Control",
      "public, max-age=60, s-maxage=300, stale-while-revalidate=86400"
    );

    return res.status(200).json({
      site_text,
      forfaits: forfaitsRes.data ?? [],
      supplements: supplementsRes.data ?? [],
      faq: faqRes.data ?? [],
      hero_video: heroVideoRes.data ?? null,
      gallery_images: galleryRes.data ?? [],
    });
  } catch (err) {
    console.error("[api/content] error:", err);
    return res.status(500).json({ error: "internal_error" });
  }
}
