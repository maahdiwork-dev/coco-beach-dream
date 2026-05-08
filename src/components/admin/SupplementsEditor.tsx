import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import type { Supplement } from "@/hooks/useContent";

const ICON_SLUGS = ["flame", "fish", "utensils-crossed", "soup", "salad", "chef-hat", "none"] as const;

const supplementSchema = z.object({
  name: z.string().min(1, "Requis"),
  price: z.string().min(1, "Requis"),
  category: z.enum(["main", "side"]),
  highlight: z.boolean(),
  icon: z.string().nullable(),
  active: z.boolean(),
});

type FormData = z.infer<typeof supplementSchema>;

function SupplementRow({
  supplement,
  onUpdated,
  onDeleted,
}: {
  supplement: Supplement;
  onUpdated: () => void;
  onDeleted: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(supplementSchema),
    defaultValues: {
      name: supplement.name,
      price: supplement.price,
      category: supplement.category,
      highlight: supplement.highlight,
      icon: supplement.icon ?? "none",
      active: supplement.active,
    },
  });

  const active = watch("active");
  const highlight = watch("highlight");

  const onSubmit = async (values: FormData) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/supplements/${supplement.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...values,
          icon: values.icon === "none" ? null : values.icon,
        }),
      });
      if (res.ok) {
        toast("Supplément modifié");
        onUpdated();
      } else {
        const body = await res.json().catch(() => ({}));
        toast(body.message ?? "Erreur", { style: { background: "var(--destructive)", color: "#fff" } });
      }
    } catch {
      toast("Erreur de connexion", { style: { background: "var(--destructive)", color: "#fff" } });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/admin/supplements/${supplement.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast("Supplément supprimé");
        onDeleted();
      } else {
        toast("Erreur lors de la suppression", { style: { background: "var(--destructive)", color: "#fff" } });
      }
    } catch {
      toast("Erreur de connexion", { style: { background: "var(--destructive)", color: "#fff" } });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card-premium p-4 space-y-3">
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 space-y-1">
          <Label className="text-xs">Nom</Label>
          <Input {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Prix (DT)</Label>
          <Input {...register("price")} inputMode="decimal" />
          {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="space-y-1">
          <Label className="text-xs">Catégorie</Label>
          <Select
            defaultValue={supplement.category}
            onValueChange={(v) => setValue("category", v as "main" | "side")}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="main">Principal</SelectItem>
              <SelectItem value="side">Accomp.</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Icône</Label>
          <Select
            defaultValue={supplement.icon ?? "none"}
            onValueChange={(v) => setValue("icon", v)}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ICON_SLUGS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <Switch checked={highlight} onCheckedChange={(v) => setValue("highlight", v)} id={`hl-${supplement.id}`} />
          <Label htmlFor={`hl-${supplement.id}`} className="text-xs">Mis en avant</Label>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <Switch checked={active} onCheckedChange={(v) => setValue("active", v)} id={`act-${supplement.id}`} />
          <Label htmlFor={`act-${supplement.id}`} className="text-xs">Actif</Label>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Save className="mr-2 h-3 w-3" />}
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" size="sm" variant="ghost" className="text-destructive hover:text-destructive">
              <Trash2 className="h-3 w-3" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer ce supplément ?</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer ce supplément ? Cette action est réversible mais l'élément sera caché du site immédiatement.
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
    </form>
  );
}

export default function SupplementsEditor() {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(supplementSchema),
    defaultValues: { category: "main", highlight: false, icon: "none", active: true },
  });

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/supplements", { credentials: "include" });
      const body = await res.json();
      setSupplements(body.supplements ?? []);
    } catch {
      toast("Impossible de charger les suppléments", { style: { background: "var(--destructive)", color: "#fff" } });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onAdd = async (values: FormData) => {
    setAdding(true);
    try {
      const res = await fetch("/api/admin/supplements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...values, icon: values.icon === "none" ? null : values.icon }),
      });
      if (res.ok) {
        reset({ category: "main", highlight: false, icon: "none", active: true });
        setShowAdd(false);
        toast("Supplément ajouté");
        load();
      } else {
        const body = await res.json().catch(() => ({}));
        toast(body.message ?? "Erreur", { style: { background: "var(--destructive)", color: "#fff" } });
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
          Gérez les plats à la carte. Cliquez sur &lsquo;Ajouter&rsquo; pour un nouveau plat. L'icône flame met le plat en avant.
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-premium p-4 space-y-3">
            <div className="grid sm:grid-cols-3 gap-3">
              <Skeleton className="sm:col-span-2 h-9" />
              <Skeleton className="h-9" />
            </div>
            <Skeleton className="h-9 w-32" />
          </div>
        ))}
      </div>
    );
  }

  const mains = supplements.filter((s) => s.category === "main");
  const sides = supplements.filter((s) => s.category === "side");

  return (
    <div className="space-y-4">
      {/* Help text */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
        Gérez les plats à la carte. Cliquez sur &lsquo;Ajouter&rsquo; pour un nouveau plat. L&rsquo;icône flame met le plat en avant.
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-lg">Suppléments ({supplements.length})</h3>
        <Button size="sm" variant="outline" onClick={() => setShowAdd((s) => !s)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau
        </Button>
      </div>

      {supplements.length === 0 && !showAdd && (
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
          <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Nouveau supplément</h4>
          <form onSubmit={handleSubmit(onAdd)} className="space-y-3">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs">Nom</Label>
                <Input {...register("name")} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Prix (DT)</Label>
                <Input {...register("price")} inputMode="decimal" />
                {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Catégorie</Label>
                <Select defaultValue="main" onValueChange={(v) => setValue("category", v as "main" | "side")}>
                  <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">Principal</SelectItem>
                    <SelectItem value="side">Accomp.</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Icône</Label>
                <Select defaultValue="none" onValueChange={(v) => setValue("icon", v)}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ICON_SLUGS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
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

      {mains.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Plats principaux</p>
          {mains.map((s) => (
            <SupplementRow key={s.id} supplement={s} onUpdated={load} onDeleted={load} />
          ))}
        </div>
      )}

      {sides.length > 0 && (
        <div className="space-y-3 mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Accompagnements</p>
          {sides.map((s) => (
            <SupplementRow key={s.id} supplement={s} onUpdated={load} onDeleted={load} />
          ))}
        </div>
      )}
    </div>
  );
}
