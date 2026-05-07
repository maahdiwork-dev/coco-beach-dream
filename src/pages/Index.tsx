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

const Index = () => (
  <>
    <Navbar />
    <main>
      <HeroSection />
      <AboutSection />
      <StatsSection />
      <ForfaitsSection />
      <SupplementsSection />
      <GallerySection />
      <TestimonialsSection />
      <LocationSection />
      <FAQSection />
      <ContactSection />
    </main>
    <FooterSection />
    <WhatsAppButton />
    <ScrollToTop />
  </>
);

export default Index;
