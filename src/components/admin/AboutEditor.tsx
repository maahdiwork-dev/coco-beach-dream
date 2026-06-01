import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import { Loader2, Save, Upload, Image as ImageIcon } from "lucide-react";
import { ABOUT_DEFAULTS } from "@/components/AboutSection";
import { ICON_OPTIONS, getIcon } from "@/lib/about-icons";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

function buildImageUrl(raw?: string): string {
  if (!raw) return "";
  if (raw.startsWith("http")) return raw;
  if (raw.startsWith("/")) return raw;
  return `${SUPABASE_URL}/storage/v1/object/public/coco-beach-public/${raw}`;
}

type LangTab = "fr" | "ar";

// All keys this editor manages
const ALL_KEYS = Object.keys(ABOUT_DEFAULTS);

export default function AboutEditor() {
  const [values, setValues] = useState<Record<string, string>>(ABOUT_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lang, setLang] = useState<LangTab>("fr");
  const fileRef = useRef<HTMLInputElement>(null);

  // Load current site_text on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/content");
        const body = await res.json();
        const map: Record<string, string> = body.site_text ?? {};
        // Merge: ABOUT_DEFAULTS for any missing key
        const merged: Record<string, string> = { ...ABOUT_DEFAULTS };
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

  // Image upload — immediate save via /api/admin/site-text
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/admin/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!uploadRes.ok) {
        const body = await uploadRes.json().catch(() => ({}));
        toast(body.message ?? "Erreur lors du téléversement", {
          style: { background: "var(--destructive)", color: "#fff" },
        });
        return;
      }
      const uploadBody = await uploadRes.json();
      const publicUrl: string = uploadBody.public_url ?? buildImageUrl(uploadBody.storage_path);

      // Immediately persist to site_text
      const saveRes = await fetch("/api/admin/site-text", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ entries: [{ key: "about_image_url", value: publicUrl }] }),
      });
      if (saveRes.ok) {
        set("about_image_url", publicUrl);
        toast("Photo enregistrée");
      } else {
        const body = await saveRes.json().catch(() => ({}));
        toast(body.message ?? "Erreur lors de la sauvegarde", {
          style: { background: "var(--destructive)", color: "#fff" },
        });
      }
    } catch {
      toast("Erreur de connexion", {
        style: { background: "var(--destructive)", color: "#fff" },
      });
    } finally {
      setUploading(false);
      // Reset file input so the same file can be picked again
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // Save all keys (both languages)
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
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  const currentImageUrl = buildImageUrl(values["about_image_url"]);

  return (
    <div className="relative">
      {/* Sticky save — desktop */}
      <div className="hidden sm:flex items-center justify-between mb-4 sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border pb-3">
        <h3 className="font-heading font-semibold text-lg">À Propos</h3>
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

      <div className="space-y-6 pb-24 sm:pb-4">

        {/* ── Photo ─────────────────────────────────────────────────────────── */}
        <div className="rounded-lg border border-border p-4 space-y-3">
          <Label className="text-sm font-semibold">Photo À Propos</Label>

          {currentImageUrl ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Image actuelle</p>
              <img
                src={currentImageUrl}
                alt="Aperçu À Propos"
                className="w-full max-w-sm rounded-xl border border-border object-cover aspect-[4/3]"
              />
            </div>
          ) : (
            <div className="w-full max-w-sm aspect-[4/3] rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/40">
              <ImageIcon size={36} className="text-muted-foreground" />
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Téléversement...</>
            ) : (
              <><Upload className="mr-2 h-4 w-4" />Changer la photo</>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            JPEG, PNG, WebP — max 10 Mo. L'image est enregistrée immédiatement.
          </p>
        </div>

        {/* ── Texte À Propos ─────────────────────────────────────────────────── */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            {lang === "fr" ? "Texte À Propos (Français)" : "نص القسم (عربي)"}
          </Label>
          <Textarea
            value={values[`about_text_${lang}`] ?? ""}
            onChange={(e) => set(`about_text_${lang}`, e.target.value)}
            rows={5}
            dir={lang === "ar" ? "rtl" : "ltr"}
          />
        </div>

        {/* ── Feature blocks ─────────────────────────────────────────────────── */}
        {([1, 2, 3] as const).map((i) => {
          const iconName = values[`about_feat${i}_icon`] ?? "anchor";
          const PreviewIcon = getIcon(iconName);
          return (
            <div key={i} className="rounded-lg border border-border p-4 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <PreviewIcon size={18} className="text-primary" />
                </div>
                <p className="text-sm font-semibold">Bloc {i}</p>
              </div>

              {/* Icon picker — language-neutral */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground">Icône</Label>
                <Select
                  value={iconName}
                  onValueChange={(val) => set(`about_feat${i}_icon`, val)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Choisir une icône" />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map(({ value, label }) => {
                      const Ico = getIcon(value);
                      return (
                        <SelectItem key={value} value={value}>
                          <span className="flex items-center gap-2">
                            <Ico size={15} />
                            {label}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground">
                  {lang === "fr" ? "Titre (Français)" : "العنوان (عربي)"}
                </Label>
                <Input
                  value={values[`about_feat${i}_title_${lang}`] ?? ""}
                  onChange={(e) => set(`about_feat${i}_title_${lang}`, e.target.value)}
                  dir={lang === "ar" ? "rtl" : "ltr"}
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground">
                  {lang === "fr" ? "Description (Français)" : "الوصف (عربي)"}
                </Label>
                <Input
                  value={values[`about_feat${i}_desc_${lang}`] ?? ""}
                  onChange={(e) => set(`about_feat${i}_desc_${lang}`, e.target.value)}
                  dir={lang === "ar" ? "rtl" : "ltr"}
                />
              </div>
            </div>
          );
        })}
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
