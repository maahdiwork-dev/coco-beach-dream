import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { MapPin, Mail, Phone, Clock, Instagram, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { content, type Lang } from "@/data/content";
import { useContent } from "@/hooks/useContent";

// Formspree endpoint — submissions are emailed to Houyem automatically.
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mdavewjo";

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
    name: "", phone: "", date: "", people: "", forfait: "", message: "",
  });

  const buildLines = () =>
    [
      form.name    && `👤 Nom : ${form.name}`,
      form.phone   && `📞 Téléphone : ${form.phone}`,
      form.date    && `📅 Date : ${form.date}`,
      form.people  && `👥 Personnes : ${form.people}`,
      form.forfait && `🏖️ Forfait : ${form.forfait}`,
      form.message && `💬 Message : ${form.message}`,
    ].filter(Boolean).join("\n");

  const buildWaLink = () => {
    const body = `Bonjour VIP Coco Beach, je voudrais réserver :\n${buildLines()}`;
    const cleanNumber = whatsappNumber.replace(/[^0-9+]/g, "");
    const number = cleanNumber || "21656530516";
    return `https://wa.me/${number}?text=${encodeURIComponent(body)}`;
  };

  // WhatsApp = native form submit (gets required-field validation for free)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.open(buildWaLink(), "_blank", "noopener,noreferrer");
    setSubmitted("wa");
  };

  // Email = POST to Formspree → reservation is emailed to Houyem automatically.
  const handleEmail = async () => {
    if (formRef.current && !formRef.current.reportValidity()) return;
    setSending(true);
    setErrorMsg("");
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          Nom: form.name,
          Téléphone: form.phone,
          Date: form.date,
          Personnes: form.people,
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

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

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
                <Button variant="ocean" onClick={() => { setForm({ name: "", phone: "", date: "", people: "", forfait: "", message: "" }); setSubmitted(null); }}>
                  Nouvelle demande
                </Button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} className="card-premium p-6 md:p-8 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
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
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Téléphone</label>
                    <input
                      type="tel"
                      inputMode="tel"
                      required
                      maxLength={20}
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
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
                    <label className="text-sm font-medium text-foreground mb-1 block">Nombre de personnes</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      required
                      min={1}
                      max={50}
                      value={form.people}
                      onChange={(e) => update("people", e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Forfait</label>
                  <select
                    required
                    value={form.forfait}
                    onChange={(e) => update("forfait", e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Choisir un forfait</option>
                    {t.packages.map((packageItem) => (
                      <option key={packageItem.name} value={packageItem.name}>
                        {packageItem.name} — {packageItem.price}
                      </option>
                    ))}
                  </select>
                </div>
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
    </section>
  );
};

export default ContactSection;
