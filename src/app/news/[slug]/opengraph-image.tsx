import { news } from "@/data";
import { newsCard } from "@/lib/og/cards";
import { ogImage } from "@/lib/og/og-image";

export { size } from "@/lib/og/og-image";
export const contentType = "image/webp";
export const alt = "News from DIAL";

export function generateStaticParams() {
  return news.map((entry) => ({ slug: entry.id }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  return ogImage(newsCard((await params).slug));
}
