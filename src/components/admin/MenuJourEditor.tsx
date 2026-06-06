import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import { Loader2, Save } from "lucide-react";
import { MENU_JOUR_DEFAULTS } from "@/components/MenuJourSection";

type LangTab = "fr" | "ar";

const ALL_KEYS = Object.keys(MENU_JOUR_DEFAULTS);

export default function MenuJourEditor() {
  const [values, setValues] = useState<Record<string, string>>(MENU_JOUR_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lang, setLang] = useState<LangTab>("fr");

  // Load current site_text on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/content");
        const body = await res.json();
        const map: Record<string, string> = body.site_text ?? {};
        const merged: Record<string, string> = { ...MENU_JOUR_DEFAULTS };
        for (const key of ALL_KEYS) {
          if (key in map) {
            merged[key] = map[key];
          }
        }
        setValues(merged);
      } catch {
        toast("Impossible de charger les données", {
          style: { background: "var(--destructive)", color: "#fff" },
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const set = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const entries = ALL_KEYS.map((key) => ({ key, value: values[key] ?? "" }));
      const res = await fetch("/api/admin/site-text", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ entries }),
      });
      if (res.ok) {
        toast("Enregistré avec succès");
      } else {
        const body = await res.json().catch(() => ({}));
        toast(body.message ?? "Erreur lors de la sauvegarde", {
          style: { background: "var(--destructive)", color: "#fff" },
        });
      }
    } catch {
      toast("Erreur de connexion", {
        style: { background: "var(--destructive)", color: "#fff" },
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
          Chargement…
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  const isAr = lang === "ar";
  const dir = isAr ? "rtl" : "ltr";

  return (
    <div className="relative">
      {/* Sticky save — desktop */}
      <div className="hidden sm:flex items-center justify-between mb-4 sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border pb-3">
        <h3 className="font-heading font-semibold text-lg">Menu du Jour</h3>
        <Button onClick={handleSave} disabled={saving} style={{ backgroundColor: "#0a3d62" }}>
          {saving ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</>
          ) : (
            <><Save className="mr-2 h-4 w-4" />Enregistrer</>
          )}
        </Button>
      </div>

      {/* Language toggle */}
      <div className="flex gap-1 mb-6 p-1 bg-muted rounded-full w-fit">
        <button
          type="button"
          onClick={() => setLang("fr")}
          className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
            lang === "fr"
              ? "bg-[#0a3d62] text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Français
        </button>
        <button
          type="button"
          onClick={() => setLang("ar")}
          className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
            lang === "ar"
              ? "bg-[#0a3d62] text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          العربية
        </button>
      </div>

      <div className="space-y-5 pb-24 sm:pb-4">

        {/* Titre */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            {isAr ? "عنوان القائمة (عربي)" : "Titre du menu (Français)"}
          </Label>
          <Input
            value={values[`menu_jour_title_${lang}`] ?? ""}
            onChange={(e) => set(`menu_jour_title_${lang}`, e.target.value)}
            dir={dir}
          />
        </div>

        {/* Entrée */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            {isAr ? "المقبلات (عربي)" : "Entrée (Français)"}
          </Label>
          <Textarea
            value={values[`menu_jour_entree_${lang}`] ?? ""}
            onChange={(e) => set(`menu_jour_entree_${lang}`, e.target.value)}
            rows={3}
            dir={dir}
          />
        </div>

        {/* Plat principal */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            {isAr ? "الطبق الرئيسي (عربي)" : "Plat principal au choix (Français)"}
          </Label>
          <Textarea
            value={values[`menu_jour_plat_${lang}`] ?? ""}
            onChange={(e) => set(`menu_jour_plat_${lang}`, e.target.value)}
            rows={4}
            dir={dir}
          />
          <p className="text-xs text-muted-foreground">
            {isAr ? "خيار في كل سطر" : "Une option par ligne"}
          </p>
        </div>

        {/* Accompagnements */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            {isAr ? "المرافقات (عربي)" : "Accompagnements (Français)"}
          </Label>
          <Textarea
            value={values[`menu_jour_accompagnements_${lang}`] ?? ""}
            onChange={(e) => set(`menu_jour_accompagnements_${lang}`, e.target.value)}
            rows={4}
            dir={dir}
          />
          <p className="text-xs text-muted-foreground">
            {isAr ? "عنصر في كل سطر" : "Un par ligne"}
          </p>
        </div>

        {/* Dessert */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            {isAr ? "الحلوى (عربي)" : "Dessert (Français)"}
          </Label>
          <Textarea
            value={values[`menu_jour_dessert_${lang}`] ?? ""}
            onChange={(e) => set(`menu_jour_dessert_${lang}`, e.target.value)}
            rows={2}
            dir={dir}
          />
        </div>

        {/* Menu Enfant */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            {isAr ? "قائمة الأطفال (عربي)" : "Menu Enfant (Français)"}
          </Label>
          <Input
            value={values[`menu_jour_enfant_${lang}`] ?? ""}
            onChange={(e) => set(`menu_jour_enfant_${lang}`, e.target.value)}
            dir={dir}
          />
        </div>

      </div>

      {/* Mobile sticky save — bottom */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-20 bg-background/95 backdrop-blur border-t border-border p-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full"
          style={{ backgroundColor: "#0a3d62" }}
        >
          {saving ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</>
          ) : (
            <><Save className="mr-2 h-4 w-4" />Enregistrer</>
          )}
        </Button>
      </div>
    </div>
  );
}
