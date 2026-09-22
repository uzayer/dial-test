import Link from "next/link";

import { ClosingNote } from "@/components/closing-note";
import { MarginNote, TickMark } from "@/components/marks";
import { NumberedSteps, SectionHeader, ThemeIndex, sectionSpacing } from "@/components/editorial";
import { PageHeader } from "@/components/page-header";
import { ScrollRuler } from "@/components/scroll-ruler";
import { ProjectIndex } from "@/components/project-index";
import { FlatPublicationList } from "@/components/publications1";
import { VenueLedger } from "@/components/venue-ledger";
import {
  awardsForPublication,
  featuredProjects,
  getProjectBySlug,
  labInfo,
  labStats,
  publicationsByYear,
  researchThemes,
  themeExampleProjects,
  themeStats,
} from "@/data";
import {
  highlightAuthors,
  toProjectEntry,
  toPublicationYears,
  topVenueEntries,
} from "@/data/views";
import { displaySectionTitle, label } from "@/lib/typography";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Research",
  description:
    "Research Themes, Projects, and award-winning Publications from the Design Inclusion and Access Lab at North South University.",
};

const METHOD = [
  {
    title: "Fieldwork before tooling",
    body: "Projects start with interviews, visits, workshops, and patient listening before a technical intervention is proposed.",
  },
  {
    title: "Co-design under constraint",
    body: "Bandwidth, literacy, language, trust, device access, and local institutions shape the design brief from the beginning.",
  },
  {
    title: "Prototype, evaluate, publish",
    body: "The lab turns findings into working systems, papers, datasets, methods, and student research trajectories.",
  },
];

/** A Project named in running copy, linked to its page when the record exists. */
function ProjectName({ slug }: { slug: string }) {
  const project = getProjectBySlug(slug);
  if (!project) return null;
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-current"
    >
      {project.title}
    </Link>
  );
}

export default function ResearchPage() {
  const stats = labStats();
  const awardWinning = publicationsByYear().filter((pub) => awardsForPublication(pub).length > 0);

  return (
    <>
      <ScrollRuler />
      <PageHeader
        eyebrow="Research"
        art="orbit"
        title="Research at the margins"
        description="DIAL studies access, inclusion, safety, wellbeing, and development in low-resource settings, then builds and evaluates technology with the people expected to use it."
        facts={[
          { value: String(stats.ongoingProjects), label: "Ongoing projects" },
          { value: String(stats.publications), label: "Publications" },
          ...(labInfo.hciResearchSince
            ? [{ value: String(labInfo.hciResearchSince), label: "Active since" }]
            : []),
        ]}
      />

      {/* What the nine have in common, before the nine themselves. The index
          alone read as a taxonomy — nine equal rows that say what the lab
          files work under, not what the work is. This says it in three lines,
          each carried by projects a visitor can open. */}
      <section className={cn("container", sectionSpacing, "pt-0 md:pt-0")}>
        <div
          data-reveal
          className="relative grid gap-10 pt-6 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-24"
        >
          <span aria-hidden className="reveal-rule absolute inset-x-0 top-0 h-px bg-border" />
          <div className="reveal-item">
            <p className={cn(label, "mb-3 flex items-center gap-2")}>
              <TickMark />
              The through-line
            </p>
            <h2 className={cn(displaySectionTitle, "text-balance")}>
              Who technology leaves out, and what it takes to design with them.
            </h2>
          </div>
          <dl className="reveal-item max-w-prose divide-y divide-border border-y border-border">
            <div className="grid gap-2 py-5 sm:grid-cols-[8rem_1fr] sm:gap-6">
              <dt className="font-hand text-xl leading-tight text-ink">who it is for</dt>
              <dd className="text-pretty text-muted-foreground">
                People mainstream technology serves badly: women facing harassment (
                <ProjectName slug="protibadi" />
                ), caregivers of autistic children (<ProjectName slug="shondhi" />
                ), visually impaired people (<ProjectName slug="jyoti" />
                ), low-income women and their money (<ProjectName slug="alor-akash" />
                ).
              </dd>
            </div>
            <div className="grid gap-2 py-5 sm:grid-cols-[8rem_1fr] sm:gap-6">
              <dt className="font-hand text-xl leading-tight text-ink">how</dt>
              <dd className="text-pretty text-muted-foreground">
                Fieldwork first, then design with the people involved, then something cheap enough
                to work where they are: a locally built wearable for drivers in Bangladesh&apos;s
                traffic (<ProjectName slug="bap-re-bap" />
                ), stories collected through the &ldquo;digital silence&rdquo; after the 2018
                student protests (
                <ProjectName slug="golpokotha" />
                ).
              </dd>
            </div>
            <div className="grid gap-2 py-5 sm:grid-cols-[8rem_1fr] sm:gap-6">
              <dt className="font-hand text-xl leading-tight text-ink">what comes of it</dt>
              <dd className="text-pretty text-muted-foreground">
                {stats.publications} publications, {stats.labAwards} awards for the lab&apos;s work,
                and {stats.projects} projects — the nine themes below are how that work is filed.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className={cn("container", sectionSpacing)}>
        <VenueLedger venues={topVenueEntries()} />
      </section>

      <section className={cn("container", sectionSpacing)}>
        <SectionHeader
          title="Nine research themes"
          description="Each theme gathers the Projects and Publications filed under it, with the projects that carry it named."
          className="mb-6"
        />
        <ThemeIndex
          themes={researchThemes.map((theme) => {
            const counts = themeStats(theme.id);
            return {
              slug: theme.slug,
              title: theme.title,
              description: theme.shortDescription,
              projectCount: counts.projects,
              publicationCount: counts.publications,
              examples: themeExampleProjects(theme.id).map((p) => p.title),
            };
          })}
        />
      </section>

      <section className={cn("container", sectionSpacing)}>
        <SectionHeader label="Method" title="Shaped by field relationships" className="mb-10" />
        <NumberedSteps steps={METHOD} />
        {/* Restates the first step's own title ("Fieldwork before tooling"); a
            margin note never says anything the page has not already set. */}
        <MarginNote points="right" className="mt-8 ml-1">
          in that order, every time
        </MarginNote>
      </section>

      <section className={cn("container", sectionSpacing)}>
        <SectionHeader
          label="Selected projects"
          title="Longer research programmes"
          link={{ text: "All projects", href: "/projects" }}
          className="mb-6"
        />
        <ProjectIndex projects={featuredProjects().slice(0, 3).map(toProjectEntry)} />
      </section>

      {awardWinning.length > 0 && (
        <section className={cn("container", sectionSpacing)}>
          <SectionHeader
            label="Recognition"
            title="Award-winning work"
            link={{ text: "All publications", href: "/publications" }}
            className="mb-6"
          />
          <FlatPublicationList
            yearGroups={toPublicationYears(awardWinning)}
            highlightAuthors={highlightAuthors()}
          />
        </section>
      )}

      <ClosingNote
        heading="Research with the people it serves. Join the lab."
        links={[
          { text: "Join the lab", href: "/join-us" },
          { text: "Start a collaboration", href: "/contact" },
        ]}
      />
    </>
  );
}
