import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Flame, Fish, UtensilsCrossed, Soup, Salad, ChefHat } from "lucide-react";
import { content, type Lang } from "@/data/content";
import { useContent, type Supplement } from "@/hooks/useContent";

type LucideIconComponent = React.ComponentType<{ className?: string; size?: number }>;

const iconMap: Record<string, LucideIconComponent> = {
  flame: Flame,
  fish: Fish,
  "utensils-crossed": UtensilsCrossed,
  soup: Soup,
  salad: Salad,
  "chef-hat": ChefHat,
};

// Static fallback items (matching original SupplementsSection hardcoded data)
const staticItems = [
  { name: "Grillades Mixtes", price: "130", icon: "flame" as const, highlight: true, category: "main" as const },
  { name: "Crevettes Grillées", price: "45", icon: "fish" as const, highlight: false, category: "main" as const },
  { name: "Pâtes aux Fruits de Mer (sauce rouge)", price: "50", icon: "utensils-crossed" as const, highlight: false, category: "main" as const },
  { name: "Pâtes à l'Escalope (sauce blanche)", price: "35", icon: "utensils-crossed" as const, highlight: false, category: "main" as const },
  { name: "Ojja aux Fruits de Mer", price: "35", icon: "soup" as const, highlight: false, category: "main" as const },
  { name: "Assiette de Fruits de Saison", price: "45", icon: "salad" as const, highlight: false, category: "main" as const },
  { name: "Plat de Déjeuner Complet", price: "45", icon: "chef-hat" as const, highlight: false, category: "main" as const },
  { name: "Escalope à la Crème (+ riz)", price: "35", icon: "chef-hat" as const, highlight: false, category: "main" as const },
];

const staticSides = [
  { name: "Plat Frites", price: "8" },
  { name: "Salade", price: "10" },
];

type SupplementsSectionProps = {
  lang: Lang;
};

const SupplementsSection = ({ lang }: SupplementsSectionProps) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { data } = useContent();
  const t = content[lang];

  const supplementsTitle = data?.site_text[`supplements_title_${lang}`] ?? t.supplementsTitle;
  const supplementsSubtitle = data?.site_text[`supplements_subtitle_${lang}`] ?? t.supplementsSubtitle;
  const supplementsSidesLabel = data?.site_text[`supplements_sides_label_${lang}`] ?? t.supplementsSidesLabel;
  const supplementsNote = data?.site_text[`supplements_note_${lang}`] ?? t.supplementsNote;

  const dbSupplements = data?.supplements;
  const hasDbData = dbSupplements && dbSupplements.length > 0;

  const mainItems: Array<{ name: string; price: string; icon: string | null; highlight: boolean }> = hasDbData
    ? dbSupplements.filter((s: Supplement) => s.category === "main")
    : staticItems.filter((s) => s.category === "main");

  const sideItems: Array<{ name: string; price: string }> = hasDbData
    ? dbSupplements.filter((s: Supplement) => s.category === "side")
    : staticSides;

  return (
    <section id="supplements" className="section-padding bg-accent/30" ref={ref}>
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="section-title">{supplementsTitle}</h2>
          <p className="section-subtitle">{supplementsSubtitle}</p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {mainItems.map((item, i) => {
              const IconComponent = item.icon ? (iconMap[item.icon] ?? Flame) : Flame;
              const isHighlight = "highlight" in item ? item.highlight : false;

              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.05 * i }}
                  className={`card-premium p-4 flex items-center gap-4 ${
                    isHighlight ? "ring-2 ring-secondary" : ""
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      isHighlight ? "bg-secondary/10" : "bg-primary/10"
                    }`}
                  >
                    <IconComponent
                      className={isHighlight ? "text-secondary" : "text-primary"}
                      size={20}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold text-sm md:text-base leading-tight">
                      {item.name}
                    </h3>
                  </div>
                  <div className="flex items-baseline gap-1 shrink-0">
                    <span className="font-heading text-xl font-bold text-foreground">
                      {item.price}
                    </span>
                    <span className="text-xs text-muted-foreground">DT</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="card-premium p-5"
          >
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
              {supplementsSidesLabel}
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              {sideItems.map((s) => (
                <div key={s.name} className="flex items-baseline gap-2">
                  <span className="font-medium">{s.name}</span>
                  <span className="font-heading font-bold text-foreground">
                    {s.price} DT
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            {supplementsNote}
          </p>
        </div>
      </div>
    </section>
  );
};

export default SupplementsSection;
