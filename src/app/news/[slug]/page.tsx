import { notFound } from "next/navigation";

import { NewsPost } from "@/components/news-post";
import { news } from "@/data";
import { toNewsPost } from "@/data/views";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return news.map((entry) => ({ slug: entry.id }));
}

// Unknown slugs 404 instead of rendering on demand.
export const dynamicParams = false;

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = toNewsPost(slug);
  return post ? { title: post.entry.title, description: post.entry.description } : {};
}

export default async function NewsEntryPage({ params }: Props) {
  const { slug } = await params;
  const post = toNewsPost(slug);
  if (!post) notFound();
  return <NewsPost {...post} />;
}
