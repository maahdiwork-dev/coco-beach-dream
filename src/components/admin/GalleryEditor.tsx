import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Upload, Trash2, ArrowUp, ArrowDown, Save, Eye, EyeOff } from "lucide-react";
import type { GalleryImage } from "@/hooks/useContent";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

function buildImageUrl(storagePath: string): string {
  if (!storagePath) return "";
  if (storagePath.startsWith("http")) return storagePath;
  if (storagePath.startsWith("/")) return storagePath;
  return `${SUPABASE_URL}/storage/v1/object/public/coco-beach-public/${storagePath}`;
}

function GalleryImageRow({
  image,
  index,
  total,
  onUpdated,
  onDeleted,
}: {
  image: GalleryImage;
  index: number;
  total: number;
  onUpdated: () => void;
  onDeleted: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [altFr, setAltFr] = useState(image.alt_fr);
  const [altAr, setAltAr] = useState(image.alt_ar);
  const [active, setActive] = useState(image.active ?? true);

  const patch = async (fields: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/gallery?id=${image.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(fields),
      });
      if (res.ok) {
        toast("Image modifiée");
        onUpdated();
      } else {
        const body = await res.json().catch(() => ({}));
        toast(body.message ?? "Erreur — réessayez", { style: { background: "var(--destructive)", color: "#fff" } });
      }
    } catch {
      toast("Erreur de connexion", { style: { background: "var(--destructive)", color: "#fff" } });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => patch({ alt_fr: altFr, alt_ar: altAr, active });

  const handleToggleActive = async (val: boolean) => {
    setActive(val);
    await patch({ active: val });
  };

  const handleMoveUp = () => patch({ display_order: image.display_order - 1 });
  const handleMoveDown = () => patch({ display_order: image.display_order + 1 });

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/admin/gallery?id=${image.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast("Image supprimée");
        onDeleted();
      } else {
        toast("Erreur lors de la suppression", { style: { background: "var(--destructive)", color: "#fff" } });
      }
    } catch {
      toast("Erreur de connexion", { style: { background: "var(--destructive)", color: "#fff" } });
    }
  };

  const imgUrl = image.public_url ?? buildImageUrl(image.storage_path);

  return (
    <div className={`card-premium p-4 space-y-3 ${!active ? "opacity-60" : ""}`}>
      <div className="flex gap-4 items-start">
        {/* Thumbnail */}
        <div className="shrink-0">
          <img
            src={imgUrl}
            alt={image.alt_fr || "Image galerie"}
            className="w-20 h-20 object-cover rounded-xl border border-border"
          />
        </div>

        {/* Controls */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="grid sm:grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Légende (FR)</Label>
              <Input
                value={altFr}
                onChange={(e) => setAltFr(e.target.value)}
                placeholder="Description en français"
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Légende (AR)</Label>
              <Input
                value={altAr}
                onChange={(e) => setAltAr(e.target.value)}
                placeholder="وصف بالعربية"
                dir="rtl"
                className="text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Active toggle */}
            <div className="flex items-center gap-1.5">
              <Switch
                checked={active}
                onCheckedChange={handleToggleActive}
                id={`gal-act-${image.id}`}
                disabled={saving}
              />
              <Label htmlFor={`gal-act-${image.id}`} className="text-xs">
                {active ? <><Eye className="inline h-3 w-3 mr-1" />Visible</> : <><EyeOff className="inline h-3 w-3 mr-1" />Masquée</>}
              </Label>
            </div>

            {/* Order arrows */}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleMoveUp}
              disabled={index === 0 || saving}
              aria-label="Monter"
              className="h-7 w-7 p-0"
            >
              <ArrowUp size={12} />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleMoveDown}
              disabled={index === total - 1 || saving}
              aria-label="Descendre"
              className="h-7 w-7 p-0"
            >
              <ArrowDown size={12} />
            </Button>

            {/* Save button */}
            <Button type="button" size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
              {saving ? "" : "Enregistrer"}
            </Button>

            {/* Delete with confirmation */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive h-7"
                >
                  <Trash2 size={12} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer cette photo ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. La photo sera définitivement supprimée du site et du stockage.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GalleryEditor() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/gallery", { credentials: "include" });
      const body = await res.json();
      setImages(body.gallery_images ?? []);
    } catch {
      toast("Impossible de charger la galerie", { style: { background: "var(--destructive)", color: "#fff" } });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so same file can be re-selected
    e.target.value = "";

    setUploading(true);
    try {
      // Step 1 — upload to bucket
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/admin/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!uploadRes.ok) {
        const body = await uploadRes.json().catch(() => ({}));
        toast(body.message ?? "Erreur lors du téléversement", { style: { background: "var(--destructive)", color: "#fff" } });
        return;
      }
      const { storage_path } = await uploadRes.json();

      // Step 2 — create gallery row
      const createRes = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ storage_path, alt_fr: "", alt_ar: "" }),
      });
      if (!createRes.ok) {
        const body = await createRes.json().catch(() => ({}));
        toast(body.message ?? "Erreur lors de l'enregistrement", { style: { background: "var(--destructive)", color: "#fff" } });
        return;
      }
      toast("Image téléversée");
      await load();
    } catch {
      toast("Erreur de connexion", { style: { background: "var(--destructive)", color: "#fff" } });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
          Photos affichées dans la section galerie. Cliquez &lsquo;Téléverser&rsquo; pour ajouter une photo (max 50 MB). Utilisez les flèches pour réordonner.
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-premium p-4 flex gap-4">
            <Skeleton className="w-20 h-20 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Help text */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
        Photos affichées dans la section galerie. Cliquez &lsquo;Téléverser&rsquo; pour ajouter une photo (max 50 MB). Utilisez les flèches pour réordonner.
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-lg">Galerie ({images.length})</h3>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Téléversement...</>
            ) : (
              <><Upload className="mr-2 h-4 w-4" />Téléverser</>
            )}
          </Button>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-3 text-center text-muted-foreground">
          <p>Aucune photo. Cliquez sur &lsquo;Téléverser&rsquo; pour commencer.</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            Téléverser
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {images.map((img, i) => (
            <GalleryImageRow
              key={img.id}
              image={img}
              index={i}
              total={images.length}
              onUpdated={load}
              onDeleted={load}
            />
          ))}
        </div>
      )}
    </div>
  );
}
