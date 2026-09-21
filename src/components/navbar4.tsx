"use client";

import { ArrowLeft, ArrowRight, Menu, Moon, Sun, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { useState, useSyncExternalStore, type ReactElement } from "react";

import {
  AsteriskMark,
  CropMarks,
  RegistrationMark,
  SquiggleUnderline,
  TickMark,
} from "@/components/marks";
import { DialLockup, DialMark } from "@/components/dial-logo";
import { OptionalImage } from "@/components/optional-image";
import { PersonChip } from "@/components/person-chip";
import { RisoArt } from "@/components/riso";
import { ThemeGlyph, themeInk } from "@/components/theme-marks";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

// ── Navigation data ────────────────────────────────────────────────────────
// Records arrive as a server-computed `nav` prop (see getNavData in
// src/data/views.ts), so this client component never imports the data module.
//
// One rule decides what may appear in a panel: **every row is a destination
// you cannot already see from the page the panel's tile points at.** That is
// what removed the old "Browse Publications" column (six links to
// /publications with a query string, duplicating the list's own filter bar)
// and the old team-category rows (four links to /people). A menu that repeats
// a page's controls looks full and teaches nothing.

export interface NavData {
  researchThemes: { id: string; title: string; slug: string; description: string }[];
  projectCategories: {
    title: string;
    projects: { id: string; title: string; description: string; href: string }[];
  }[];
  projectCount: number;
  /** Real papers, newest first — what only the menu can show. */
  recentPublications: { id: string; title: string; venue: string; year: number; href: string }[];
  publicationCount: number;
  /** e.g. "2014–2025". */
  publicationYears: string;
  publicationRecognition: { id: string; title: string; body: string; href: string }[];
  pi: { name: string; title: string; photo: string | null; href: string } | null;
  /** Current lab members, by roster section. Each person links to their page. */
  rosterGroups: {
    title: string;
    people: { name: string; slug: string; photo: string | null; role: string }[];
  }[];
  teamCount: number;
  alumniTeaser: { name: string; placement: string }[];
  alumniCount: number;
}

interface MenuProps {
  nav: NavData;
}

// ── Menu furniture ─────────────────────────────────────────────────────────
// The panels are printed sheets, not cards: a ruled label over each column and
// a paper promo block with crop marks, the same vocabulary the pages use.

const PanelLabel = ({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <div className="mb-5 flex items-center justify-between gap-4 border-b border-border pb-2.5">
    <strong className="flex items-center gap-2 text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
      <TickMark className="size-3 text-ink" />
      {children}
    </strong>
    {action}
  </div>
);

/** The "N more →" link that closes a panel label. */
const PanelMore = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <NavigationMenuLink
    href={href}
    className="group flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
  >
    <span className="relative">
      {children}
      <SquiggleUnderline />
    </span>
    <ArrowRight className="arrow-ne size-3.5" />
  </NavigationMenuLink>
);

/**
 * The promo block at the head of a panel. It is paper with a printed
 * composition in it rather than a photograph: nothing here claims to be a
 * picture of DIAL's work until DIAL supplies one.
 *
 * `emphasis` decides which of the two lines is set in the display serif. The
 * default ("statement") leads with an editorial line and files it under a
 * tracked-caps section name. "destination" swaps them, so the big line is the
 * name of the page you land on — which is what a tile whose whole job is to be
 * the section's primary destination should say loudest.
 */
const PromoCard = ({
  href,
  art,
  eyebrow,
  title,
  body,
  emphasis = "statement",
  className,
}: {
  href: string;
  art: React.ComponentProps<typeof RisoArt>["variant"];
  eyebrow?: string;
  title: string;
  body: string;
  emphasis?: "statement" | "destination";
  className?: string;
}) => {
  const swap = emphasis === "destination";
  const capsLine =
    "block text-[0.7rem] font-medium tracking-[0.16em] text-muted-foreground uppercase";
  const displayLine = "font-display relative inline-block text-xl leading-tight";
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex h-full flex-col justify-between overflow-hidden rounded-md border border-border bg-muted/40 p-6",
        className,
      )}
    >
      <CropMarks className="text-ink/50" />
      <span aria-hidden className="halftone absolute inset-0 opacity-[0.07]" />
      <RisoArt
        variant={art}
        className="pointer-events-none absolute -right-10 -bottom-10 size-48 opacity-70"
      />
      <div className="relative">
        {eyebrow &&
          (swap ? (
            <span className={cn(displayLine, "mb-2")}>
              {eyebrow}
              <SquiggleUnderline />
            </span>
          ) : (
            <span className={cn(capsLine, "mb-3")}>{eyebrow}</span>
          ))}
        {swap ? (
          <span className={capsLine}>{title}</span>
        ) : (
          <span className={displayLine}>
            {title}
            <SquiggleUnderline />
          </span>
        )}
        <p className="mt-2 max-w-[22rem] text-xs text-pretty text-muted-foreground">{body}</p>
      </div>
      <span className="relative mt-8 inline-flex items-center gap-1.5 text-xs font-medium">
        Open
        <ArrowRight className="arrow-ne size-4" />
      </span>
    </Link>
  );
};

/** A row in a panel: mark, title + note, arrow. The panels' one list shape. */
const PanelRow = ({
  href,
  mark,
  title,
  note,
  arrow = true,
}: {
  href: string;
  mark?: React.ReactNode;
  title: string;
  note?: string;
  arrow?: boolean;
}) => (
  <NavigationMenuLink
    href={href}
    className="group flex flex-row items-baseline gap-3 border-b border-border/60 py-3 text-left last:border-0"
  >
    {mark && <span className="shrink-0 translate-y-0.5">{mark}</span>}
    <span className="flex-1">
      <span className="relative inline-block text-sm font-medium text-foreground/85 group-hover:text-foreground">
        {title}
        <SquiggleUnderline />
      </span>
      {note && (
        <span className="mt-0.5 block text-xs text-pretty text-muted-foreground">{note}</span>
      )}
    </span>
    {arrow && <ArrowRight className="arrow-ne size-4 shrink-0 self-center text-muted-foreground" />}
  </NavigationMenuLink>
);

// ── Menu components ────────────────────────────────────────────────────────

/**
 * Research holds the Themes *and* the Projects. They were two top-level items
 * naming the same thing — a Theme is what the lab studies, a Project is an
 * instance of studying it — and splitting them meant a visitor had to guess
 * which of two menus held the work.
 */
const ResearchMenu = ({ nav }: MenuProps) => (
  <div className="grid gap-8 sm:grid-cols-2">
    <PromoCard
      href="/research"
      art="orbit"
      emphasis="destination"
      eyebrow="Research at DIAL"
      title="HCI research from Bangladesh"
      body="Participatory design with communities that mainstream technology largely ignores: nine themes, and the projects under them."
    />

    <div>
      <PanelLabel action={<PanelMore href="/projects">All {nav.projectCount}</PanelMore>}>
        Projects
      </PanelLabel>
      <div className="grid gap-1">
        {nav.projectCategories
          .flatMap((category) => category.projects)
          .slice(0, 5)
          .map((project) => (
            <PanelRow
              key={project.id}
              href={project.href}
              title={project.title}
              note={project.description}
              mark={
                <span
                  aria-hidden
                  className="sticker font-display relative grid size-8 place-items-center overflow-hidden rounded-[0.5rem] bg-muted text-base leading-none text-foreground/70 group-hover:-rotate-[1.75deg]"
                >
                  <span aria-hidden className="halftone absolute inset-0 opacity-25" />
                  <span className="relative">{[...project.title][0]}</span>
                </span>
              }
            />
          ))}
      </div>
    </div>

    {/* The nine Themes, each with its own drawing and its own ink — the same
        set the Research index prints, so the menu and the page agree. */}
    <div className="col-span-full">
      <PanelLabel>Research Themes</PanelLabel>
      <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2 lg:grid-cols-3">
        {nav.researchThemes.map((theme, i) => (
          <NavigationMenuLink
            key={theme.id}
            href={`/research/${theme.slug}`}
            className="group flex items-start gap-4 border-b border-border/60 py-4 text-left"
          >
            <span className="font-mono text-[0.65rem] text-muted-foreground tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <ThemeGlyph slug={theme.slug} className="size-8 shrink-0" />
            <span className="flex-1">
              <strong
                className={cn("font-display relative text-base font-normal", themeInk(theme.slug))}
              >
                {theme.title}
                <SquiggleUnderline />
              </strong>
              <span className="mt-0.5 block text-xs text-pretty text-muted-foreground">
                {theme.description}
              </span>
            </span>
          </NavigationMenuLink>
        ))}
      </div>
    </div>
  </div>
);

/**
 * Publications has exactly two destinations — the list and the honours — so
 * the panel spends its space on the one thing the list page cannot offer from
 * the navbar: the newest papers, by name, each a direct jump.
 */
const PublicationsMenu = ({ nav }: MenuProps) => (
  <div className="grid gap-8 lg:grid-cols-[20rem_1fr_18rem]">
    <PromoCard
      href="/publications"
      art="strata"
      emphasis="destination"
      eyebrow="All publications"
      title={
        nav.publicationYears
          ? `${nav.publicationCount} papers · ${nav.publicationYears}`
          : `${nav.publicationCount} papers`
      }
      body="The complete bibliography, with filters for year, venue, theme, open access, and collaborations."
    />

    <div>
      <PanelLabel action={<PanelMore href="/publications">The full list</PanelMore>}>
        Most Recent
      </PanelLabel>
      <div className="grid gap-1">
        {nav.recentPublications.map((pub) => (
          <PanelRow
            key={pub.id}
            href={pub.href}
            title={pub.title}
            note={[pub.venue, pub.year].filter(Boolean).join(" · ")}
          />
        ))}
      </div>
    </div>

    <div>
      <PanelLabel action={<PanelMore href="/awards">All awards</PanelMore>}>
        Awarded Work
      </PanelLabel>
      <div className="grid gap-1">
        {nav.publicationRecognition.map((award) => (
          <PanelRow
            key={award.id}
            href={award.href}
            title={award.title}
            note={award.body}
            arrow={false}
            mark={<AsteriskMark className="size-3.5 text-ink" />}
          />
        ))}
      </div>
    </div>
  </div>
);

/**
 * People shows people. The panel used to hold four links to /people dressed as
 * four categories, four alumni also linking to /people, and a twelve-cell grid
 * of the communities DIAL designs with — which is a statement about the
 * research, not a way to reach anyone. Now every row is a person with a page.
 *
 * The lead tile is the panel's answer to "I clicked People": it goes to
 * /people, like every other panel's tile goes to its section's index. It wears
 * the PI's portrait because she leads the roster, but her profile is one click
 * on from there — the tile is the section, not the person.
 */
const PeopleMenu = ({ nav }: MenuProps) => (
  <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
    {/* The photograph is taped on when there is one; there is no stock
        portrait standing in for a real person. */}
    <Link
      href="/people"
      className="group relative flex flex-col overflow-hidden rounded-md border border-border bg-muted/40 p-5"
    >
      <CropMarks className="text-ink/50" />
      <span aria-hidden className="halftone absolute inset-0 opacity-[0.07]" />
      <div className="relative">
        {nav.pi?.photo ? (
          <span className="relative block">
            {/* A 4/3 frame cropped this portrait to its top 60% — ceiling and
                shadow, with the subject cut at the chest. The source is 4:5,
                so the frame is 3/4 and centred: very nearly the whole photo. */}
            <OptionalImage
              src={nav.pi.photo}
              alt={`Dr. ${nav.pi.name}`}
              overlay={<span aria-hidden className="tape -top-2.5 left-6 z-10" />}
              frameClassName="aspect-3/4 w-full rounded-sm"
              className="h-full w-full object-cover object-center"
              fallback={<RisoArt variant="bloom" className="mx-auto size-40" />}
            />
          </span>
        ) : (
          <RisoArt variant="bloom" className="mx-auto size-40" />
        )}
      </div>
      <div className="relative mt-5">
        <span className="font-display relative inline-block text-xl leading-tight">
          People at DIAL
          <SquiggleUnderline />
        </span>
        <p className="mt-1 text-xs text-pretty text-muted-foreground">
          {nav.pi
            ? `Led by Dr. ${nav.pi.name}, Principal Investigator, with ${nav.teamCount} members and ${nav.alumniCount} alumni.`
            : `${nav.teamCount} members and ${nav.alumniCount} alumni.`}
        </p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium">
          Meet the lab
          <ArrowRight className="arrow-ne size-4" />
        </span>
      </div>
    </Link>

    <div className="flex flex-col gap-8">
      {/* Every current member, by name, each linking to their own page. Only
          the PI has a photograph, so the rest arrive as their printed initial
          in their own ink — the roster's vocabulary, not a placeholder. */}
      <div>
        <PanelLabel>
          {nav.teamCount} In the Lab
        </PanelLabel>
        <div className="grid gap-6 md:grid-cols-3">
          {nav.rosterGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-3 text-[0.7rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                {group.title}
              </p>
              <ul className="flex flex-col items-start gap-2">
                {group.people.map((person) => (
                  <li key={person.slug} className="max-w-full">
                    <PersonChip
                      name={person.name}
                      seed={person.slug}
                      photo={person.photo}
                      href={`/people/${person.slug}`}
                      meta={person.role}
                      size="sm"
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_16rem]">
        <div>
          <PanelLabel action={<PanelMore href="/people">All {nav.alumniCount}</PanelMore>}>
            Where Our People Go
          </PanelLabel>
          <ul className="grid gap-x-8 gap-y-3 md:grid-cols-2">
            {nav.alumniTeaser.map((alum) => (
              <li key={alum.name}>
                <span className="text-sm font-medium text-foreground/85">{alum.name}</span>
                <span className="mt-0.5 block text-xs text-pretty text-muted-foreground">
                  {alum.placement}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <NavigationMenuLink
          href="/join-us"
          className="group relative flex h-fit flex-row items-start gap-4 overflow-hidden rounded-md border border-border p-5"
        >
          <span aria-hidden className="halftone absolute inset-0 opacity-[0.07]" />
          <UserPlus className="relative size-6 shrink-0 text-ink" />
          <div className="relative">
            <div className="font-display relative inline-block text-base leading-tight">
              Join the Lab
              <SquiggleUnderline />
            </div>
            <p className="mt-1 text-xs text-pretty text-muted-foreground">
              We read every email from graduate and undergraduate students.
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium">
              How to apply
              <ArrowRight className="arrow-ne size-4" />
            </span>
          </div>
        </NavigationMenuLink>
      </div>
    </div>
  </div>
);

const LabMenu = () => (
  <div className="grid gap-y-6 md:grid-cols-2 md:gap-x-6 lg:grid-cols-4">
    <PromoCard
      href="/news"
      art="signal"
      emphasis="destination"
      eyebrow="News & Lab Activity"
      title="What the Lab has been doing"
      body="Conference trips, invited talks, community events and fieldwork, as they happen."
      className="md:col-span-2"
    />

    <PromoCard
      href="/about"
      art="bloom"
      emphasis="destination"
      eyebrow="About the Lab"
      title="The Design Inclusion and Access Lab"
      body="An HCI lab at North South University, Dhaka."
      className="md:col-span-1"
    />

    <div className="grid gap-4 md:col-span-1">
      <NavigationMenuLink
        href="/contact"
        className="group relative flex w-full flex-row items-start gap-4 overflow-hidden rounded-md border border-border p-6"
      >
        <span aria-hidden className="halftone absolute inset-0 opacity-[0.07]" />
        <RegistrationMark className="relative size-7 shrink-0 text-ink" />
        <div className="relative">
          <div className="font-display relative inline-block text-base leading-tight">
            Contact
            <SquiggleUnderline />
          </div>
          <p className="mt-1 text-xs text-pretty text-muted-foreground">
            Where the lab is, and how to reach it.
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium">
            Get in touch
            <ArrowRight className="arrow-ne size-4" />
          </span>
        </div>
      </NavigationMenuLink>

      <NavigationMenuLink
        href="/join-us"
        className="group relative flex w-full flex-row items-start gap-4 overflow-hidden rounded-md border border-border p-6"
      >
        <span aria-hidden className="halftone absolute inset-0 opacity-[0.07]" />
        <UserPlus className="relative size-7 shrink-0 text-ink" />
        <div className="relative">
          <div className="font-display relative inline-block text-base leading-tight">
            Join the Lab
            <SquiggleUnderline />
          </div>
          <p className="mt-1 text-xs text-pretty text-muted-foreground">
            We take graduate and undergraduate students year-round.
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium">
            How to apply
            <ArrowRight className="arrow-ne size-4" />
          </span>
        </div>
      </NavigationMenuLink>

      <NavigationMenuLink
        href="/design-system"
        className="group relative flex w-full flex-row items-start gap-4 overflow-hidden rounded-md border border-border p-6"
      >
        <span aria-hidden className="halftone absolute inset-0 opacity-[0.07]" />
        <DialMark title="" className="relative w-7 shrink-0 text-ink" />
        <div className="relative">
          <div className="font-display relative inline-block text-base leading-tight">
            Brand guidelines
            <SquiggleUnderline />
          </div>
          <p className="mt-1 text-xs text-pretty text-muted-foreground">
            The logo, inks, type and marks the site is printed in.
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium">
            See the system
            <ArrowRight className="arrow-ne size-4" />
          </span>
        </div>
      </NavigationMenuLink>
    </div>
  </div>
);

// ── Nav config ─────────────────────────────────────────────────────────────

// Four items, not five: "Research", "Projects" and "Publications" were three
// words for the work, and a visitor had to guess which menu held what. Projects
// now live under Research, which is the thing they are instances of.
const navigationMenuItems = [
  { key: "research", label: "Research", component: ResearchMenu },
  { key: "publications", label: "Publications", component: PublicationsMenu },
  { key: "people", label: "People", component: PeopleMenu },
  // LabMenu is static; it ignores the nav prop the other menus take.
  { key: "lab", label: "Lab", component: LabMenu as (props: MenuProps) => ReactElement },
] as const;

type NavigationMenuKey = (typeof navigationMenuItems)[number]["key"];

// ── Theme ──────────────────────────────────────────────────────────────────

function subscribeToThemeClass(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const readIsDark = () => document.documentElement.classList.contains("dark");

// ── Component ──────────────────────────────────────────────────────────────

interface Navbar4Props {
  nav: NavData;
  className?: string;
}

const Navbar4 = ({ nav, className }: Navbar4Props) => {
  const [open, setOpen] = useState(false);
  const [submenu, setSubmenu] = useState<NavigationMenuKey | null>(null);
  // The <head> script in layout.tsx applies the stored theme before paint;
  // this just mirrors the <html> class.
  const isDark = useSyncExternalStore(subscribeToThemeClass, readIsDark, () => false);

  const toggleDark = () => {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("dial-theme", next ? "dark" : "light");
  };

  return (
    <section
      data-site-nav
      className={cn("inset-x-0 top-0 z-20 bg-background text-foreground", className)}
    >
      <div className="container">
        <NavigationMenu className="min-w-full [&>div:last-child]:left-auto">
          <div className="flex w-full justify-between gap-2 py-4">
            {/* Logo. The wordmark used to carry "NSU HCI" as part of the
                drawing, which made the DIAL letters themselves small; the
                mark now stands alone and the university is named quietly
                beside it. */}
            <Link href="/" className="flex items-center">
              <DialLockup
                descriptor="university"
                wordmarkClassName="w-28 max-w-none sm:w-32"
                textClassName="hidden sm:block"
              />
            </Link>

            {/* Desktop nav */}
            <div className="flex items-center gap-2 xl:gap-8">
              <NavigationMenuList className="hidden gap-0 lg:flex">
                {navigationMenuItems.map((item) => (
                  <NavigationMenuItem key={item.key}>
                    <NavigationMenuTrigger className="px-3 text-sm xl:text-base">
                      {item.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="min-w-[calc(100vw-4rem)] p-12 2xl:min-w-[calc(1400px-4rem)]">
                      <item.component nav={nav} />
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </div>

            {/* CTA + dark toggle + mobile toggle */}
            <div className="flex items-center gap-2">
              <Link
                href="/contact"
                className={cn(
                  buttonVariants(),
                  "hidden rounded-full px-4 transition-transform duration-150 ease-snappy active:scale-[0.97] md:inline-flex",
                )}
              >
                Contact
              </Link>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle dark mode"
                onClick={toggleDark}
              >
                {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Main Menu"
                className="lg:hidden"
                onClick={() => {
                  if (open) {
                    setOpen(false);
                    setSubmenu(null);
                  } else {
                    setOpen(true);
                  }
                }}
              >
                {!open && <Menu className="size-4" />}
                {open && <X className="size-4" />}
              </Button>
            </div>
          </div>

          {/* Mobile menu */}
          {/* The menu unrolls down from the nav bar with a CSS clip-path, so
              the shared layout does not need to ship Motion on every route. */}
          {open ? (
            <div
              className="mobile-menu-enter fixed inset-0 top-[77px] container flex h-[calc(100vh-77px)] w-full flex-col overflow-auto border-t border-border bg-background lg:hidden"
              onClick={(event) => {
                if (!(event.target instanceof Element) || !event.target.closest("a")) return;
                setOpen(false);
                setSubmenu(null);
              }}
            >
              {submenu && (
                <div className="mt-3">
                  <Button
                    variant="link"
                    onClick={() => setSubmenu(null)}
                    className="relative -left-4"
                  >
                    <ArrowLeft className="size-4 text-xs" />
                    Go back
                  </Button>
                </div>
              )}
              {submenu === null && (
                <div>
                  {navigationMenuItems.map((item, i) => (
                    <button
                      key={item.key}
                      type="button"
                      className="enter flex w-full items-center border-b border-border py-6 text-left [animation-duration:300ms]"
                      style={{ animationDelay: `${80 + i * 40}ms` }}
                      onClick={() => setSubmenu(item.key)}
                    >
                      <span className="flex-1 text-sm font-medium">{item.label}</span>
                      <span className="shrink-0">
                        <ArrowRight className="size-4" />
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {navigationMenuItems.map(
                (item) =>
                  submenu === item.key && (
                    <div key={item.key}>
                      <h2 className="pt-4 pb-6 text-lg font-medium">{item.label}</h2>
                      <item.component nav={nav} />
                    </div>
                  ),
              )}
              <div className="mx-[2rem] mt-auto flex flex-col items-center gap-8 py-24">
                <Link href="/contact" className={cn(buttonVariants(), "rounded-full px-5")}>
                  Contact
                </Link>
              </div>
            </div>
          ) : null}
        </NavigationMenu>
      </div>
    </section>
  );
};

export { Navbar4 };
