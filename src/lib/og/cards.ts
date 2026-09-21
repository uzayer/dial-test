import { getProjectBySlug, getPublication, getTeamMemberBySlug, venueLabel } from "@/data";
import { toNewsPost } from "@/data/views";

import type { OgCard } from "./og-image";

/**
 * What each route's Open Graph card says. Each route has a WebP and a JPEG
 * image file; both read their card from here. Each composition matches the
 * one on that section's index page header.
 */

export const siteCard: OgCard = {
  eyebrow: "North South University · Dhaka",
  title: "Design Inclusion and Access Lab",
  art: "bloom",
  logo: true,
};

export function publicationCard(id: string): OgCard | undefined {
  const pub = getPublication(id);
  if (!pub) return undefined;
  return {
    eyebrow: ["Publication", pub.year, venueLabel(pub)].filter(Boolean).join(" · "),
    title: pub.title,
    art: "strata",
  };
}

export function personCard(slug: string): OgCard | undefined {
  const member = getTeamMemberBySlug(slug);
  if (!member || member.displayInWebsite === false) return undefined;
  return { eyebrow: "People", title: member.name, description: member.title, art: "bloom" };
}

export function projectCard(slug: string): OgCard | undefined {
  const project = getProjectBySlug(slug);
  if (!project) return undefined;
  return { eyebrow: "Project", title: project.title, description: project.abstract, art: "field" };
}

export function newsCard(slug: string): OgCard | undefined {
  const post = toNewsPost(slug);
  if (!post) return undefined;
  return {
    eyebrow: "News",
    title: post.entry.title,
    description: post.entry.description,
    art: "signal",
  };
}
