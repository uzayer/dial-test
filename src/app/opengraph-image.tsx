import { siteCard } from "@/lib/og/cards";
import { ogImage } from "@/lib/og/og-image";

export { size } from "@/lib/og/og-image";
export const contentType = "image/webp";
export const alt = "DIAL — Design Inclusion and Access Lab";

export default function Image() {
  return ogImage(siteCard, "webp");
}
