import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Umbrella, Home, Star, Ship, Car, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";

const forfaits = [
  {
    name: "Parasol",
    price: "70",
    icon: Umbrella,
    popular: false,
    premium: false,
    desc: "Parasol sur la plage",
  },
  {
    name: "Cabane Sable",
    price: "70",
    icon: Home,
    popular: false,
    premium: false,
    desc: "Cabane de sable",
  },
  {
    name: "Paillote",
    price: "80",
    icon: Home,
    popular: true,
    premium: false,
    desc: "Paillote privée",
  },
  {
    name: "Paillote 1ère Position",
    price: "85",
    icon: Star,
    popular: false,
    premium: true,
    desc: "Paillote en première position (vue mer optimale)",
  },
];

const includes = [
  { icon: Ship, label: "Transfert aller-retour en bateau" },
  { icon: Car, label: "Parking sécurisé" },
  { icon: UtensilsCrossed, label: "Déjeuner complet" },
];

const ForfaitsSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const scrollToContact = () =>
    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="forfaits" className="section-padding" ref={ref}>
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="section-title">Nos Forfaits</h2>
          <p className="section-subtitle">
            Tout compris : transfert en bateau, parking sécurisé, déjeuner complet et installation plage
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {forfaits.map((f, i) => (
            <motion.div
              key={f.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * i }}
              className={`card-premium relative p-6 flex flex-col ${
                f.premium ? "ring-2 ring-secondary" : ""
              }`}
            >
              {f.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  Populaire
                </span>
              )}
              {f.premium && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  Premium
                </span>
              )}

              <div className="flex flex-col items-center text-center mb-6 mt-2">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                  f.premium ? "bg-secondary/10" : "bg-primary/10"
                }`}>
                  <f.icon className={f.premium ? "text-secondary" : "text-primary"} size={28} />
                </div>
                <h3 className="font-heading font-bold text-lg mb-1">{f.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{f.desc}</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-heading text-3xl font-bold text-foreground">{f.price}</span>
                  <span className="text-sm text-muted-foreground">DT / pers.</span>
                </div>
              </div>

              <div className="flex-1 space-y-3 mb-6">
                {includes.map((inc) => (
                  <div key={inc.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <inc.icon size={16} className="text-primary shrink-0" />
                    <span>{inc.label}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <f.icon size={16} className={`shrink-0 ${f.premium ? "text-secondary" : "text-primary"}`} />
                  <span>{f.desc}</span>
                </div>
              </div>

              <span className="inline-block text-center text-[10px] font-medium text-primary bg-primary/5 rounded-full px-3 py-1 mb-3">
                Tout compris
              </span>

              <Button
                variant={f.premium ? "sand" : "ocean"}
                className="w-full"
                onClick={scrollToContact}
              >
                Réserver
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ForfaitsSection;
