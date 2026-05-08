import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import { Loader2, Plus, Save, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
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
        toast("Forfait modifié");
        onUpdated();
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

  const handleDeactivate = async () => {
    try {
      const res = await fetch(`/api/admin/forfaits/${forfait.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ active: false }),
      });
      if (res.ok) {
        toast("Forfait désactivé");
        onUpdated();
      } else {
        toast("Erreur lors de la désactivation", { style: { background: "var(--destructive)", color: "#fff" } });
      }
    } catch {
      toast("Erreur de connexion", { style: { background: "var(--destructive)", color: "#fff" } });
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
              <Input {...register("price_fr")} inputMode="decimal" placeholder="ex: 70 DT / pers." />
              {errors.price_fr && <p className="text-xs text-destructive">{errors.price_fr.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Prix (AR)</Label>
              <Input {...register("price_ar")} dir="rtl" inputMode="decimal" placeholder="ex: 70 د / شخص" />
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

          <div className="flex items-center gap-3 flex-wrap">
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Désactiver
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Désactiver ce forfait ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir désactiver ce forfait ? Cette action est réversible mais l'élément sera caché du site immédiatement.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeactivate}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Désactiver
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ForfaitsEditor() {
  const [forfaits, setForfaits] = useState<Forfait[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);

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
      toast("Impossible de charger les forfaits", { style: { background: "var(--destructive)", color: "#fff" } });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadForfaits(); }, []);

  const onAdd = async (values: FormData) => {
    setAdding(true);
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
        toast("Forfait ajouté");
        loadForfaits();
      } else {
        const body = await res.json().catch(() => ({}));
        toast(body.message ?? "Erreur lors de l'ajout", { style: { background: "var(--destructive)", color: "#fff" } });
      }
    } catch {
      toast("Erreur de connexion", { style: { background: "var(--destructive)", color: "#fff" } });
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
          Modifiez ici les noms, prix et inclus de vos forfaits. Les changements sont visibles immédiatement sur le site. Décocher &lsquo;Actif&rsquo; cache le forfait sans le supprimer.
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-premium p-4 flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Help text */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
        Modifiez ici les noms, prix et inclus de vos forfaits. Les changements sont visibles immédiatement sur le site. Décocher &lsquo;Actif&rsquo; cache le forfait sans le supprimer.
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-lg">Forfaits ({forfaits.length})</h3>
        <Button size="sm" variant="outline" onClick={() => setShowAdd((s) => !s)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau forfait
        </Button>
      </div>

      {forfaits.length === 0 && !showAdd && (
        <div className="flex flex-col items-center justify-center py-12 space-y-3 text-center text-muted-foreground">
          <p>Aucun élément. Cliquez sur &lsquo;Ajouter&rsquo; pour commencer.</p>
          <Button size="sm" variant="outline" onClick={() => setShowAdd(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter
          </Button>
        </div>
      )}

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
                <Input {...addReg("price_fr")} inputMode="decimal" />
                {addErrors.price_fr && <p className="text-xs text-destructive">{addErrors.price_fr.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Prix (AR)</Label>
                <Input {...addReg("price_ar")} dir="rtl" inputMode="decimal" />
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
                {adding ? "Ajout..." : "Ajouter"}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Annuler</Button>
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
