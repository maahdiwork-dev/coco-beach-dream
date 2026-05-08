import type { Lang } from "@/data/content";

export const getWhatsAppBookingLink = (lang: Lang) =>
  "https://wa.me/21656530516?text=" +
  encodeURIComponent(
    lang === "fr"
      ? "Bonjour VIP Coco Beach, je veux réserver..."
      : "مرحبا، نحب نحجز في VIP Coco Beach..."
  );
