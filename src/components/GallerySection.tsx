import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import g1 from "@/assets/gallery-1.jpg";
import romanticWalkway from "@/assets/vip-2026/02_romantic_DNYvCq3M9u3_2.jpg";
import romanticWalkwayWebp from "@/assets/vip-2026/02_romantic_DNYvCq3M9u3_2.webp";
import foodShrimpPasta from "@/assets/vip-2026/05_food_DNjA0_cMM6y_1.jpg";
import foodShrimpPastaWebp from "@/assets/vip-2026/05_food_DNjA0_cMM6y_1.webp";
import boatCompressed from "@/assets/vip-2026/gallery-boat-compressed.jpg";
import boatCompressedWebp from "@/assets/vip-2026/gallery-boat-compressed.webp";
import cabaneLoungers from "@/assets/vip-2026/07_cabane_DMpc_2.jpg";
import cabaneLoungersWebp from "@/assets/vip-2026/07_cabane_DMpc_2.webp";
import cabaneAerial from "@/assets/vip-2026/07_cabane_DMpc_1.jpg";
import cabaneAerialWebp from "@/assets/vip-2026/07_cabane_DMpc_1.webp";
import type { Lang } from "@/data/content";
import { useContent } from "@/hooks/useContent";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

// Static fallback images — used when gallery_images table is empty or unavailable
const STATIC_IMAGES = [
  { id: "restaurant", src: g1, webp: undefined as string | undefined, alt: "Restaurant en bord de mer" },
  { id: "walkway", src: romanticWalkway, webp: romanticWalkwayWebp, alt: "Passerelle et cabane VIP Coco Beach en lumière de coucher de soleil" },
  { id: "food", src: foodShrimpPasta, webp: foodShrimpPastaWebp, alt: "Plat de pâtes aux crevettes servi à VIP Coco Beach" },
  { id: "boat", src: boatCompressed, webp: boatCompressedWebp, alt: "Bateau traditionnel en mer turquoise vers VIP Coco Beach" },
  { id: "loungers", src: cabaneLoungers, webp: cabaneLoungersWebp, alt: "Cabanes et transats VIP Coco Beach au bord de l'eau" },
  { id: "aerial", src: cabaneAerial, webp: cabaneAerialWebp, alt: "Vue aérienne de VIP Coco Beach avec arche en coeur" },
];

function buildImageUrl(storagePath: string): string {
  if (!storagePath) return "";
  if (storagePath.startsWith("http")) return storagePath;
  if (storagePath.startsWith("/")) return storagePath;
  return `${SUPABASE_URL}/storage/v1/object/public/coco-beach-public/${storagePath}`;
}

type GallerySectionProps = {
  lang: Lang;
};

const GallerySection = ({ lang: _lang }: GallerySectionProps) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [lightbox, setLightbox] = useState<number | null>(null);
  const { data: contentData } = useContent();

  // Build display list: prefer DB-driven images, fall back to static
  const dbImages = contentData?.gallery_images ?? [];
  const displayImages =
    dbImages.length > 0
      ? dbImages.map((img) => ({
          id: img.id,
          src: img.public_url ?? buildImageUrl(img.storage_path),
          webp: undefined as string | undefined,
          alt: img.alt_fr || "Photo VIP Coco Beach",
        }))
      : STATIC_IMAGES;

  const navigate = (dir: number) => {
    if (lightbox === null) return;
    setLightbox((lightbox + dir + displayImages.length) % displayImages.length);
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
            {displayImages.map((img, i) => (
              <motion.button
                key={img.id}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                onClick={() => setLightbox(i)}
                className="block w-full overflow-hidden rounded-2xl group break-inside-avoid"
              >
                <picture>
                  {img.webp && <source srcSet={img.webp} type="image/webp" />}
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </picture>
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
          <picture>
            {displayImages[lightbox].webp && (
              <source srcSet={displayImages[lightbox].webp} type="image/webp" />
            )}
            <img
              src={displayImages[lightbox].src}
              alt={displayImages[lightbox].alt}
              loading="lazy"
              className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </picture>
        </div>
      )}
    </>
  );
};

export default GallerySection;
