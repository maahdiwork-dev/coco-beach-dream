import { useQuery } from "@tanstack/react-query";

export interface Forfait {
  id: string;
  slug: string;
  display_order: number;
  name_fr: string;
  name_ar: string;
  price_fr: string;
  price_ar: string;
  items_fr: string[];
  items_ar: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Supplement {
  id: string;
  display_order: number;
  name: string;
  price: string;
  category: "main" | "side";
  highlight: boolean;
  icon: string | null;
  active: boolean;
}

export interface FaqItem {
  id: string;
  display_order: number;
  question_fr: string;
  question_ar: string;
  answer_fr: string;
  answer_ar: string;
  active: boolean;
}

export interface GalleryImage {
  id: string;
  storage_path: string;
  public_url?: string | null;
  alt_fr: string;
  alt_ar: string;
  display_order: number;
  active?: boolean;
}

export interface ContentPayload {
  site_text: Record<string, string>;
  forfaits: Forfait[];
  supplements: Supplement[];
  faq: FaqItem[];
  hero_video: { storage_path: string } | null;
  gallery_images: GalleryImage[];
}

async function fetchContent(): Promise<ContentPayload> {
  const res = await fetch("/api/content");
  if (!res.ok) {
    throw new Error(`/api/content returned ${res.status}`);
  }
  return res.json() as Promise<ContentPayload>;
}

export function useContent() {
  return useQuery<ContentPayload, Error>({
    queryKey: ["content"],
    queryFn: fetchContent,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
