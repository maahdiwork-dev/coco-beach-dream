import {
  Anchor,
  Waves,
  UtensilsCrossed,
  Sun,
  Umbrella,
  Ship,
  Fish,
  Wine,
  MapPin,
  Star,
  Heart,
  TreePalm,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  anchor: Anchor,
  waves: Waves,
  utensils: UtensilsCrossed,
  sun: Sun,
  umbrella: Umbrella,
  ship: Ship,
  fish: Fish,
  wine: Wine,
  mappin: MapPin,
  star: Star,
  heart: Heart,
  palm: TreePalm,
};

export const ICON_OPTIONS: { value: string; label: string }[] = [
  { value: "anchor", label: "Ancre" },
  { value: "waves", label: "Vagues" },
  { value: "utensils", label: "Couverts" },
  { value: "sun", label: "Soleil" },
  { value: "umbrella", label: "Parasol" },
  { value: "ship", label: "Bateau" },
  { value: "fish", label: "Poisson" },
  { value: "wine", label: "Vin" },
  { value: "mappin", label: "Position" },
  { value: "star", label: "Étoile" },
  { value: "heart", label: "Cœur" },
  { value: "palm", label: "Palmier" },
];

export function getIcon(name?: string): LucideIcon {
  return ICON_MAP[name ?? ""] ?? Anchor;
}
