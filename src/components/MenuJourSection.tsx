import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import type { Lang } from "@/data/content";
import { useContent } from "@/hooks/useContent";

// ─── Structural labels (fixed, not editable) ──────────────────────────────────

const SECTION_LABELS = {
  fr: {
    entree: "ENTRÉE",
    plat: "PLAT PRINCIPAL (AU CHOIX)",
    accompagnements: "ACCOMPAGNEMENTS",
    dessert: "DESSERT",
    enfant: "MENU ENFANT",
  },
  ar: {
    entree: "الدخلة",
    plat: "الطبق الرئيسي (تختار)",
    accompagnements: "معاهم",
    dessert: "الحلو",
    enfant: "منيو الصغار",
  },
} as const;

// ─── Default content (FR + AR) ────────────────────────────────────────────────

export const MENU_JOUR_DEFAULTS: Record<string, string> = {
  // French
  menu_jour_title_fr: "Menu du Jour",
  menu_jour_entree_fr: "Assortiment de salades variées",
  menu_jour_plat_fr:
    "Pâtes à la sauce rouge aux chevrettes\nPâtes à la sauce blanche aux escalopes de poulet\nRiz",
  menu_jour_accompagnements_fr:
    "Tastira tunisienne\nFrites\nDaurade et crevette grillées ou escalope de poulet (grillée, panée ou cordon bleu)",
  menu_jour_dessert_fr: "Fruits de saison",
  menu_jour_enfant_fr: "Identique au menu adulte, sans entrée ni tastira",

  // Arabic (derja tunisienne)
  menu_jour_title_ar: "منيو اليوم",
  menu_jour_entree_ar: "سلاطة متنوّعة",
  menu_jour_plat_ar:
    "مقرونة حمراء بالكروفات\nمقرونة بيضاء بالاسكالوب\nروز",
  menu_jour_accompagnements_ar:
    "تسطيرة تونسية\nفريت\nدوراد وكروفات مشوي ولا اسكالوب دجاج (مشوي، باني، ولا كوردون بلو)",
  menu_jour_dessert_ar: "غلّة موسمية",
  menu_jour_enfant_ar: "كيف الكبار، من غير دخلة ومن غير تسطيرة",
};

// ─── Helper ────────────────────────────────────────────────────────────────────

function parseLines(raw: string): string[] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

// ─── Component ─────────────────────────────────────────────────────────────────

type MenuJourSectionProps = {
  lang: Lang;
};

const MenuJourSection = ({ lang }: MenuJourSectionProps) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { data } = useContent();

  const st = data?.site_text ?? {};
  const labels = SECTION_LABELS[lang];

  // Read with AR → FR fallback for missing AR keys
  const get = (field: string): string => {
    const key = `menu_jour_${field}_${lang}`;
    const val = st[key] ?? MENU_JOUR_DEFAULTS[key] ?? "";
    if (!val && lang === "ar") {
      const frKey = `menu_jour_${field}_fr`;
      return st[frKey] ?? MENU_JOUR_DEFAULTS[frKey] ?? "";
    }
    return val;
  };

  const title = get("title");
  const entreeLines = parseLines(get("entree"));
  const platLines = parseLines(get("plat"));
  const accompLines = parseLines(get("accompagnements"));
  const dessertLines = parseLines(get("dessert"));
  const enfantText = get("enfant");

  const isRtl = lang === "ar";

  const courses = [
    { label: labels.entree, lines: entreeLines },
    { label: labels.plat, lines: platLines },
    { label: labels.accompagnements, lines: accompLines },
    { label: labels.dessert, lines: dessertLines },
  ];

  return (
    <section
      id="menu-jour"
      className="section-padding bg-warm-cream"
      ref={ref}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="container mx-auto">
        {/* Section title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="section-title">{title}</h2>
          <p className="section-subtitle">
            {lang === "ar"
              ? "قائمة ثابتة يومية — الكل شامل في العرض"
              : "Menu fixe du jour — inclus dans le forfait"}
          </p>
        </motion.div>

        {/* Menu card */}
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="card-premium overflow-hidden"
          >
            {/* Decorative top border */}
            <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

            <div className="p-6 md:p-8 space-y-6">
              {courses.map(({ label, lines }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.15 + 0.1 * i }}
                >
                  {/* Course label — small-caps serif style */}
                  <p
                    className="text-[11px] font-semibold tracking-[0.18em] uppercase text-primary mb-2"
                    style={{ fontVariant: "small-caps" }}
                  >
                    {label}
                  </p>
                  <ul className="space-y-1">
                    {lines.map((line, j) => (
                      <li
                        key={j}
                        className="font-heading text-sm md:text-base text-foreground leading-snug flex items-start gap-2"
                      >
                        {lines.length > 1 && (
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                        )}
                        {line}
                      </li>
                    ))}
                  </ul>

                  {/* Divider (except after last course) */}
                  {i < courses.length - 1 && (
                    <div className="mt-5 border-b border-border/50" />
                  )}
                </motion.div>
              ))}

              {/* Menu Enfant — slightly set apart */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.55 }}
                className="rounded-xl bg-primary/5 border border-primary/15 p-4"
              >
                <p
                  className="text-[11px] font-semibold tracking-[0.18em] uppercase text-primary mb-2"
                  style={{ fontVariant: "small-caps" }}
                >
                  {labels.enfant}
                </p>
                <p className="font-heading text-sm text-foreground leading-snug">
                  {enfantText}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default MenuJourSection;
