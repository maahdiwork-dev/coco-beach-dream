import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star } from "lucide-react";
import { content, type Lang } from "@/data/content";

const reviews = [
  {
    text: "J'ai passé une agréable journée chapeau bas au service qui été serviable endroit propre",
    author: "Ahlem El Jbali",
  },
  {
    text: "Merci pour toute l'équipe VIP vraiment haja top et très professionnel à très bientôt",
    author: "Hatem Trabelsi",
  },
  {
    text: "Un cadre paradisiaque et une équipe au top. Les plats étaient délicieux et le trajet en bateau ajoutait vraiment une touche d'aventure. On recommande vivement!",
    author: "Sarah & Karim",
  },
];

type TestimonialsSectionProps = {
  lang: Lang;
};

const TestimonialsSection = ({ lang }: TestimonialsSectionProps) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const t = content[lang];

  return (
    <section className="section-padding" ref={ref}>
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="section-title">{t.avisTitle}</h2>
          <p className="section-subtitle">Ce que nos clients disent de leur expérience</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {reviews.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="card-premium p-6"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={16} className="fill-secondary text-secondary" />
                ))}
              </div>
              <p className="text-muted-foreground italic leading-relaxed mb-4">"{r.text}"</p>
              <p className="font-heading font-semibold text-sm text-foreground">— {r.author}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
