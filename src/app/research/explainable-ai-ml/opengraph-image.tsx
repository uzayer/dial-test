import { themeCard } from "@/lib/og/cards";
import { ogImage } from "@/lib/og/og-image";

export { size } from "@/lib/og/og-image";
export const contentType = "image/webp";
export const alt = "A DIAL Research Theme";

export default function Image() {
  return ogImage(themeCard("explainable-ai-ml"));
}
