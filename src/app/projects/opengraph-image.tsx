import { projectsCard } from "@/lib/og/cards";
import { ogImage } from "@/lib/og/og-image";

export { size } from "@/lib/og/og-image";
export const contentType = "image/webp";
export const alt = "DIAL's research projects";

export default function Image() {
  return ogImage(projectsCard());
}
