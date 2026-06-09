import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { MapPin, Mail, Phone, Clock, Instagram, MessageCircle, Lock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { content, type Lang } from "@/data/content";
import { useContent } from "@/hooks/useContent";

// Formspree endpoint — submissions are emailed to Houyem automatically.
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mdavewjo";

const FORFAIT_OPTIONS = [
  { name: "Parasol", price: "70 DT / pers.", min: 1, max: 4 },
  { name: "Cabane Sable", price: "70 DT / pers.", min: 4, max: null },
  { name: "Paillote", price: "80 DT / pers.", min: 5, max: null },
  { name: "Paillote VIP 1ère Position", price: "85 DT / pers.", min: 5, max: null },
] as const;

type ContactSectionProps = {
  lang: Lang;
};

const ContactSection = ({ lang }: ContactSectionProps) => {
  const ref = useRef(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const t = content[lang];
  const { data: contentData } = useContent();

  // Runtime WhatsApp number — falls back to Houyem's number
  const whatsappNumber = contentData?.site_text?.whatsapp_number ?? "";

  // submitted holds which channel succeeded: 'email' | 'wa' | null
  const [submitted, setSubmitted] = useState<null | "email" | "wa">(null);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({
    name: "", date: "", adults: "2", enfants: "0", forfait: "", message: "",
  });

  // Email phone modal state
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailPhone, setEmailPhone] = useState("");
  const [modalPhoneError, setModalPhoneError] = useState("");

  // Auto-clear forfait when adults count makes it unavailable
  useEffect(() => {
    if (!form.forfait) return;
    const adults = Number(form.adults);
    const option = FORFAIT_OPTIONS.find((o) => o.name === form.forfait);
    if (!option) return;
    const available = adults >= option.min && (option.max === null || adults <= option.max);
    if (!available) {
      setForm((p) => ({ ...p, forfait: "" }));
    }
  }, [form.adults]);

  const isForfaitAvailable = (option: typeof FORFAIT_OPTIONS[number]) => {
    const adults = Number(form.adults);
    return adults >= option.min && (option.max === null || adults <= option.max);
  };

  const forfaitLockReason = (option: typeof FORFAIT_OPTIONS[number]) => {
    const adults = Number(form.adults);
    if (adults < option.min) return `À partir de ${option.min} adulte${option.min > 1 ? "s" : ""}`;
    if (option.max !== null && adults > option.max) return `Jusqu'à ${option.max} adulte${option.max > 1 ? "s" : ""}`;
    return "";
  };

  const buildWaLink = () => {
    const lines = [
      form.name    && `👤 Nom : ${form.name}`,
      form.date    && `📅 Date : ${form.date}`,
      `👥 Adultes : ${form.adults}`,
      Number(form.enfants) > 0 && `👶 Enfants : ${form.enfants}`,
      form.forfait && `🏖️ Forfait : ${form.forfait}`,
      form.message && `💬 Message : ${form.message}`,
    ].filter(Boolean).join("\n");

    const body = `Bonjour VIP Coco Beach, je voudrais réserver :\n${lines}`;
    const cleanNumber = whatsappNumber.replace(/[^0-9+]/g, "");
    const number = cleanNumber || "21656530516";
    return `https://wa.me/${number}?text=${encodeURIComponent(body)}`;
  };

  const validateForm = () => {
    if (formRef.current && !formRef.current.reportValidity()) return false;
    if (!form.forfait) {
      setErrorMsg("Choisissez un forfait.");
      return false;
    }
    return true;
  };

  // WhatsApp = native form submit (gets required-field validation for free)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    window.open(buildWaLink(), "_blank", "noopener,noreferrer");
    setSubmitted("wa");
  };

  // Email = open modal to collect phone, then POST to Formspree
  const handleEmail = () => {
    if (!validateForm()) return;
    setEmailPhone("");
    setModalPhoneError("");
    setEmailModalOpen(true);
  };

  const handleModalConfirm = async () => {
    if (!emailPhone.trim()) {
      setModalPhoneError("Veuillez entrer votre numéro de téléphone.");
      return;
    }
    setEmailModalOpen(false);
    setSending(true);
    setErrorMsg("");
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          Nom: form.name,
          Téléphone: emailPhone,
          Date: form.date,
          Adultes: form.adults,
          Enfants: form.enfants,
          Forfait: form.forfait,
          Message: form.message || "—",
          _subject: `Réservation VIP Coco Beach — ${form.name}`,
        }),
      });
      if (res.ok) {
        setSubmitted("email");
      } else {
        const body = await res.json().catch(() => ({}));
        setErrorMsg(
          body?.errors?.[0]?.message ??
            "L'envoi a échoué. Réessayez ou utilisez WhatsApp."
        );
      }
    } catch {
      setErrorMsg("Problème de connexion. Réessayez ou utilisez WhatsApp.");
    } finally {
      setSending(false);
    }
  };

  const update = (key: string, value: string) => {
    setErrorMsg("");
    setForm((p) => ({ ...p, [key]: value }));
  };

  const resetForm = () => {
    setForm({ name: "", date: "", adults: "2", enfants: "0", forfait: "", message: "" });
    setSubmitted(null);
    setErrorMsg("");
    setEmailPhone("");
  };

  return (
    <section id="contact" className="section-padding bg-warm-cream" ref={ref}>
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="section-title">{lang === "fr" ? "Contactez-Nous" : "اتصل بنا"}</h2>
          <p className="section-subtitle">{t.warning}</p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {[
              { icon: MapPin, label: "Adresse", value: "Coco Beach, Ghar el Melh, Bizerte" },
              { icon: Mail, label: "Email", value: "vipcoucoubeach@gmail.com" },
              { icon: Phone, label: "Téléphone", value: "+216 56 530 516" },
              { icon: Clock, label: "Horaires", value: "Mai – Septembre, 9h – 19h" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="text-primary" size={20} />
                </div>
                <div>
                  <p className="font-heading font-semibold text-sm">{item.label}</p>
                  <p className="text-muted-foreground text-sm">{item.value}</p>
                </div>
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <a
                href="https://www.instagram.com/vipcoucoubeach/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            id="reserver"
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-3 scroll-mt-24"
          >
            {submitted ? (
              <div className="card-premium p-6 md:p-8 flex flex-col items-center justify-center gap-4 text-center min-h-[300px]">
                <div className="text-4xl">✅</div>
                <h3 className="font-heading text-xl font-bold text-primary">
                  {submitted === "email" ? "Réservation envoyée !" : "WhatsApp ouvert !"}
                </h3>
                <p className="text-muted-foreground">
                  {submitted === "email"
                    ? "Votre demande a bien été envoyée. Nous vous contacterons rapidement pour confirmer."
                    : "Votre demande a été transmise sur WhatsApp. Nous confirmerons votre réservation rapidement."}
                </p>
                <Button variant="ocean" onClick={resetForm}>
                  Nouvelle demande
                </Button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} className="card-premium p-6 md:p-8 space-y-4">
                {/* Row 1 — Nom complet (full width) */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Nom complet</label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {/* Row 2 — Date + Adultes */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Date souhaitée</label>
                    <input
                      type="date"
                      required
                      value={form.date}
                      onChange={(e) => update("date", e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Nombre d'adultes</label>
                    <select
                      required
                      value={form.adults}
                      onChange={(e) => update("adults", e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {Array.from({ length: 15 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={String(n)}>{n}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 3 — Enfants */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">
                      Nombre d'enfants <span className="text-muted-foreground font-normal">(optionnel)</span>
                    </label>
                    <select
                      value={form.enfants}
                      onChange={(e) => update("enfants", e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {Array.from({ length: 16 }, (_, i) => i).map((n) => (
                        <option key={n} value={String(n)}>{n}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Forfait cards */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Forfait</label>
                  <div className="space-y-2">
                    {FORFAIT_OPTIONS.map((option) => {
                      const available = isForfaitAvailable(option);
                      const selected = form.forfait === option.name;
                      const lockReason = !available ? forfaitLockReason(option) : "";

                      return (
                        <div
                          key={option.name}
                          onClick={() => available && update("forfait", option.name)}
                          className={[
                            "flex items-center justify-between rounded-xl border px-4 py-3 transition-all",
                            available
                              ? "cursor-pointer hover:border-primary/50"
                              : "opacity-50 cursor-not-allowed",
                            selected
                              ? "border-2 bg-primary/5"
                              : "border-border bg-background",
                          ].join(" ")}
                          style={selected ? { borderColor: "#0a3d62" } : {}}
                          role={available ? "button" : undefined}
                          tabIndex={available ? 0 : undefined}
                          onKeyDown={(e) => {
                            if (available && (e.key === "Enter" || e.key === " ")) {
                              e.preventDefault();
                              update("forfait", option.name);
                            }
                          }}
                          aria-pressed={selected}
                          aria-disabled={!available}
                        >
                          <div className="flex items-center gap-3">
                            {available ? (
                              <div
                                className={[
                                  "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                                  selected ? "bg-primary border-primary" : "border-muted-foreground/40",
                                ].join(" ")}
                                style={selected ? { backgroundColor: "#0a3d62", borderColor: "#0a3d62" } : {}}
                              >
                                {selected && <Check size={12} className="text-white" strokeWidth={3} />}
                              </div>
                            ) : (
                              <Lock size={16} className="text-muted-foreground shrink-0" />
                            )}
                            <div>
                              <p className="text-sm font-semibold text-foreground">{option.name}</p>
                              {!available && lockReason && (
                                <p className="text-xs text-destructive mt-0.5">{lockReason}</p>
                              )}
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground ml-4 shrink-0">{option.price}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Message (optionnel)</label>
                  <textarea
                    maxLength={1000}
                    rows={3}
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                </div>

                {/* Submit buttons */}
                <div className="space-y-3 pt-1">
                  <Button variant="sand" size="lg" type="submit" disabled={sending} className="w-full gap-2">
                    <MessageCircle size={18} />
                    Réserver via WhatsApp
                  </Button>
                  <Button variant="ocean" size="lg" type="button" onClick={handleEmail} disabled={sending} className="w-full gap-2">
                    <Mail size={18} />
                    {sending ? "Envoi en cours…" : "Réserver via Email"}
                  </Button>
                  {errorMsg && (
                    <p className="text-xs text-destructive text-center">{errorMsg}</p>
                  )}
                  <p className="text-xs text-muted-foreground text-center">
                    Réservez en un clic via WhatsApp, ou envoyez votre demande par Email — nous vous répondons rapidement.
                  </p>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>

      {/* Email phone modal */}
      <Dialog open={emailModalOpen} onOpenChange={(open) => { if (!open) setEmailModalOpen(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Votre numéro de téléphone</DialogTitle>
            <DialogDescription>
              Pour confirmer votre réservation, laissez-nous votre numéro.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="modal-phone">Numéro de téléphone</Label>
              <Input
                id="modal-phone"
                type="tel"
                inputMode="tel"
                placeholder="+216 XX XXX XXX"
                value={emailPhone}
                onChange={(e) => {
                  setEmailPhone(e.target.value);
                  if (modalPhoneError) setModalPhoneError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleModalConfirm();
                  }
                }}
                autoFocus
              />
              {modalPhoneError && (
                <p className="text-xs text-destructive">{modalPhoneError}</p>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setEmailModalOpen(false)}
              >
                Annuler
              </Button>
              <Button
                variant="ocean"
                onClick={handleModalConfirm}
                disabled={sending}
                className="gap-2"
              >
                <Mail size={16} />
                Envoyer ma demande
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ContactSection;
