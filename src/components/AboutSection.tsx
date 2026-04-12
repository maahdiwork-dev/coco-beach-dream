import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Anchor, Waves, UtensilsCrossed } from "lucide-react";
import galleryImg from "@/assets/gallery-1.jpg";

const features = [
  { icon: Anchor, title: "Accès par Bateau", desc: "Traversée depuis le port de Ghar el Melh" },
  { icon: Waves, title: "Plage Privée", desc: "Eaux turquoise cristallines et sable fin" },
  { icon: UtensilsCrossed, title: "Cuisine Raffinée", desc: "Saveurs méditerranéennes pieds dans l'eau" },
];

const AboutSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="section-padding bg-warm-cream" ref={ref}>
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="relative rounded-2xl overflow-hidden aspect-[4/3]"
          >
            <img
              src={galleryImg}
              alt="Restaurant VIP Coco Beach avec tables en bord de mer"
              className="w-full h-full object-cover"
              loading="lazy"
              width={800}
              height={600}
            />
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h2 className="section-title mb-6">À Propos</h2>
            <p className="text-muted-foreground leading-relaxed mb-8 text-base md:text-lg">
              VIP Coco Beach est un restaurant d'exception niché sur la plage privée de
              Coco Beach, à Ghar el Melh dans la région de Bizerte. Accessible uniquement
              par bateau, notre paradis préservé vous offre une évasion unique loin du
              tumulte quotidien. Profitez d'un cadre idyllique pieds dans l'eau, d'une
              cuisine méditerranéenne raffinée et d'un service attentionné pour une journée
              inoubliable entre amis ou en famille.
            </p>

            <div className="grid sm:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <f.icon className="text-primary" size={24} />
                  </div>
                  <h3 className="font-heading font-semibold text-sm mb-1">{f.title}</h3>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
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
