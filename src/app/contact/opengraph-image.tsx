import { contactCard } from "@/lib/og/cards";
import { ogImage } from "@/lib/og/og-image";

export { size } from "@/lib/og/og-image";
export const contentType = "image/webp";
export const alt = "Contact DIAL";

export default function Image() {
  return ogImage(contactCard());
}
