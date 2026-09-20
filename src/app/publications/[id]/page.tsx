import { notFound } from "next/navigation";

import { PublicationPost } from "@/components/publication-post";
import { getPublication, publications } from "@/data";
import { toPublicationPost } from "@/data/views";

type Props = { params: Promise<{ id: string }> };

// A Publication's id is already a stable slug ("2019-they-dont-leave-us-alone"),
// so it is the route segment; there is no separate slug field to keep in step.
export function generateStaticParams() {
  return publications.map((pub) => ({ id: pub.id }));
}

// Unknown ids 404 instead of rendering on demand.
export const dynamicParams = false;

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const pub = getPublication(id);
  if (!pub) return {};
  return {
    title: pub.title,
    // The abstract is the paper's own summary; nothing is written for SEO.
    description: pub.abstract ?? pub.citationText ?? undefined,
  };
}

export default async function PublicationDetailPage({ params }: Props) {
  const { id } = await params;
  const pub = getPublication(id);
  if (!pub) notFound();
  return <PublicationPost pub={toPublicationPost(pub)} />;
}
