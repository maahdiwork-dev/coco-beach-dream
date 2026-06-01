import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2, Pencil } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ForfaitsEditor from "./ForfaitsEditor";
import SupplementsEditor from "./SupplementsEditor";
import FaqEditor from "./FaqEditor";
import SiteTextEditor from "./SiteTextEditor";
import HeroVideoUploader from "./HeroVideoUploader";
import GalleryEditor from "./GalleryEditor";
import { useContent } from "@/hooks/useContent";

type AdminDashboardProps = {
  onLogout: () => void;
};

const HERO_KEYS = ["hero_title_fr", "hero_title_ar", "hero_sub_fr", "hero_sub_ar"];
const WHATSAPP_KEYS = ["whatsapp_number", "warning_fr", "warning_ar"];

type CardDef = {
  id: string;
  icon: string;
  label: string;
  description: string;
};

const CARDS: CardDef[] = [
  {
    id: "hero",
    icon: "🎬",
    label: "Vidéo & Titre",
    description: "Vidéo principale et textes d'accueil",
  },
  {
    id: "forfaits",
    icon: "🏖️",
    label: "Forfaits",
    description: "Modifier les prix et photos des forfaits",
  },
  {
    id: "supplements",
    icon: "🍽️",
    label: "Suppléments",
    description: "Boissons, accompagnements et extras",
  },
  {
    id: "galerie",
    icon: "📷",
    label: "Galerie",
    description: "Photos et images du site",
  },
  {
    id: "faq",
    icon: "❓",
    label: "FAQ",
    description: "Questions et réponses fréquentes",
  },
  {
    id: "whatsapp",
    icon: "📱",
    label: "WhatsApp & Contact",
    description: "Numéro WhatsApp et message d'avertissement",
  },
];

function SectionCard({
  card,
  children,
}: {
  card: CardDef;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-border/60 p-6 flex flex-col items-center gap-3 transition-transform duration-200 hover:scale-[1.02] hover:shadow-md">
      <span className="text-4xl leading-none select-none">{card.icon}</span>
      <h3 className="font-heading font-bold text-base text-center text-foreground">{card.label}</h3>
      <p className="text-xs text-muted-foreground text-center leading-snug">{card.description}</p>
      <Sheet>
        <SheetTrigger asChild>
          <Button className="mt-2 w-full bg-[#0a3d62] hover:bg-[#0a3d62]/90 text-white gap-2">
            <Pencil className="h-4 w-4" />
            Modifier
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl overflow-y-auto"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="flex items-center gap-2">
              <span>{card.icon}</span>
              <span>{card.label}</span>
            </SheetTitle>
          </SheetHeader>
          {children}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [loggingOut, setLoggingOut] = useState(false);
  const { data: contentData } = useContent();

  useEffect(() => {
    document.title = "Coco Beach — Tableau de bord administrateur";
    return () => {
      document.title =
        "VIP Coco Beach — Restaurant & Plage Privée à Ghar el Melh, Bizerte";
    };
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "logout" }),
      });
    } finally {
      setLoggingOut(false);
      onLogout();
    }
  };

  const whatsappNumber = contentData?.site_text?.whatsapp_number ?? null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header — unchanged */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div>
            <span className="font-heading font-bold text-lg">Coco Beach</span>
            <span className="ml-2 text-xs text-muted-foreground">
              Tableau de bord
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            Se déconnecter
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <p className="text-sm text-muted-foreground mb-6 text-center">
          Sélectionnez une section pour la modifier.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Card 1 — Vidéo & Titre */}
          <SectionCard card={CARDS[0]}>
            <div className="space-y-6">
              <HeroVideoUploader
                currentStoragePath={
                  contentData?.hero_video?.storage_path ?? null
                }
              />
              <div className="border-t border-border pt-4">
                <SiteTextEditor filterKeys={HERO_KEYS} />
              </div>
            </div>
          </SectionCard>

          {/* Card 2 — Forfaits */}
          <SectionCard card={CARDS[1]}>
            <ForfaitsEditor />
          </SectionCard>

          {/* Card 3 — Suppléments */}
          <SectionCard card={CARDS[2]}>
            <SupplementsEditor />
          </SectionCard>

          {/* Card 4 — Galerie */}
          <SectionCard card={CARDS[3]}>
            <GalleryEditor />
          </SectionCard>

          {/* Card 5 — FAQ */}
          <SectionCard card={CARDS[4]}>
            <FaqEditor />
          </SectionCard>

          {/* Card 6 — WhatsApp & Contact */}
          <SectionCard card={CARDS[5]}>
            <div className="space-y-4">
              {whatsappNumber && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                  <p className="text-xs font-semibold text-green-700 mb-0.5">
                    Numéro actuel
                  </p>
                  <p className="text-sm font-mono text-green-900">
                    {whatsappNumber}
                  </p>
                </div>
              )}
              <SiteTextEditor filterKeys={WHATSAPP_KEYS} />
            </div>
          </SectionCard>
        </div>
      </main>
    </div>
  );
}
