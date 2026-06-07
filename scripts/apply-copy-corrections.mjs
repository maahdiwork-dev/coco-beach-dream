import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

// Load SUPABASE_URL + service role from .env.local
const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")];
    })
);

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  db: { schema: "coco_beach" },
  auth: { persistSession: false },
});

// ─── 1. site_text (FR cleanup + derja) ───────────────────────────────────────
const siteText = {
  hero_title_fr: "VIP Coco Beach — Ghar El Melh",
  hero_sub_fr: "Plage privée, accès uniquement en bateau, à 5 minutes de notre parking sécurisé",
  hero_sub_ar: "شط بريفي توصلو كان بالفلوكة - 5 دقايق من الباركينغ المراقب متاعنا",
  warning_fr: "Pas de taxi à Ghar El Melh, réservation obligatoire",
  warning_ar: "مافماش تاكسي في غار الملح، لازم تحجز قبل",
  forfaits_note_fr: "Tout compris : transfert en bateau, parking sécurisé et déjeuner complet",
  forfaits_note_ar: "الكل شامل: فلوكة ماشي جاي، باركينغ مراقب، وفطور كامل",
  supplements_title_ar: "كارت الزيادات",
  supplements_subtitle_fr: "En plus du déjeuner inclus, découvrez notre carte de grillades et de fruits de mer",
  supplements_subtitle_ar: "فوق الفطور اللي شامل، تنجّم تزيد تطلب من الكارت: مشاوي وفواكه بحر",
  supplements_sides_label_ar: "زيادات",
  supplements_note_fr: "Prix en dinars tunisiens. Carte susceptible de modifications selon les arrivages.",
  supplements_note_ar: "الأسعار بالدينار التونسي. المنيو يتبدّل حسب اللي موجود.",
  about_text_fr: "VIP Coco Beach est un restaurant les pieds dans l'eau, sur notre plage privée à Ghar El Melh, gouvernorat de Bizerte. Accessible uniquement en bateau, c'est un coin préservé loin de l'agitation. Profitez d'un cadre idyllique les pieds dans l'eau, d'une cuisine méditerranéenne savoureuse et d'un service aux petits soins, pour une journée inoubliable en famille ou entre amis.",
  about_text_ar: "VIP Coco Beach ريستو على شطّنا البريفي في كوكو بيتش، غار الملح - بنزرت. توصلو كان بالفلوكة، بلاصة هادية ومحمية بعيدة على الدوشة. تاكل وساقيك في الماء، ماكلة متوسطية بنينة، وخدمة من القلب، باش تعدّي نهار ما يتنساش مع العائلة ولا صحابك.",
  about_feat1_title_fr: "Accès en bateau",
  about_feat1_desc_fr: "Départ du port de Ghar El Melh",
  about_feat1_title_ar: "توصيل بالفلوكة",
  about_feat1_desc_ar: "تخرج من ميناء غار الملح",
  about_feat2_title_fr: "Plage privée",
  about_feat2_desc_fr: "Eau turquoise et sable fin",
  about_feat2_title_ar: "شط بريفي",
  about_feat2_desc_ar: "ماء فيروزي ورملة حرير",
  about_feat3_title_fr: "Cuisine méditerranéenne",
  about_feat3_desc_fr: "Saveurs les pieds dans l'eau",
  about_feat3_title_ar: "ماكلة بنينة",
  about_feat3_desc_ar: "بنّة متوسطية وساقيك في الماء",
};
const stRows = Object.entries(siteText).map(([key, value]) => ({ key, value }));
const st = await supabase.from("site_text").upsert(stRows, { onConflict: "key" });
console.log("site_text:", st.error ? st.error.message : `${stRows.length} rows OK`);

// ─── 2. forfaits items_ar (derja) ────────────────────────────────────────────
const base = ["فلوكة ماشي جاي", "باركينغ مراقب", "فطور كامل"];
const forfaits = {
  parasol: [...base, "مظلة"],
  cabane: [...base, "كبانة رمل"],
  paillote: [...base, "عرّيشة بريفي"],
  "paillote-premiere": [...base, "إطلالة على البحر"],
};
for (const [slug, items_ar] of Object.entries(forfaits)) {
  const r = await supabase.from("forfaits").update({ items_ar }).eq("slug", slug);
  console.log(`forfait ${slug}:`, r.error ? r.error.message : "OK");
}

// ─── 3. faq (FR cleanup + derja) ─────────────────────────────────────────────
const faq = [
  {
    id: "4c30c27e-2e8c-4ae0-8a58-46edeaa59f17",
    question_fr: "Comment venir ?",
    answer_fr: "Parking sécurisé au port de Ghar El Melh, puis traversée de 5 min en bateau incluse.",
    question_ar: "كيفاش نجي؟",
    answer_ar: "باركينغ مراقب في ميناء غار الملح، وبعد تاخو الفلوكة 5 دق ماشي جاي داخلة في السوم. مافماش تاكسي في غار الملح.",
  },
  {
    id: "965c6a12-e32f-4766-b183-8f76c450a176",
    question_fr: "Jet ski ?",
    answer_fr: "Zone de baignade délimitée, jet ski à distance pour la sécurité.",
    question_ar: "جيت سكي؟",
    answer_ar: "منطقة سباحة محمية، الجيت سكي بعيد للأمان.",
  },
  {
    id: "cec04075-add9-4800-bf22-5767a30874b1",
    question_fr: "Le déjeuner inclus quoi ?",
    answer_fr: "Salade, riz, daurade grillée ou poulet, et eau.",
    question_ar: "الفطور فيه شنوّا؟",
    answer_ar: "سلاطة، روز، دوراد مشوية ولا دجاج، وماء.",
  },
  {
    id: "45358a03-52c8-4a96-a8c1-ba1383b471d4",
    question_fr: "Enfants ?",
    answer_fr: "Piscine enfants disponible, tarif réduit sur demande.",
    question_ar: "الصغار؟",
    answer_ar: "عنا بيسين صغار، وأسعار خاصة للصغار على الطلب.",
  },
];
for (const { id, ...fields } of faq) {
  const r = await supabase.from("faq").update(fields).eq("id", id);
  console.log(`faq ${id.slice(0, 8)}:`, r.error ? r.error.message : "OK");
}

console.log("Done.");
