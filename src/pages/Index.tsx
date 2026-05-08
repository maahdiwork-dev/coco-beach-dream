import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import StatsSection from "@/components/StatsSection";
import ForfaitsSection from "@/components/ForfaitsSection";
import SupplementsSection from "@/components/SupplementsSection";
import GallerySection from "@/components/GallerySection";
import TestimonialsSection from "@/components/TestimonialsSection";
import LocationSection from "@/components/LocationSection";
import FAQSection from "@/components/FAQSection";
import ContactSection from "@/components/ContactSection";
import FooterSection from "@/components/FooterSection";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";
import type { Lang } from "@/data/content";

const Index = () => {
  const [lang, setLang] = useState<Lang>("fr");

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  return (
    <div lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
      <Navbar lang={lang} setLang={setLang} />
      <main>
        <HeroSection lang={lang} />
        <AboutSection lang={lang} />
        <StatsSection lang={lang} />
        <ForfaitsSection lang={lang} />
        <SupplementsSection lang={lang} />
        <GallerySection lang={lang} />
        <TestimonialsSection lang={lang} />
        <LocationSection lang={lang} />
        <FAQSection lang={lang} />
        <ContactSection lang={lang} />
      </main>
      <FooterSection lang={lang} />
      <WhatsAppButton lang={lang} />
      <ScrollToTop />
    </div>
  );
};

export default Index;
