import { notFound } from "next/navigation";

import { ClosingNote } from "@/components/closing-note";
import { SectionHeader, sectionSpacing } from "@/components/editorial";
import { MemberProfile } from "@/components/member-profile";
import { ProjectIndex } from "@/components/project-index";
import { FlatPublicationList } from "@/components/publications1";
import { ScrollRuler } from "@/components/scroll-ruler";
import {
  getTeamMemberBySlug,
  grantsByTeamMember,
  projectsByTeamMember,
  publicTeam,
  publicationsByTeamMember,
} from "@/data";
import { toMemberGrant, toMemberProfile, toProjectEntry, toPublicationYears } from "@/data/views";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

// Only Team Members the site may show get a profile; hidden records 404.
export function generateStaticParams() {
  return publicTeam().map((member) => ({ slug: member.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const member = getTeamMemberBySlug(slug);
  return member ? { title: member.name, description: member.title } : {};
}

export default async function MemberPage({ params }: Props) {
  const { slug } = await params;
  const member = getTeamMemberBySlug(slug);
  if (!member || member.displayInWebsite === false) notFound();

  const profile = toMemberProfile(member);
  const publications = toPublicationYears(publicationsByTeamMember(member.id));
  const projects = projectsByTeamMember(member.id).map(toProjectEntry);
  const grants = grantsByTeamMember(member.id).map((g) => toMemberGrant(g, member.id));
  const scholarUrl = profile.socials.find((s) => s.platform === "google-scholar")?.url;

  // Projects, then publications, then grants: current work first, the record
  // of it second, and the funding behind it last. Whichever of the three a
  // person actually has runs flush against the profile header, so an
  // undergraduate with no projects does not open on a band of empty paper.
  const leading =
    projects.length > 0 ? "projects" : publications.length > 0 ? "publications" : "grants";
  const first = (section: string) => (section === leading ? "pt-0 md:pt-0" : undefined);

  return (
    <>
      <ScrollRuler />
      <MemberProfile member={profile} />

      {projects.length > 0 && (
        <section className={cn("container", sectionSpacing, first("projects"))}>
          <SectionHeader title="Projects" className="mb-6" />
          <ProjectIndex projects={projects} />
        </section>
      )}

      {publications.length > 0 && (
        <section className={cn("container", sectionSpacing, first("publications"))}>
          <SectionHeader
            title="Publications"
            link={scholarUrl ? { text: "All on Google Scholar", href: scholarUrl } : undefined}
            className="mb-6"
          />
          <FlatPublicationList
            yearGroups={publications}
            highlightAuthors={[member.name]}
            showYear
          />
        </section>
      )}

      {grants.length > 0 && (
        <section className={cn("container", sectionSpacing, first("grants"))}>
          <SectionHeader title="Grants" className="mb-6" />
          <ul className="divide-y divide-border border-y border-border">
            {grants.map((grant) => (
              <li key={grant.id} className="grid gap-2 py-5 md:grid-cols-[6rem_1fr_12rem] md:gap-8">
                <span className="font-mono text-xs tabular-nums text-muted-foreground md:pt-1.5">
                  {grant.yearStart
                    ? `${grant.yearStart}${grant.yearEnd && grant.yearEnd !== grant.yearStart ? `–${grant.yearEnd}` : ""}`
                    : "—"}
                </span>
                <div>
                  <p className="font-display text-xl leading-snug">{grant.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{grant.funder}</p>
                </div>
                <span className="text-sm text-muted-foreground md:pt-1.5 md:text-right">
                  {grant.role}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ClosingNote
        heading="Interested in HCI research for the Global South?"
        links={[
          { text: "Join the lab", href: "/join-us" },
          { text: "Browse projects", href: "/projects" },
        ]}
      />
    </>
  );
}
