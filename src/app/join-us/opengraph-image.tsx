import { joinCard } from "@/lib/og/cards";
import { ogImage } from "@/lib/og/og-image";

export { size } from "@/lib/og/og-image";
export const contentType = "image/webp";
export const alt = "Join DIAL";

export default function Image() {
  return ogImage(joinCard());
}
