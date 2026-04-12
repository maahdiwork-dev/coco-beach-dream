import { Instagram } from "lucide-react";

const links = [
  { label: "Accueil", href: "#accueil" },
  { label: "Forfaits", href: "#forfaits" },
  { label: "Galerie", href: "#galerie" },
  { label: "Contact", href: "#contact" },
];

const FooterSection = () => {
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
              Restaurant & Plage Privée — Ghar el Melh, Bizerte
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
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-background/60 hover:text-background transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-background/60 hover:text-background transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-background/10 pt-6 text-center">
          <p className="text-background/40 text-xs">© 2025 VIP Coco Beach — Tous droits réservés</p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
