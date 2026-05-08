import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { content, type Lang } from "@/data/content";
import { getWhatsAppBookingLink } from "@/lib/booking";

type HeroSectionProps = {
  lang: Lang;
};

const HeroSection = ({ lang }: HeroSectionProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const t = content[lang];
  const waLink = getWhatsAppBookingLink(lang);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    void video.play().catch(() => {
      // Muted autoplay can still be blocked on some devices; tapping the hero retries playback.
    });
  }, []);

  const handleVideoClick = () => {
    const video = videoRef.current;
    if (!video || !video.paused) return;
    void video.play();
  };

  return (
    <section id="accueil" className="relative h-screen min-h-[600px] w-full overflow-hidden bg-black">
      <video
        ref={videoRef}
        src="/assets/vip-2026/01_hero_aerial_DNlbbQhsK2V.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onClick={handleVideoClick}
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden="true"
      />

      <div className="absolute inset-0 bg-black/35" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
        <h1 className="max-w-5xl text-5xl font-bold leading-tight sm:text-6xl md:text-7xl">
          {t.heroTitle}
        </h1>
        <p className="mt-4 max-w-3xl text-xl font-medium md:text-2xl">{t.heroSub}</p>
        <Button variant="sand" size="xl" asChild className="mt-8">
          <a href="#contact">
            {t.nav.reserver}
          </a>
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;
