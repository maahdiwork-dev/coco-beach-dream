import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Comment se rendre à la plage ?",
    a: "La plage est accessible uniquement par bateau depuis le port de Ghar el Melh. Le transfert aller-retour est inclus dans tous nos forfaits.",
  },
  {
    q: "Les forfaits incluent-ils le trajet en bateau ?",
    a: "Oui, tous nos forfaits comprennent le transfert aller-retour en bateau depuis le port de Ghar el Melh.",
  },
  {
    q: "Y a-t-il un parking ?",
    a: "Oui, un parking sécurisé est mis à votre disposition gratuitement. Il est inclus dans chaque forfait.",
  },
  {
    q: "Quelle est la durée de la journée ?",
    a: "Vous pouvez profiter de la plage toute la journée, de 9h à 19h environ.",
  },
  {
    q: "Peut-on payer sur place ?",
    a: "Oui, nous acceptons le paiement en espèces et par paiement mobile directement sur place.",
  },
];

const FAQSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-padding" ref={ref}>
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="section-title">En Savoir Plus</h2>
          <p className="section-subtitle">Questions fréquemment posées</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="card-premium px-6 border-none"
              >
                <AccordionTrigger className="font-heading font-semibold text-left hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
