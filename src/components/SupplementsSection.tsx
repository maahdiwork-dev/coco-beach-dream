import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Flame, Fish, UtensilsCrossed, Soup, Salad, ChefHat } from "lucide-react";

const items = [
  { name: "Grillades Mixtes", price: "130", icon: Flame, highlight: true },
  { name: "Crevettes Grillées", price: "45", icon: Fish },
  { name: "Pâtes aux Fruits de Mer (sauce rouge)", price: "50", icon: UtensilsCrossed },
  { name: "Pâtes à l'Escalope (sauce blanche)", price: "35", icon: UtensilsCrossed },
  { name: "Ojja aux Fruits de Mer", price: "35", icon: Soup },
  { name: "Assiette de Fruits de Saison", price: "45", icon: Salad },
  { name: "Plat de Déjeuner Complet", price: "45", icon: ChefHat },
  { name: "Escalope à la Crème (+ riz)", price: "35", icon: ChefHat },
];

const sides = [
  { name: "Plat Frites", price: "8" },
  { name: "Salade", price: "10" },
];

const SupplementsSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="supplements" className="section-padding bg-accent/30" ref={ref}>
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="section-title">Suppléments à la Carte</h2>
          <p className="section-subtitle">
            En plus du déjeuner inclus dans nos forfaits, profitez de notre carte de plats grillés et fruits de mer
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {items.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.05 * i }}
                className={`card-premium p-4 flex items-center gap-4 ${
                  item.highlight ? "ring-2 ring-secondary" : ""
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  item.highlight ? "bg-secondary/10" : "bg-primary/10"
                }`}>
                  <item.icon className={item.highlight ? "text-secondary" : "text-primary"} size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold text-sm md:text-base leading-tight">
                    {item.name}
                  </h3>
                </div>
                <div className="flex items-baseline gap-1 shrink-0">
                  <span className="font-heading text-xl font-bold text-foreground">{item.price}</span>
                  <span className="text-xs text-muted-foreground">DT</span>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="card-premium p-5"
          >
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
              Accompagnements
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              {sides.map((s) => (
                <div key={s.name} className="flex items-baseline gap-2">
                  <span className="font-medium">{s.name}</span>
                  <span className="font-heading font-bold text-foreground">{s.price} DT</span>
                </div>
              ))}
            </div>
          </motion.div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Prix indiqués en Dinars Tunisiens. Carte susceptible de modifications selon arrivage.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SupplementsSection;
