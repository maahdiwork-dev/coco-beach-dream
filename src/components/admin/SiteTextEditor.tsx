import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/content");
        const body = await res.json();
        const map: Record<string, string> = body.site_text ?? {};
        setEntries(Object.entries(map).map(([key, value]) => ({ key, value })));
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
    setMsg(null);
    try {
      const res = await fetch("/api/admin/site-text", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ entries }),
      });
      if (res.ok) {
        setMsg("Sauvegardé avec succès");
      } else {
        const body = await res.json().catch(() => ({}));
        setMsg(body.message ?? "Erreur lors de la sauvegarde");
      }
    } catch {
      setMsg("Erreur réseau");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-8 text-center text-muted-foreground">Chargement...</div>;

  // Group by FR/AR pairs
  const frKeys = entries.filter((e) => e.key.endsWith("_fr") || (!e.key.endsWith("_ar") && e.key !== "whatsapp_number" && e.key !== "formspree_id"));
  const specialKeys = entries.filter((e) => e.key === "whatsapp_number" || e.key === "formspree_id");
  const allKeys = entries;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-lg">Textes du site</h3>
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Tout sauvegarder
        </Button>
      </div>

      {msg && (
        <div className={`rounded-lg p-3 text-sm ${msg.includes("succès") ? "bg-green-50 text-green-700 border border-green-200" : "bg-destructive/10 text-destructive border border-destructive/20"}`}>
          {msg}
        </div>
      )}

      <div className="space-y-4">
        {allKeys.map(({ key, value }) => {
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

      <div className="pt-2">
        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Sauvegarder tous les textes
        </Button>
        {msg && (
          <span className={`ml-3 text-sm ${msg.includes("succès") ? "text-green-600" : "text-destructive"}`}>
            {msg}
          </span>
        )}
      </div>
    </div>
  );
}
