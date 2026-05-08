import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Save, ChevronDown, ChevronUp } from "lucide-react";
import type { Forfait } from "@/hooks/useContent";

const forfaitSchema = z.object({
  name_fr: z.string().min(1, "Requis"),
  name_ar: z.string().min(1, "Requis"),
  price_fr: z.string().min(1, "Requis"),
  price_ar: z.string().min(1, "Requis"),
  items_fr: z.string().min(1, "Requis"),
  items_ar: z.string().min(1, "Requis"),
  active: z.boolean(),
});

type FormData = z.infer<typeof forfaitSchema>;

function ForfaitRow({ forfait, onUpdated }: { forfait: Forfait; onUpdated: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(forfaitSchema),
    defaultValues: {
      name_fr: forfait.name_fr,
      name_ar: forfait.name_ar,
      price_fr: forfait.price_fr,
      price_ar: forfait.price_ar,
      items_fr: (forfait.items_fr ?? []).join("\n"),
      items_ar: (forfait.items_ar ?? []).join("\n"),
      active: forfait.active,
    },
  });

  const active = watch("active");

  const onSubmit = async (values: FormData) => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/forfaits/${forfait.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name_fr: values.name_fr,
          name_ar: values.name_ar,
          price_fr: values.price_fr,
          price_ar: values.price_ar,
          items_fr: values.items_fr.split("\n").map((s) => s.trim()).filter(Boolean),
          items_ar: values.items_ar.split("\n").map((s) => s.trim()).filter(Boolean),
          active: values.active,
        }),
      });
      if (res.ok) {
        setMsg("Sauvegardé");
        onUpdated();
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
    <div className="card-premium">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="font-heading font-semibold">{forfait.name_fr}</span>
        <span className="flex items-center gap-3">
          <span className="text-sm font-bold text-primary">{forfait.price_fr}</span>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {open && (
        <form onSubmit={handleSubmit(onSubmit)} className="border-t border-border p-4 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Nom (FR)</Label>
              <Input {...register("name_fr")} />
              {errors.name_fr && <p className="text-xs text-destructive">{errors.name_fr.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Nom (AR)</Label>
              <Input {...register("name_ar")} dir="rtl" />
              {errors.name_ar && <p className="text-xs text-destructive">{errors.name_ar.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Prix (FR)</Label>
              <Input {...register("price_fr")} placeholder="ex: 70 DT / pers." />
              {errors.price_fr && <p className="text-xs text-destructive">{errors.price_fr.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Prix (AR)</Label>
              <Input {...register("price_ar")} dir="rtl" placeholder="ex: 70 د / شخص" />
              {errors.price_ar && <p className="text-xs text-destructive">{errors.price_ar.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Inclus (FR) — une ligne par élément</Label>
              <Textarea {...register("items_fr")} rows={4} />
              {errors.items_fr && <p className="text-xs text-destructive">{errors.items_fr.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Inclus (AR) — une ligne par élément</Label>
              <Textarea {...register("items_ar")} rows={4} dir="rtl" />
              {errors.items_ar && <p className="text-xs text-destructive">{errors.items_ar.message}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={active}
              onCheckedChange={(v) => setValue("active", v)}
              id={`active-${forfait.id}`}
            />
            <Label htmlFor={`active-${forfait.id}`}>Actif sur le site</Label>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Sauvegarder
            </Button>
            {msg && (
              <span className={`text-sm ${msg === "Sauvegardé" ? "text-green-600" : "text-destructive"}`}>
                {msg}
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

export default function ForfaitsEditor() {
  const [forfaits, setForfaits] = useState<Forfait[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState<string | null>(null);

  const {
    register: addReg,
    handleSubmit: addSubmit,
    reset: addReset,
    formState: { errors: addErrors },
  } = useForm<FormData>({
    resolver: zodResolver(forfaitSchema),
    defaultValues: { active: true },
  });

  const loadForfaits = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/forfaits", { credentials: "include" });
      const body = await res.json();
      setForfaits(body.forfaits ?? []);
    } catch {
      setError("Impossible de charger les forfaits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadForfaits(); }, []);

  const onAdd = async (values: FormData) => {
    setAdding(true);
    setAddMsg(null);
    try {
      const res = await fetch("/api/admin/forfaits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          slug: values.name_fr.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          name_fr: values.name_fr,
          name_ar: values.name_ar,
          price_fr: values.price_fr,
          price_ar: values.price_ar,
          items_fr: values.items_fr.split("\n").map((s) => s.trim()).filter(Boolean),
          items_ar: values.items_ar.split("\n").map((s) => s.trim()).filter(Boolean),
          active: values.active,
        }),
      });
      if (res.ok) {
        addReset();
        setShowAdd(false);
        setAddMsg(null);
        loadForfaits();
      } else {
        const body = await res.json().catch(() => ({}));
        setAddMsg(body.message ?? "Erreur lors de l'ajout");
      }
    } catch {
      setAddMsg("Erreur réseau");
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="py-8 text-center text-muted-foreground">Chargement...</div>;
  if (error) return <div className="py-4 text-destructive">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-lg">Forfaits ({forfaits.length})</h3>
        <Button size="sm" variant="outline" onClick={() => setShowAdd((s) => !s)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau forfait
        </Button>
      </div>

      {showAdd && (
        <div className="card-premium p-4 space-y-4 border-2 border-primary/20">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Nouveau forfait</h4>
          <form onSubmit={addSubmit(onAdd)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Nom (FR)</Label>
                <Input {...addReg("name_fr")} />
                {addErrors.name_fr && <p className="text-xs text-destructive">{addErrors.name_fr.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Nom (AR)</Label>
                <Input {...addReg("name_ar")} dir="rtl" />
                {addErrors.name_ar && <p className="text-xs text-destructive">{addErrors.name_ar.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Prix (FR)</Label>
                <Input {...addReg("price_fr")} />
                {addErrors.price_fr && <p className="text-xs text-destructive">{addErrors.price_fr.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Prix (AR)</Label>
                <Input {...addReg("price_ar")} dir="rtl" />
                {addErrors.price_ar && <p className="text-xs text-destructive">{addErrors.price_ar.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Inclus (FR)</Label>
                <Textarea {...addReg("items_fr")} rows={4} />
                {addErrors.items_fr && <p className="text-xs text-destructive">{addErrors.items_fr.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Inclus (AR)</Label>
                <Textarea {...addReg("items_ar")} rows={4} dir="rtl" />
                {addErrors.items_ar && <p className="text-xs text-destructive">{addErrors.items_ar.message}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" size="sm" disabled={adding}>
                {adding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Ajouter
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Annuler</Button>
              {addMsg && <span className="text-sm text-destructive">{addMsg}</span>}
            </div>
          </form>
        </div>
      )}

      {forfaits.map((f) => (
        <ForfaitRow key={f.id} forfait={f} onUpdated={loadForfaits} />
      ))}
    </div>
  );
}
