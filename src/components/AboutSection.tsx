import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import galleryImg from "@/assets/gallery-1.jpg";
import type { Lang } from "@/data/content";
import { useContent } from "@/hooks/useContent";
import { getIcon } from "@/lib/about-icons";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

function buildImageUrl(raw?: string): string {
  if (!raw) return "";
  if (raw.startsWith("http")) return raw;
  if (raw.startsWith("/")) return raw;
  return `${SUPABASE_URL}/storage/v1/object/public/coco-beach-public/${raw}`;
}

// ─── Default values ────────────────────────────────────────────────────────────

const ABOUT_DEFAULT_FR =
  "VIP Coco Beach est un restaurant d'exception niché sur la plage privée de " +
  "Coco Beach, à Ghar el Melh dans la région de Bizerte. Accessible uniquement " +
  "par bateau, notre paradis préservé vous offre une évasion unique loin du " +
  "tumulte quotidien. Profitez d'un cadre idyllique pieds dans l'eau, d'une " +
  "cuisine méditerranéenne raffinée et d'un service attentionné pour une journée " +
  "inoubliable entre amis ou en famille.";

const ABOUT_DEFAULT_AR =
  "VIP Coco Beach مطعم استثنائي يقع على الشاطئ الخاص لـ Coco Beach في غار الملح " +
  "بمنطقة بنزرت. لا يمكن الوصول إليه إلا بالقارب، يمنحك هذا الملجأ الطبيعي الهادئ " +
  "فرصة هروب فريدة بعيدًا عن صخب الحياة اليومية. استمتع بإطار خلاب مع أقدامك في الماء، " +
  "ومأكولات بحر أبيض متوسط راقية وخدمة متميزة لقضاء يوم لا يُنسى مع الأصدقاء أو العائلة.";

// Feature hardcoded fallbacks
const FEAT_DEFAULTS = [
  {
    icon: "anchor",
    title_fr: "Accès par Bateau",
    title_ar: "الوصول بالقارب",
    desc_fr: "Traversée depuis le port de Ghar el Melh",
    desc_ar: "رحلة عبور من ميناء غار الملح",
  },
  {
    icon: "waves",
    title_fr: "Plage Privée",
    title_ar: "شاطئ خاص",
    desc_fr: "Eaux turquoise cristallines et sable fin",
    desc_ar: "مياه فيروزية صافية ورمال ناعمة",
  },
  {
    icon: "utensils",
    title_fr: "Cuisine Raffinée",
    title_ar: "مطبخ راقٍ",
    desc_fr: "Saveurs méditerranéennes pieds dans l'eau",
    desc_ar: "نكهات متوسطية وأقدامك في الماء",
  },
];

export const ABOUT_DEFAULTS: Record<string, string> = {
  about_text_fr: ABOUT_DEFAULT_FR,
  about_text_ar: ABOUT_DEFAULT_AR,
  about_image_url: "",
  // Feature 1
  about_feat1_icon: "anchor",
  about_feat1_title_fr: FEAT_DEFAULTS[0].title_fr,
  about_feat1_title_ar: FEAT_DEFAULTS[0].title_ar,
  about_feat1_desc_fr: FEAT_DEFAULTS[0].desc_fr,
  about_feat1_desc_ar: FEAT_DEFAULTS[0].desc_ar,
  // Feature 2
  about_feat2_icon: "waves",
  about_feat2_title_fr: FEAT_DEFAULTS[1].title_fr,
  about_feat2_title_ar: FEAT_DEFAULTS[1].title_ar,
  about_feat2_desc_fr: FEAT_DEFAULTS[1].desc_fr,
  about_feat2_desc_ar: FEAT_DEFAULTS[1].desc_ar,
  // Feature 3
  about_feat3_icon: "utensils",
  about_feat3_title_fr: FEAT_DEFAULTS[2].title_fr,
  about_feat3_title_ar: FEAT_DEFAULTS[2].title_ar,
  about_feat3_desc_fr: FEAT_DEFAULTS[2].desc_fr,
  about_feat3_desc_ar: FEAT_DEFAULTS[2].desc_ar,
};

// ─── Component ─────────────────────────────────────────────────────────────────

type AboutSectionProps = {
  lang: Lang;
};

const AboutSection = ({ lang }: AboutSectionProps) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { data } = useContent();

  const st = data?.site_text ?? {};

  // Text
  const aboutText =
    st[`about_text_${lang}`] ??
    (lang === "ar" ? ABOUT_DEFAULT_AR : ABOUT_DEFAULT_FR);

  // Image
  const rawImageUrl = st["about_image_url"] ?? "";
  const imageUrl = buildImageUrl(rawImageUrl);

  // Features — read from DB with per-item fallbacks
  const features = ([1, 2, 3] as const).map((i) => {
    const d = FEAT_DEFAULTS[i - 1];
    const iconName = st[`about_feat${i}_icon`] ?? d.icon;
    const title = st[`about_feat${i}_title_${lang}`] ?? (lang === "ar" ? d.title_ar : d.title_fr);
    const desc = st[`about_feat${i}_desc_${lang}`] ?? (lang === "ar" ? d.desc_ar : d.desc_fr);
    const Icon = getIcon(iconName);
    return { Icon, title, desc };
  });

  return (
    <section id="about" className="py-20 md:py-28 bg-warm-cream" ref={ref}>
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-14 lg:gap-20 items-center">
          {/* Image column — slightly wider + generous padding */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="relative rounded-2xl overflow-hidden aspect-[4/3] lg:pr-2"
          >
            <img
              src={imageUrl || galleryImg}
              alt="Restaurant VIP Coco Beach avec tables en bord de mer"
              className="w-full h-full object-cover"
              loading="lazy"
              width={800}
              height={600}
            />
          </motion.div>

          {/* Text column */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="py-4"
          >
            <h2 className="section-title mb-8">À Propos</h2>
            <p className="text-muted-foreground leading-relaxed mb-10 text-base md:text-lg">
              {aboutText}
            </p>

            <div className="grid sm:grid-cols-3 gap-8">
              {features.map(({ Icon, title, desc }, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-primary" size={26} />
                  </div>
                  <h3 className="font-heading font-semibold text-sm mb-2">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
