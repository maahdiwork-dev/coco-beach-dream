import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Umbrella, Home, Star, Ship, Car, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { content, type Lang } from "@/data/content";
import { getWhatsAppBookingLink } from "@/lib/booking";
import { useContent, type Forfait } from "@/hooks/useContent";

const icons = [Umbrella, Home, Home, Star];
const itemIcons = [Ship, Car, UtensilsCrossed, Star];

type ForfaitsSectionProps = {
  lang: Lang;
};

const ForfaitsSection = ({ lang }: ForfaitsSectionProps) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { data } = useContent();
  const t = content[lang];
  const waLink = getWhatsAppBookingLink(lang);

  const forfaitsTitle = data?.site_text[`forfaits_title_${lang}`] ?? t.forfaitsTitle;
  const forfaitsNote = data?.site_text[`forfaits_note_${lang}`] ?? t.forfaitsNote;

  // Build display packages from DB data or fall back to static content.ts
  const packages: Array<{ name: string; price: string; items: string[] }> =
    data?.forfaits && data.forfaits.length > 0
      ? data.forfaits.map((f: Forfait) => ({
          name: lang === "ar" ? f.name_ar : f.name_fr,
          price: lang === "ar" ? f.price_ar : f.price_fr,
          items: lang === "ar" ? (f.items_ar ?? []) : (f.items_fr ?? []),
        }))
      : t.packages.map((p) => ({ name: p.name, price: p.price, items: [...p.items] }));

  return (
    <section id="forfaits" className="section-padding" ref={ref}>
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="section-title">{forfaitsTitle}</h2>
          <p className="section-subtitle">
            {forfaitsNote}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((f, i) => {
            const PackageIcon = icons[i] ?? Umbrella;
            const premium = i === 3;
            const popular = i === 2;

            return (
            <motion.div
              key={f.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * i }}
              className={`card-premium relative overflow-visible p-6 flex flex-col ${
                premium ? "ring-2 ring-secondary" : ""
              }`}
            >
              {popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  Populaire
                </span>
              )}
              {premium && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  Premium
                </span>
              )}

              <div className="flex flex-col items-center text-center mb-6 mt-2">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                  premium ? "bg-secondary/10" : "bg-primary/10"
                }`}>
                  <PackageIcon className={premium ? "text-secondary" : "text-primary"} size={28} />
                </div>
                <h3 className="font-heading font-bold text-lg mb-1">{f.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="font-heading text-3xl font-bold text-foreground">{f.price}</span>
                </div>
              </div>

              <div className="flex-1 space-y-3 mb-6">
                {f.items.map((item, itemIndex) => {
                  const ItemIcon = itemIcons[itemIndex] ?? Star;

                  return (
                  <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ItemIcon size={16} className="text-primary shrink-0" />
                    <span>{item}</span>
                  </div>
                  );
                })}
              </div>

              <span className="inline-block text-center text-[10px] font-medium text-primary bg-primary/5 rounded-full px-3 py-1 mb-3">
                Tout compris
              </span>

              <Button
                variant={premium ? "sand" : "ocean"}
                className="w-full"
                asChild
              >
                <a href="#contact">
                  {t.nav.reserver}
                </a>
              </Button>
            </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ForfaitsSection;
