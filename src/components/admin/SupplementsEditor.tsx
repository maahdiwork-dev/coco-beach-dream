import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [msg, setMsg] = useState<string | null>(null);
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
    setMsg(null);
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
        setMsg("Sauvegardé");
        onUpdated();
      } else {
        const body = await res.json().catch(() => ({}));
        setMsg(body.message ?? "Erreur");
      }
    } catch {
      setMsg("Erreur réseau");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Désactiver "${supplement.name}" ?`)) return;
    try {
      await fetch(`/api/admin/supplements/${supplement.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      onDeleted();
    } catch {
      // ignore
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
          <Input {...register("price")} />
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
          Sauvegarder
        </Button>
        <Button type="button" size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={handleDelete}>
          <Trash2 className="h-3 w-3" />
        </Button>
        {msg && (
          <span className={`text-xs ${msg === "Sauvegardé" ? "text-green-600" : "text-destructive"}`}>{msg}</span>
        )}
      </div>
    </form>
  );
}

export default function SupplementsEditor() {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState<string | null>(null);

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onAdd = async (values: FormData) => {
    setAdding(true);
    setAddMsg(null);
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
        load();
      } else {
        const body = await res.json().catch(() => ({}));
        setAddMsg(body.message ?? "Erreur");
      }
    } catch {
      setAddMsg("Erreur réseau");
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="py-8 text-center text-muted-foreground">Chargement...</div>;

  const mains = supplements.filter((s) => s.category === "main");
  const sides = supplements.filter((s) => s.category === "side");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-lg">Suppléments ({supplements.length})</h3>
        <Button size="sm" variant="outline" onClick={() => setShowAdd((s) => !s)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau
        </Button>
      </div>

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
                <Input {...register("price")} />
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
                Ajouter
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Annuler</Button>
              {addMsg && <span className="text-sm text-destructive">{addMsg}</span>}
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
