import { peopleCard } from "@/lib/og/cards";
import { ogImage } from "@/lib/og/og-image";

export { size } from "@/lib/og/og-image";
export const contentType = "image/webp";
export const alt = "The people of DIAL";

export default function Image() {
  return ogImage(peopleCard());
}
