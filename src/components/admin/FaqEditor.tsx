import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Loader2, Plus, Save, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { FaqItem } from "@/hooks/useContent";

const faqSchema = z.object({
  question_fr: z.string().min(1, "Requis"),
  question_ar: z.string().optional().default(""),
  answer_fr: z.string().min(1, "Requis"),
  answer_ar: z.string().optional().default(""),
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
    try {
      const res = await fetch(`/api/admin/faq/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });
      if (res.ok) {
        toast("Question modifiée");
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
      const res = await fetch(`/api/admin/faq/${item.id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        toast("Question supprimée");
        onDeleted();
      } else {
        toast("Erreur lors de la suppression", { style: { background: "var(--destructive)", color: "#fff" } });
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
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer cette question ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer cette question ? Cette action est réversible mais l'élément sera caché du site immédiatement.
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
      )}
    </div>
  );
}

export default function FaqEditor() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);

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
    } catch {
      toast("Impossible de charger la FAQ", { style: { background: "var(--destructive)", color: "#fff" } });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onAdd = async (values: FormData) => {
    setAdding(true);
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
        toast("Question ajoutée");
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
          Questions/réponses affichées sur le site, en français et en arabe. Laissez l'arabe vide si vous ne souhaitez pas traduire.
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-premium p-4 flex items-center justify-between">
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-4 w-4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Help text */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
        Questions/réponses affichées sur le site, en français et en arabe. Laissez l&rsquo;arabe vide si vous ne souhaitez pas traduire.
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-lg">FAQ ({items.length})</h3>
        <Button size="sm" variant="outline" onClick={() => setShowAdd((s) => !s)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle question
        </Button>
      </div>

      {items.length === 0 && !showAdd && (
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
                {adding ? "Ajout..." : "Ajouter"}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Annuler</Button>
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
