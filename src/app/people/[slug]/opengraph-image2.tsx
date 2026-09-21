import { publicTeam } from "@/data";
import { personCard } from "@/lib/og/cards";
import { ogImage } from "@/lib/og/og-image";

export { size } from "@/lib/og/og-image";
export const contentType = "image/jpeg";
export const alt = "A member of DIAL";

export function generateStaticParams() {
  return publicTeam().map((member) => ({ slug: member.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  return ogImage(personCard((await params).slug), "jpeg");
}
