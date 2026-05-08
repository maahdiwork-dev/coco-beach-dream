import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut, Loader2 } from "lucide-react";
import ForfaitsEditor from "./ForfaitsEditor";
import SupplementsEditor from "./SupplementsEditor";
import FaqEditor from "./FaqEditor";
import SiteTextEditor from "./SiteTextEditor";
import HeroVideoUploader from "./HeroVideoUploader";
import { useContent } from "@/hooks/useContent";

const TABS = [
  { value: "forfaits", label: "Forfaits" },
  { value: "supplements", label: "Suppléments" },
  { value: "faq", label: "FAQ" },
  { value: "site-text", label: "Texte du site" },
  { value: "hero-video", label: "Vidéo Hero" },
] as const;

type AdminDashboardProps = {
  onLogout: () => void;
};

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("forfaits");
  const { data: contentData } = useContent();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    } finally {
      setLoggingOut(false);
      onLogout();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div>
            <span className="font-heading font-bold text-lg">Coco Beach</span>
            <span className="ml-2 text-xs text-muted-foreground">Tableau de bord</span>
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
            Déconnexion
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Mobile: select instead of tab row */}
        <div className="block sm:hidden mb-4">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TABS.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Desktop tab bar */}
          <TabsList className="hidden sm:flex w-full mb-6">
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="flex-1">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="forfaits">
            <ForfaitsEditor />
          </TabsContent>

          <TabsContent value="supplements">
            <SupplementsEditor />
          </TabsContent>

          <TabsContent value="faq">
            <FaqEditor />
          </TabsContent>

          <TabsContent value="site-text">
            <SiteTextEditor />
          </TabsContent>

          <TabsContent value="hero-video">
            <HeroVideoUploader currentStoragePath={contentData?.hero_video?.storage_path ?? null} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
