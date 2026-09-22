import { designSystemCard } from "@/lib/og/cards";
import { ogImage } from "@/lib/og/og-image";

export { size } from "@/lib/og/og-image";
export const contentType = "image/webp";
export const alt = "DIAL design system and guidelines";

export default function Image() {
  return ogImage(designSystemCard());
}
