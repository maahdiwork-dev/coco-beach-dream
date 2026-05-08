import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import { Loader2, Save } from "lucide-react";

type Entry = { key: string; value: string };

const MULTILINE_KEYS = new Set([
  "hero_sub_fr",
  "hero_sub_ar",
  "forfaits_note_fr",
  "forfaits_note_ar",
  "supplements_subtitle_fr",
  "supplements_subtitle_ar",
  "supplements_note_fr",
  "supplements_note_ar",
  "warning_fr",
  "warning_ar",
]);

const KEY_LABELS: Record<string, string> = {
  hero_title_fr: "Titre héro (FR)",
  hero_title_ar: "Titre héro (AR)",
  hero_sub_fr: "Sous-titre héro (FR)",
  hero_sub_ar: "Sous-titre héro (AR)",
  warning_fr: "Avertissement (FR)",
  warning_ar: "Avertissement (AR)",
  forfaits_title_fr: "Titre forfaits (FR)",
  forfaits_title_ar: "Titre forfaits (AR)",
  forfaits_note_fr: "Note forfaits (FR)",
  forfaits_note_ar: "Note forfaits (AR)",
  supplements_title_fr: "Titre suppléments (FR)",
  supplements_title_ar: "Titre suppléments (AR)",
  supplements_subtitle_fr: "Sous-titre suppléments (FR)",
  supplements_subtitle_ar: "Sous-titre suppléments (AR)",
  supplements_sides_label_fr: "Label accompagnements (FR)",
  supplements_sides_label_ar: "Label accompagnements (AR)",
  supplements_note_fr: "Note suppléments (FR)",
  supplements_note_ar: "Note suppléments (AR)",
  rating_fr: "Note Google (FR)",
  rating_ar: "Note Google (AR)",
  avis_title_fr: "Titre avis (FR)",
  avis_title_ar: "Titre avis (AR)",
  whatsapp_number: "Numéro WhatsApp",
  formspree_id: "ID Formspree",
};

export default function SiteTextEditor() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/content");
        const body = await res.json();
        const map: Record<string, string> = body.site_text ?? {};
        setEntries(Object.entries(map).map(([key, value]) => ({ key, value })));
      } catch {
        toast("Impossible de charger les textes", { style: { background: "var(--destructive)", color: "#fff" } });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (key: string, value: string) => {
    setEntries((prev) => prev.map((e) => (e.key === key ? { ...e, value } : e)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
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
        toast(body.message ?? "Erreur lors de la sauvegarde", { style: { background: "var(--destructive)", color: "#fff" } });
      }
    } catch {
      toast("Erreur de connexion", { style: { background: "var(--destructive)", color: "#fff" } });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
          Tous les textes du site (titre, sous-titre, avertissement, etc.). Modifiez en place et cliquez &lsquo;Enregistrer tout&rsquo;.
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Help text */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800 mb-4">
        Tous les textes du site (titre, sous-titre, avertissement, etc.). Modifiez en place et cliquez &lsquo;Enregistrer tout&rsquo;.
      </div>

      {/* Desktop sticky save — top */}
      <div className="hidden sm:flex items-center justify-between mb-4 sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border pb-3">
        <h3 className="font-heading font-semibold text-lg">Textes du site</h3>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {saving ? "Enregistrement..." : "Enregistrer tout"}
        </Button>
      </div>

      {/* Mobile heading (no sticky) */}
      <div className="sm:hidden mb-4">
        <h3 className="font-heading font-semibold text-lg">Textes du site</h3>
      </div>

      <div className="space-y-4 pb-24 sm:pb-4">
        {/* Special fields first: whatsapp_number, formspree_id */}
        {entries.filter((e) => e.key === "whatsapp_number" || e.key === "formspree_id").map(({ key, value }) => (
          <div key={key} className="space-y-1 rounded-lg bg-amber-50 border border-amber-200 p-3">
            <Label className="text-xs font-semibold text-amber-700">{KEY_LABELS[key] ?? key}</Label>
            <Input
              value={value}
              onChange={(e) => handleChange(key, e.target.value)}
              inputMode={key === "whatsapp_number" ? "tel" : "text"}
              placeholder={key === "whatsapp_number" ? "+21656530516" : "Formspree form ID"}
            />
            <p className="text-xs text-amber-600">
              {key === "whatsapp_number"
                ? "Format international avec indicatif pays. Laissez vide pour masquer le bouton WhatsApp."
                : "L'ID de votre formulaire Formspree. Laissez vide pour afficher un message 'formulaire à venir'."}
            </p>
          </div>
        ))}

        {/* All other fields */}
        {entries.filter((e) => e.key !== "whatsapp_number" && e.key !== "formspree_id").map(({ key, value }) => {
          const label = KEY_LABELS[key] ?? key;
          const isMultiline = MULTILINE_KEYS.has(key);
          const isRtl = key.endsWith("_ar");

          return (
            <div key={key} className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>
              {isMultiline ? (
                <Textarea
                  value={value}
                  onChange={(e) => handleChange(key, e.target.value)}
                  rows={3}
                  dir={isRtl ? "rtl" : "ltr"}
                />
              ) : (
                <Input
                  value={value}
                  onChange={(e) => handleChange(key, e.target.value)}
                  dir={isRtl ? "rtl" : "ltr"}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile sticky save — bottom */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-20 bg-background/95 backdrop-blur border-t border-border p-4">
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {saving ? "Enregistrement..." : "Enregistrer tout"}
        </Button>
      </div>
    </div>
  );
}
