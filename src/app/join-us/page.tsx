import {
  NumberedSteps,
  PrimaryLink,
  SectionHeader,
  TextLink,
  sectionSpacingTight,
} from "@/components/editorial";
import { ExpandableList } from "@/components/expandable-list";
import { FieldNote } from "@/components/field-note";
import { MarginNote } from "@/components/marks";
import { PageHeader } from "@/components/page-header";
import { ScrollRuler } from "@/components/scroll-ruler";
import { labInfo } from "@/data";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Join the lab",
  description:
    "Join the Design Inclusion and Access Lab at North South University. No prerequisites: curiosity about people and technology is enough.",
};

const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

/**
 * The door is always open — the lab reads every email year-round — so the
 * status line says that first. The recorded window is a *cohort* intake, not
 * the only way in, and it is printed only while it is still ahead or running.
 * Reporting a closed window as the page's status made a standing invitation
 * read as "you missed it".
 */
function nextIntake(now = new Date()): string | null {
  const recruitment = labInfo.recruitment;
  if (!recruitment) return null;
  const opens = new Date(recruitment.opens);
  const closes = new Date(`${recruitment.closes}T23:59:59Z`);
  if (now > closes) return null;
  const range = `${formatDay(recruitment.opens)} – ${formatDay(recruitment.closes)}, ${closes.getUTCFullYear()}`;
  return now < opens ? `Next intake ${range}` : `Intake running now · ${range}`;
}

const REASONS = [
  {
    title: "No prerequisites",
    body: "We look for curiosity, not credentials. If you ask good questions about people and technology, you belong here.",
  },
  {
    title: "Fieldwork in Bangladesh",
    body: "Research happens in the field, with garment workers, urban youth, and rural health communities across Bangladesh.",
  },
  {
    title: "Publish at top venues",
    body: "DIAL publishes at CHI, CSCW, UIST, and JMIR. Lab members co-author real papers.",
  },
  {
    title: "A lab, not a job",
    body: "Small team, flat hierarchy. Nova works directly with every lab member.",
  },
];

// Captions for the Lab-life photographs DIAL will supply. Until real, consented
// photos exist the moments are listed as text: a stock photo captioned as a
// DIAL event would be a fabrication (labs/dial/design-principles.md).
const MOMENTS = [
  {
    title: "Lab sessions",
    caption: "Weekly meetings in Dhaka where ideas become research questions.",
  },
  { title: "Fieldwork", caption: "Research happens where the people are, not in the lab." },
  {
    title: "Iftar together",
    caption: "Every Ramadan the lab gathers. Research is also relationships.",
  },
  {
    title: "Conference trips",
    caption: "DIAL researchers presenting their work to a global audience.",
  },
  {
    title: "Research presentations",
    caption: "Every lab member presents at NSU, from their first semester.",
  },
];

// DIAL has no numbered vacancies to post — it takes graduate and undergraduate
// students year-round, by email. Inventing two "roles" to fill a section made
// the page claim a formal process that does not exist, and that a Lab Editor
// would then have to keep current. What is true is who may write, and about what.
const WHO_SHOULD_WRITE = [
  {
    title: "Graduate students",
    body: "NSU master's students who want a thesis grounded in fieldwork, or who want to co-author at CHI, CSCW, UIST, or JMIR.",
  },
  {
    title: "Undergraduate students",
    body: "Any NSU undergraduate, from any semester. Most lab members started with no research experience at all.",
  },
  {
    title: "Everyone else",
    body: "Visiting students, collaborators, and researchers elsewhere in Bangladesh — write anyway, and say what you are working on.",
  },
];

const HOW_TO_APPLY = [
  {
    title: "Write a short email",
    body: "Subject: “Application for DIAL Recruitment [Semester] – Your Name”. Tell us what draws you to HCI research; that matters more than your CV.",
  },
  {
    title: "Attach the basics",
    body: "Your CV, a short research-interest statement, your current program and year, and any relevant skills or experience.",
  },
  {
    title: "Hear back",
    body: "We read every application and reply to everyone shortlisted within two weeks.",
  },
];

export default function JoinUsPage() {
  const intake = nextIntake();
  const applyHref = `mailto:${labInfo.email}`;

  return (
    <>
      <ScrollRuler />
      <PageHeader
        eyebrow="Join the lab"
        art="signal"
        title="No prerequisites. Just curiosity."
        description="If you are curious about how technology shapes lives in Bangladesh, and want to do research that matters, DIAL is for you."
      >
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
          <div className="flex items-end gap-3">
            <PrimaryLink href={applyHref}>Apply by email</PrimaryLink>
            {/* Marginalia: the note and arrow are decoration around a real action. */}
            <MarginNote className="pb-1">that is the whole process</MarginNote>
          </div>
          <p className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-brand">
            <span className="size-1.5 shrink-0 rounded-full bg-brand" />
            Open year-round
            {intake && (
              <span className="text-muted-foreground">
                <span aria-hidden className="mr-2 opacity-60">
                  ·
                </span>
                {intake}
              </span>
            )}
          </p>
        </div>
      </PageHeader>

      <section className={cn("container", sectionSpacingTight, "pt-0 md:pt-0")}>
        <SectionHeader
          label="Why DIAL"
          title="Research that reaches the people who need it most"
          className="mb-2"
        />
        <ExpandableList items={REASONS} className="mt-6 max-w-3xl" />
      </section>

      <section className={cn("container", sectionSpacingTight)}>
        <SectionHeader
          label="Who we take"
          title="The lab is open year-round"
          description="There is no vacancy list to wait for. We read every email from graduate and undergraduate students, and reply to everyone shortlisted within two weeks."
          className="mb-8"
        />
        <ul className="grid gap-x-12 md:grid-cols-3">
          {WHO_SHOULD_WRITE.map((who) => (
            <li key={who.title} className="border-t border-border py-6">
              <h3 className="font-display text-2xl leading-snug">{who.title}</h3>
              <p className="mt-2 text-pretty text-muted-foreground">{who.body}</p>
            </li>
          ))}
        </ul>
        {/* "No prerequisites" is the page's central claim and the hardest one
            for a student to believe. The field's own history is the evidence. */}
        <FieldNote source="CHI, first held 1982" className="mt-10">
          The people who built HCI arrived from psychology, theatre, design and anthropology at
          least as often as from computer science. It has never been a field you need permission to
          enter.
        </FieldNote>
        <div className="mt-10 flex flex-wrap items-end gap-x-4 gap-y-3">
          <PrimaryLink href={applyHref}>Write to the lab</PrimaryLink>
          <MarginNote className="pb-1">no form, no deadline</MarginNote>
        </div>
      </section>

      <section className={cn("container", sectionSpacingTight)}>
        <SectionHeader label="Life at DIAL" title="What it is like to work here" className="mb-2" />
        <ul className="grid gap-x-12 sm:grid-cols-2 lg:grid-cols-3">
          {MOMENTS.map((moment) => (
            <li key={moment.title} className="border-b border-border py-6">
              <p className="font-display text-xl">{moment.title}</p>
              <p className="mt-1 text-pretty text-muted-foreground">{moment.caption}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={cn("container", sectionSpacingTight)}>
        <SectionHeader label="How to apply" title="Three steps, no forms" className="mb-10" />
        <NumberedSteps steps={HOW_TO_APPLY} />
        <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
          <PrimaryLink href={applyHref}>Apply by email</PrimaryLink>
          <TextLink href="/contact" className="text-muted-foreground hover:text-foreground">
            Questions? Contact the lab
          </TextLink>
        </div>
      </section>
    </>
  );
}
