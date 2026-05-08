import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Save, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { FaqItem } from "@/hooks/useContent";

const faqSchema = z.object({
  question_fr: z.string().min(1, "Requis"),
  question_ar: z.string().min(1, "Requis"),
  answer_fr: z.string().min(1, "Requis"),
  answer_ar: z.string().min(1, "Requis"),
  active: z.boolean(),
});

type FormData = z.infer<typeof faqSchema>;

function FaqRow({
  item,
  onUpdated,
  onDeleted,
}: {
  item: FaqItem;
  onUpdated: () => void;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question_fr: item.question_fr,
      question_ar: item.question_ar,
      answer_fr: item.answer_fr,
      answer_ar: item.answer_ar,
      active: item.active,
    },
  });

  const active = watch("active");

  const onSubmit = async (values: FormData) => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/faq/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
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
    if (!confirm("Désactiver cette question ?")) return;
    try {
      await fetch(`/api/admin/faq/${item.id}`, { method: "DELETE", credentials: "include" });
      onDeleted();
    } catch { /* ignore */ }
  };

  return (
    <div className="card-premium">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="font-semibold text-sm line-clamp-1">{item.question_fr}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {open && (
        <form onSubmit={handleSubmit(onSubmit)} className="border-t border-border p-4 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Question (FR)</Label>
              <Input {...register("question_fr")} />
              {errors.question_fr && <p className="text-xs text-destructive">{errors.question_fr.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Question (AR)</Label>
              <Input {...register("question_ar")} dir="rtl" />
              {errors.question_ar && <p className="text-xs text-destructive">{errors.question_ar.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Réponse (FR)</Label>
              <Textarea {...register("answer_fr")} rows={3} />
              {errors.answer_fr && <p className="text-xs text-destructive">{errors.answer_fr.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Réponse (AR)</Label>
              <Textarea {...register("answer_ar")} rows={3} dir="rtl" />
              {errors.answer_ar && <p className="text-xs text-destructive">{errors.answer_ar.message}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch checked={active} onCheckedChange={(v) => setValue("active", v)} id={`faq-act-${item.id}`} />
            <Label htmlFor={`faq-act-${item.id}`}>Actif</Label>
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Sauvegarder
            </Button>
            <Button type="button" size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
            {msg && (
              <span className={`text-sm ${msg === "Sauvegardé" ? "text-green-600" : "text-destructive"}`}>{msg}</span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

export default function FaqEditor() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(faqSchema),
    defaultValues: { active: true },
  });

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/faq", { credentials: "include" });
      const body = await res.json();
      setItems(body.faq ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onAdd = async (values: FormData) => {
    setAdding(true);
    setAddMsg(null);
    try {
      const res = await fetch("/api/admin/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });
      if (res.ok) {
        reset({ active: true });
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-lg">FAQ ({items.length})</h3>
        <Button size="sm" variant="outline" onClick={() => setShowAdd((s) => !s)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle question
        </Button>
      </div>

      {showAdd && (
        <div className="card-premium p-4 space-y-4 border-2 border-primary/20">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Nouvelle question</h4>
          <form onSubmit={handleSubmit(onAdd)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Question (FR)</Label>
                <Input {...register("question_fr")} />
                {errors.question_fr && <p className="text-xs text-destructive">{errors.question_fr.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Question (AR)</Label>
                <Input {...register("question_ar")} dir="rtl" />
                {errors.question_ar && <p className="text-xs text-destructive">{errors.question_ar.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Réponse (FR)</Label>
                <Textarea {...register("answer_fr")} rows={3} />
                {errors.answer_fr && <p className="text-xs text-destructive">{errors.answer_fr.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Réponse (AR)</Label>
                <Textarea {...register("answer_ar")} rows={3} dir="rtl" />
                {errors.answer_ar && <p className="text-xs text-destructive">{errors.answer_ar.message}</p>}
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

      {items.map((item) => (
        <FaqRow key={item.id} item={item} onUpdated={load} onDeleted={load} />
      ))}
    </div>
  );
}
