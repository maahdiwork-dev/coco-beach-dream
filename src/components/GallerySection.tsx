import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";
import g5 from "@/assets/gallery-5.jpg";
import g6 from "@/assets/gallery-6.jpg";

const images = [
  { src: g1, alt: "Restaurant en bord de mer", w: 800, h: 600 },
  { src: g2, alt: "Plage turquoise avec parasols", w: 600, h: 800 },
  { src: g3, alt: "Plat de poisson méditerranéen", w: 800, h: 600 },
  { src: g4, alt: "Bateau traditionnel en mer turquoise", w: 800, h: 600 },
  { src: g5, alt: "Transats de luxe sur la plage", w: 600, h: 800 },
  { src: g6, alt: "Vue aérienne de la côte", w: 800, h: 600 },
];

const GallerySection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [lightbox, setLightbox] = useState<number | null>(null);

  const navigate = (dir: number) => {
    if (lightbox === null) return;
    setLightbox((lightbox + dir + images.length) % images.length);
  };

  return (
    <>
      <section id="galerie" className="section-padding bg-warm-cream" ref={ref}>
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="section-title">Galerie</h2>
            <p className="section-subtitle">Découvrez VIP Coco Beach en quelques photos</p>
          </motion.div>

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {images.map((img, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                onClick={() => setLightbox(i)}
                className="block w-full overflow-hidden rounded-2xl group break-inside-avoid"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  width={img.w}
                  height={img.h}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[100] bg-foreground/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-card/20 backdrop-blur-sm"
            style={{ color: "#fff" }}
            onClick={() => setLightbox(null)}
            aria-label="Fermer"
          >
            <X size={24} />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/20 backdrop-blur-sm"
            style={{ color: "#fff" }}
            onClick={(e) => { e.stopPropagation(); navigate(-1); }}
            aria-label="Précédent"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/20 backdrop-blur-sm"
            style={{ color: "#fff" }}
            onClick={(e) => { e.stopPropagation(); navigate(1); }}
            aria-label="Suivant"
          >
            <ChevronRight size={24} />
          </button>
          <img
            src={images[lightbox].src}
            alt={images[lightbox].alt}
            className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default GallerySection;
