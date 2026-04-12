import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-beach.jpg";

const HeroSection = () => {
  const scrollTo = (id: string) =>
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="accueil" className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <img
        src={heroImage}
        alt="Vue aérienne de la plage VIP Coco Beach avec eau turquoise et parasols"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1080}
      />
      <div
        className="absolute inset-0"
        style={{ background: "var(--gradient-hero-overlay)" }}
      />

      {/* Season badge */}
      <div className="absolute top-24 md:top-28 left-1/2 -translate-x-1/2 z-10">
        <span className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-md rounded-full px-4 py-2 text-sm font-medium text-foreground">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Saison 2025 — Ouvert
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-4"
          style={{ color: "#fff" }}
        >
          VIP Coco Beach
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl font-medium mb-2"
          style={{ color: "rgba(255,255,255,0.9)" }}
        >
          Restaurant & Plage Privée — Ghar el Melh, Bizerte
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-base md:text-lg max-w-2xl mx-auto mb-8"
          style={{ color: "rgba(255,255,255,0.75)" }}
        >
          Plage accessible uniquement par bateaux. Vivez une expérience unique
          pieds dans l'eau avec nos forfaits tout-compris.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button variant="sand" size="xl" onClick={() => scrollTo("#contact")}>
            Réserver Maintenant
          </Button>
          <Button variant="hero-outline" size="xl" onClick={() => scrollTo("#forfaits")}>
            Découvrir nos Forfaits
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={() => scrollTo("#about")}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-slow"
        aria-label="Défiler vers le bas"
      >
        <ChevronDown size={32} style={{ color: "rgba(255,255,255,0.7)" }} />
      </button>
    </section>
  );
};

export default HeroSection;
