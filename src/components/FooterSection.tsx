import { Instagram } from "lucide-react";
import { content, type Lang } from "@/data/content";

type FooterSectionProps = {
  lang: Lang;
};

const FooterSection = ({ lang }: FooterSectionProps) => {
  const t = content[lang];
  const links = [
    { label: t.nav.accueil, href: "#accueil" },
    { label: t.nav.forfaits, href: "#forfaits" },
    { label: t.nav.galerie, href: "#galerie" },
    { label: t.nav.contact, href: "#contact" },
  ];
  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-foreground py-12 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-heading text-xl font-bold text-background mb-2">VIP Coco Beach</h3>
            <p className="text-background/60 text-sm">
              {t.heroSub}
            </p>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-background mb-3 text-sm">Liens Rapides</h4>
            <div className="flex flex-col gap-2">
              {links.map((l) => (
                <button
                  key={l.href}
                  onClick={() => scrollTo(l.href)}
                  className="text-background/60 text-sm text-left hover:text-background transition-colors"
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-background mb-3 text-sm">Contact</h4>
            <p className="text-background/60 text-sm mb-1">+216 56 530 516</p>
            <p className="text-background/60 text-sm mb-3">vipcoucoubeach1@gmail.com</p>
            <div className="flex gap-3">
              <a href="https://www.instagram.com/vipcoucoubeach/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-background/60 hover:text-background transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-background/10 pt-6 text-center">
          <p className="text-background/40 text-xs">© 2026 VIP Coco Beach — Tous droits réservés</p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
