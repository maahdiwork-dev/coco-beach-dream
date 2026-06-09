import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n").filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")]; })
);
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  db: { schema: "coco_beach" }, auth: { persistSession: false },
});

// 1. Make room: bump paillote → 4, paillote-premiere → 5
await supabase.from("forfaits").update({ display_order: 4 }).eq("slug", "paillote");
await supabase.from("forfaits").update({ display_order: 5 }).eq("slug", "paillote-premiere");

// 2. Insert Cabane Golden VIP at order 3 (idempotent via upsert on slug)
const row = {
  slug: "cabane-golden-vip",
  name_fr: "Cabane Golden VIP",
  name_ar: "Cabane Golden VIP",
  price_fr: "100 DT / pers.",
  price_ar: "100 د / شخص",
  items_fr: ["Transfert aller-retour bateau", "Parking sécurisé", "Déjeuner complet", "Piscine privée"],
  items_ar: ["فلوكة ماشي جاي", "باركينغ مراقب", "فطور كامل", "مسبح خاص"],
  display_order: 3,
  active: true,
};
const r = await supabase.from("forfaits").upsert(row, { onConflict: "slug" });
console.log("insert cabane-golden-vip:", r.error ? r.error.message : "OK");

const { data } = await supabase.from("forfaits").select("slug,name_fr,price_fr,display_order").order("display_order");
console.log("current forfaits:", data?.map((f) => `${f.display_order}. ${f.name_fr} (${f.price_fr})`));
