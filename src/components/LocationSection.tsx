import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MapPin, Ship, Car } from "lucide-react";

const LocationSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-padding bg-warm-cream" ref={ref}>
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="section-title">Comment Nous Trouver</h2>
          <p className="section-subtitle">Coco Beach, Ghar el Melh, Bizerte, Tunisie</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="card-premium p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="text-primary" size={20} />
                </div>
                <div>
                  <h3 className="font-heading font-semibold mb-1">Adresse</h3>
                  <p className="text-muted-foreground text-sm">
                    Coco Beach, Ghar el Melh, Bizerte, Tunisie
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Car className="text-primary" size={20} />
                </div>
                <div>
                  <h3 className="font-heading font-semibold mb-1">Parking</h3>
                  <p className="text-muted-foreground text-sm">
                    Parking sécurisé inclus dans tous nos forfaits au port de Ghar el Melh.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Ship className="text-primary" size={20} />
                </div>
                <div>
                  <h3 className="font-heading font-semibold mb-1">Accès en Bateau</h3>
                  <p className="text-muted-foreground text-sm">
                    Rendez-vous au port de Ghar el Melh. Notre bateau vous transportera
                    directement vers notre plage privée. Le trajet est inclus dans tous nos forfaits.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="rounded-2xl overflow-hidden h-[350px] md:h-[400px]"
          >
            <iframe
              title="VIP Coco Beach — Ghar el Melh"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12735.27!2d10.18!3d37.17!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12fd3c1e6b4b4b5b%3A0x0!2sGhar+el+Melh!5e0!3m2!1sfr!2stn!4v1"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
