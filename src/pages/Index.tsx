import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import StatsSection from "@/components/StatsSection";
import ForfaitsSection from "@/components/ForfaitsSection";
import SupplementsSection from "@/components/SupplementsSection";
import MenuJourSection from "@/components/MenuJourSection";
import GallerySection from "@/components/GallerySection";
import TestimonialsSection from "@/components/TestimonialsSection";
import LocationSection from "@/components/LocationSection";
import FAQSection from "@/components/FAQSection";
import ContactSection from "@/components/ContactSection";
import FooterSection from "@/components/FooterSection";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";
import type { Lang } from "@/data/content";
import { EditModeProvider } from "@/contexts/EditModeContext";
import EditModeToggle from "@/components/admin/EditModeToggle";
import EditableSection from "@/components/admin/EditableSection";
import ForfaitsEditor from "@/components/admin/ForfaitsEditor";
import SupplementsEditor from "@/components/admin/SupplementsEditor";
import GalleryEditor from "@/components/admin/GalleryEditor";
import FaqEditor from "@/components/admin/FaqEditor";
import SiteTextEditor from "@/components/admin/SiteTextEditor";
import HeroVideoUploader from "@/components/admin/HeroVideoUploader";
import AboutEditor from "@/components/admin/AboutEditor";
import MenuJourEditor from "@/components/admin/MenuJourEditor";
import { useContent } from "@/hooks/useContent";

const HERO_KEYS = ["hero_title_fr", "hero_title_ar", "hero_sub_fr", "hero_sub_ar"];
const WHATSAPP_KEYS = ["whatsapp_number", "warning_fr", "warning_ar"];

function IndexInner({ lang }: { lang: Lang }) {
  const { data: contentData } = useContent();

  return (
    <>
      <EditableSection
        title="Vidéo & Titre"
        editor={
          <div className="space-y-6">
            <HeroVideoUploader
              currentStoragePath={contentData?.hero_video?.storage_path ?? null}
            />
            <div className="border-t border-border pt-4">
              <SiteTextEditor filterKeys={HERO_KEYS} />
            </div>
          </div>
        }
      >
        <HeroSection lang={lang} />
      </EditableSection>

      <EditableSection
        title="À Propos"
        editor={<AboutEditor />}
      >
        <AboutSection lang={lang} />
      </EditableSection>

      {/* Stats — not editable (computed values) */}
      <StatsSection lang={lang} />

      <EditableSection
        title="Forfaits"
        editor={<ForfaitsEditor />}
      >
        <ForfaitsSection lang={lang} />
      </EditableSection>

      <EditableSection
        title="Suppléments"
        editor={<SupplementsEditor />}
      >
        <SupplementsSection lang={lang} />
      </EditableSection>

      <EditableSection
        title="Menu du Jour"
        editor={<MenuJourEditor />}
      >
        <MenuJourSection lang={lang} />
      </EditableSection>

      <EditableSection
        title="Galerie"
        editor={<GalleryEditor />}
      >
        <GallerySection lang={lang} />
      </EditableSection>

      {/* Testimonials — not editable for v1 */}
      <TestimonialsSection lang={lang} />

      {/* Location — not editable for v1 */}
      <LocationSection lang={lang} />

      <EditableSection
        title="FAQ"
        editor={<FaqEditor />}
      >
        <FAQSection lang={lang} />
      </EditableSection>

      <EditableSection
        title="WhatsApp & Contact"
        editor={<SiteTextEditor filterKeys={WHATSAPP_KEYS} />}
      >
        <ContactSection lang={lang} />
      </EditableSection>
    </>
  );
}

const Index = () => {
  const [lang, setLang] = useState<Lang>("fr");

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  return (
    <EditModeProvider>
      <div lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
        <Navbar lang={lang} setLang={setLang} />
        <main>
          <IndexInner lang={lang} />
        </main>
        <FooterSection lang={lang} />
        <WhatsAppButton lang={lang} />
        <ScrollToTop />
        <EditModeToggle />
      </div>
    </EditModeProvider>
  );
};

export default Index;
