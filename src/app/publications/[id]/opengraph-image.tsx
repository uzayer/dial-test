import { publications } from "@/data";
import { publicationCard } from "@/lib/og/cards";
import { ogImage } from "@/lib/og/og-image";

export { size } from "@/lib/og/og-image";
export const contentType = "image/webp";
export const alt = "A publication from DIAL";

export function generateStaticParams() {
  return publications.map((pub) => ({ id: pub.id }));
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  return ogImage(publicationCard((await params).id), "webp");
}
