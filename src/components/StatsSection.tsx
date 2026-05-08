import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { content, type Lang } from "@/data/content";

type StatsSectionProps = {
  lang: Lang;
};

const getStats = (lang: Lang) => [
  { value: "4.6★", label: content[lang].rating },
  { value: "4", label: "Forfaits disponibles" },
  { value: "1", label: "Plage privée" },
  { value: "100%", label: "Satisfaction" },
];

const StatsSection = ({ lang }: StatsSectionProps) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const stats = getStats(lang);

  return (
    <section className="py-16 bg-primary" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className={`font-heading font-bold text-primary-foreground mb-2 ${
                i === 0 ? "text-3xl" : "text-4xl md:text-5xl"
              }`}>
                {s.value}
              </div>
              <div className="text-sm text-primary-foreground/70">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
