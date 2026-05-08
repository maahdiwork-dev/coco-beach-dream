import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { content, type Lang } from "@/data/content";
import { getWhatsAppBookingLink } from "@/lib/booking";

type NavbarProps = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const Navbar = ({ lang, setLang }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = content[lang];
  const navLinks = [
    { label: t.nav.accueil, href: "#accueil" },
    { label: t.nav.forfaits, href: "#forfaits" },
    { label: t.nav.supplements, href: "#supplements" },
    { label: t.nav.galerie, href: "#galerie" },
    { label: t.nav.contact, href: "#contact" },
  ];
  const waLink = getWhatsAppBookingLink(lang);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = (href: string) => {
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass-navbar shadow-sm" : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto flex items-center justify-between h-16 md:h-20 px-4">
        <a
          href="#accueil"
          onClick={(e) => { e.preventDefault(); handleClick("#accueil"); }}
          className="font-heading text-xl md:text-2xl font-bold tracking-tight transition-colors"
          style={{ color: scrolled ? "hsl(var(--foreground))" : "#fff" }}
        >
          VIP Coco Beach
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <button
              key={l.href}
              onClick={() => handleClick(l.href)}
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: scrolled ? "hsl(var(--foreground))" : "#fff" }}
            >
              {l.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setLang(lang === "fr" ? "ar" : "fr")}
            className="rounded-full border border-white/40 px-3 py-1 text-xs font-bold transition-colors hover:bg-white/10"
            style={{ color: scrolled ? "hsl(var(--foreground))" : "#fff" }}
            aria-label={lang === "fr" ? "Passer en arabe" : "Passer en français"}
          >
            {lang === "fr" ? "AR" : "FR"}
          </button>
          <Button variant="sand" size="sm" asChild>
            <a href="#contact">
              {t.nav.reserver}
            </a>
          </Button>
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLang(lang === "fr" ? "ar" : "fr")}
            className="rounded-full border border-white/40 px-3 py-1 text-xs font-bold"
            style={{ color: scrolled ? "hsl(var(--foreground))" : "#fff" }}
            aria-label={lang === "fr" ? "Passer en arabe" : "Passer en français"}
          >
            {lang === "fr" ? "AR" : "FR"}
          </button>
          <button
            className="p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? (
              <X size={24} style={{ color: scrolled ? "hsl(var(--foreground))" : "#fff" }} />
            ) : (
              <Menu size={24} style={{ color: scrolled ? "hsl(var(--foreground))" : "#fff" }} />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass-navbar border-t border-border animate-fade-in">
          <div className="flex flex-col gap-2 p-4">
            {navLinks.map((l) => (
              <button
                key={l.href}
                onClick={() => handleClick(l.href)}
                className="text-foreground text-left py-3 px-4 rounded-lg hover:bg-accent transition-colors font-medium"
              >
                {l.label}
              </button>
            ))}
            <Button variant="sand" className="mt-2" asChild>
              <a href="#contact">
                {t.nav.reserver}
              </a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
