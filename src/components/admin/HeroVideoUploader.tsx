import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, CheckCircle } from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

function buildVideoUrl(storagePath: string): string {
  if (!storagePath) return "";
  if (storagePath.startsWith("http")) return storagePath;
  if (storagePath.startsWith("/")) return storagePath;
  return `${SUPABASE_URL}/storage/v1/object/public/coco-beach-public/${storagePath}`;
}

type HeroVideoUploaderProps = {
  currentStoragePath: string | null;
};

export default function HeroVideoUploader({ currentStoragePath }: HeroVideoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const activePath = uploadedPath ?? currentStoragePath;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMsg(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (res.ok) {
        const body = await res.json();
        setUploadedPath(body.storage_path);
        setMsg("Fichier uploadé. Cliquez sur Enregistrer pour l'activer.");
      } else {
        const body = await res.json().catch(() => ({}));
        setMsg(body.message ?? "Erreur lors de l'upload");
      }
    } catch {
      setMsg("Erreur réseau lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!uploadedPath) return;
    setSaving(true);
    setMsg(null);

    try {
      const res = await fetch("/api/admin/hero-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ storage_path: uploadedPath }),
      });

      if (res.ok) {
        setMsg("Vidéo activée. Le changement prend effet immédiatement sur le site.");
        setUploadedPath(null);
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

  return (
    <div className="space-y-6">
      <h3 className="font-heading font-semibold text-lg">Vidéo Hero</h3>

      {activePath && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {uploadedPath ? "Aperçu (non encore enregistré)" : "Vidéo actuelle"}
          </p>
          <video
            key={activePath}
            src={buildVideoUrl(activePath)}
            controls
            muted
            className="w-full max-w-lg rounded-xl border border-border aspect-video bg-black"
          />
          <p className="text-xs text-muted-foreground break-all">{activePath}</p>
        </div>
      )}

      <div className="space-y-3">
        <input
          ref={fileRef}
          type="file"
          accept="video/mp4,video/webm"
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
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Upload en cours...</>
          ) : (
            <><Upload className="mr-2 h-4 w-4" /> Choisir une vidéo MP4/WebM</>
          )}
        </Button>

        {uploadedPath && (
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...</>
            ) : (
              <><CheckCircle className="mr-2 h-4 w-4" /> Enregistrer comme vidéo active</>
            )}
          </Button>
        )}
      </div>

      {msg && (
        <div className={`rounded-lg p-3 text-sm ${
          msg.includes("immédiatement") || msg.includes("uploadé")
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-destructive/10 text-destructive border border-destructive/20"
        }`}>
          {msg}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Le changement prend effet immédiatement sur le site une fois enregistré. Format recommandé : MP4 H.264, max 50 Mo.
      </p>
    </div>
  );
}
