"use client";

import { ArrowUpRight, Check, Copy, FileText, LockOpen, Quote, Users } from "lucide-react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { SegmentedControl } from "@/components/segmented-control";
import {
  type Entry,
  NO_FILTERS,
  type PubFilters,
  PublicationFilterBar,
  TYPE_GROUP_LABELS,
  TYPE_LABELS,
  type ViewMode,
  applyFilters,
  groupCounts,
  isFiltered,
  toggleIn,
  viewOptions,
} from "@/components/publication-filters";
import { copyToClipboard, generateBibTeX } from "@/lib/citation";
import { AsteriskMark, SquiggleText } from "@/components/marks";
import { PersonFaces, type Person } from "@/components/person-chip";
import { displaySectionTitle } from "@/lib/typography";
import { cn } from "@/lib/utils";

export type Publication = {
  id: string;
  title: string;
  /** The publication's own page; rows link their title to it. */
  href?: string | null;
  authors: string;
  /**
   * The Lab's own people among the authors, in author order. Faces, not a
   * count: the names stay in `authors`, which still carries every author,
   * inside the Lab and out.
   */
  authorFaces?: Person[] | null;
  venue?: string | null;
  award?: string | null;
  pdfLink?: string | null;
  projectLink?: string | null;
  doi?: string | null;
  citationText?: string | null;
  themes?: string[] | null;
  isOpenAccess?: boolean | null;
  isCollaboration?: boolean | null;
  type?:
    | "conference"
    | "journal"
    | "workshop"
    | "preprint"
    | "extended-abstract"
    | "study-protocol"
    | "book-chapter"
    | null;
};

export type PublicationYear = {
  year: number;
  publications: Publication[];
};

/** Names to emphasise in author lists (the Lab's PI); supplied by the page. */
function AuthorList({ authors, highlight = [] }: { authors: string; highlight?: string[] }) {
  const parts = authors.split(", ");
  return (
    <>
      {parts.map((name, i) => {
        const bold = highlight.includes(name.trim());
        return (
          <Fragment key={i}>
            {i > 0 && ", "}
            {bold ? <strong className="font-semibold text-foreground">{name}</strong> : name}
          </Fragment>
        );
      })}
    </>
  );
}

type CiteFmt = "apa" | "bib";

function CiteDialog({ pub, year }: { pub: Publication; year: number }) {
  const [fmt, setFmt] = useState<CiteFmt>("apa");
  const [copied, setCopied] = useState(false);

  const text = fmt === "apa" ? (pub.citationText ?? "") : generateBibTeX(pub, year);

  async function handleCopy() {
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Quote className="size-4" />
          Cite
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="pr-6 text-sm font-medium leading-snug text-muted-foreground">
            {pub.title}
          </DialogTitle>
        </DialogHeader>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={fmt === "apa" ? "default" : "ghost"}
            onClick={() => setFmt("apa")}
          >
            APA
          </Button>
          <Button
            size="sm"
            variant={fmt === "bib" ? "default" : "ghost"}
            onClick={() => setFmt("bib")}
          >
            BibTeX
          </Button>
        </div>
        <pre
          className={cn(
            "rounded-md bg-muted p-3 text-sm whitespace-pre-wrap break-words",
            fmt === "bib" && "font-mono",
          )}
        >
          {text}
        </pre>
        {/* Both labels stay mounted and crossfade, with a 2px blur on the one
            leaving so the swap reads as one change rather than two overlapping
            words. The check pops in from 0.8. */}
        <Button
          variant="outline"
          onClick={handleCopy}
          className="w-full transition-transform duration-150 ease-snappy active:scale-[0.97]"
        >
          <span className="grid place-items-center [&>*]:col-start-1 [&>*]:row-start-1">
            <span
              aria-hidden={copied}
              className={cn(
                "inline-flex items-center gap-2 transition-[opacity,filter] duration-150 ease-snappy",
                copied ? "opacity-0 blur-[2px]" : "opacity-100",
              )}
            >
              <Copy className="size-4" />
              Copy
            </span>
            <span
              aria-hidden={!copied}
              className={cn(
                "inline-flex items-center gap-2 transition-[opacity,filter] duration-150 ease-snappy",
                copied ? "opacity-100" : "opacity-0 blur-[2px]",
              )}
            >
              <Check
                className={cn(
                  "size-4 text-brand transition-transform duration-200 ease-snappy",
                  copied ? "scale-100" : "scale-80",
                )}
              />
              Copied
            </span>
          </span>
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function PubActions({ pub, year }: { pub: Publication; year: number }) {
  return (
    <div className="relative z-10 flex flex-wrap gap-2">
      {pub.pdfLink && (
        <Button variant="ghost" size="sm" asChild>
          <a href={pub.pdfLink} target="_blank" rel="noopener noreferrer">
            <FileText className="size-4" />
            PDF
          </a>
        </Button>
      )}
      {pub.doi && (
        <Button variant="ghost" size="sm" asChild>
          <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer">
            <ArrowUpRight className="size-4" />
            DOI
          </a>
        </Button>
      )}
      {pub.citationText && <CiteDialog pub={pub} year={year} />}
      {pub.projectLink && (
        <Button variant="ghost" size="sm" asChild>
          <a href={pub.projectLink} target="_blank" rel="noopener noreferrer">
            <ArrowUpRight className="size-4" />
            Project
          </a>
        </Button>
      )}
    </div>
  );
}

// One publication, as listed everywhere. This is the unit that maps to a
// Payload Publication, so it exists exactly once.
function PublicationRow({
  pub,
  year,
  showYear = false,
  highlightAuthors,
  query,
}: {
  pub: Publication;
  year: number;
  showYear?: boolean;
  highlightAuthors?: string[];
  /** Active search term, marked inside the title so a hit is visible in place. */
  query?: string;
}) {
  return (
    // Same hover as the theme and project rows: the paper darkens a step and
    // the title is underlined line by line. The row bleeds past the page's
    // left and right edges by its own padding, so the text stays on the grid.
    <div className="group relative -mx-4 rounded-lg px-4 py-6 transition-colors duration-150 ease-snappy hover:bg-muted/50">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <p>
            {/* The title is the row's link, stretched over the whole row by a
                pseudo-element so the paper darkens and the words underline as
                one gesture. The action buttons sit above it on z-10, so a click
                on PDF or Cite is still a click on PDF or Cite. */}
            {pub.href ? (
              <Link href={pub.href} className="before:absolute before:inset-0 before:rounded-lg">
                <SquiggleText
                  highlight={query}
                  className="max-w-4xl font-display text-xl leading-snug text-pretty md:text-2xl"
                >
                  {pub.title}
                </SquiggleText>
              </Link>
            ) : (
              <SquiggleText
                highlight={query}
                className="max-w-4xl font-display text-xl leading-snug text-pretty md:text-2xl"
              >
                {pub.title}
              </SquiggleText>
            )}
          </p>
          {/* A div, not a p: the portraits carry their own frame element, which
              is not valid inside a paragraph and breaks hydration there. */}
          <div className="text-sm text-muted-foreground">
            {/* Faces lead the author line where the Lab has people on the paper:
                a publication list is otherwise a wall of names, and these are
                the names a visitor is looking for. Set inside the paragraph, so
                a long author list wraps under them instead of pushing every
                name onto a line of its own. */}
            {pub.authorFaces && pub.authorFaces.length > 0 && (
              <PersonFaces people={pub.authorFaces} size="sm" className="mr-2 align-middle" />
            )}
            <AuthorList authors={pub.authors} highlight={highlightAuthors} />
            {showYear && <span className="before:mx-2 before:content-['·']">{year}</span>}
          </div>
        </div>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {pub.venue && <span className="font-medium text-foreground">{pub.venue}</span>}
            {pub.type && <span>{TYPE_LABELS[pub.type] ?? pub.type}</span>}
            {pub.award && (
              <span className="inline-flex items-center gap-1.5 rounded-[0.8rem] border border-ink/35 bg-ink/8 px-2.5 py-0.5 text-ink">
                <AsteriskMark className="size-3" />
                {pub.award}
              </span>
            )}
            {pub.isOpenAccess && (
              <span title="Open Access" className="inline-flex items-center gap-1">
                <LockOpen className="size-3.5" aria-hidden />
                Open access
              </span>
            )}
            {pub.isCollaboration && (
              <span title="External Collaboration" className="inline-flex items-center gap-1">
                <Users className="size-3.5" aria-hidden />
                Collaboration
              </span>
            )}
          </div>
          <PubActions pub={pub} year={year} />
        </div>
      </div>
    </div>
  );
}

type Group = {
  /** The facet value this group stands for — what clicking its header filters to. */
  key: string;
  label: string;
  /** False for the synthetic catch-alls ("Other", "Uncategorized"), which name no facet value. */
  filterable: boolean;
  publications: Publication[];
};

/**
 * Layout animation is per-row, so it costs something on a long list. DIAL's
 * real corpus is ~250 papers; below this many the reflow is worth watching,
 * above it the list just crossfades.
 */
const LAYOUT_ANIMATION_LIMIT = 60;

function buildGroups(visible: Entry<Publication>[], view: ViewMode): Group[] {
  const map = new Map<string, Group>();
  const add = (key: string, label: string, filterable: boolean, pub: Publication) => {
    const group = map.get(key) ?? { key, label, filterable, publications: [] };
    group.publications.push(pub);
    map.set(key, group);
  };

  for (const { pub, year } of visible) {
    if (view === "all") {
      add(String(year), String(year), true, pub);
    } else if (view === "venue") {
      if (pub.venue) add(pub.venue, pub.venue, true, pub);
      else add("\u0000other", "Other", false, pub);
    } else if (view === "theme") {
      if (pub.themes?.length) for (const theme of pub.themes) add(theme, theme, true, pub);
      else add("\u0000uncategorized", "Uncategorized", false, pub);
    } else {
      if (pub.type) add(pub.type, TYPE_GROUP_LABELS[pub.type] ?? pub.type, true, pub);
      else add("\u0000other", "Other", false, pub);
    }
  }

  const groups = [...map.values()];
  // Years read newest-first; every other arrangement is alphabetical, with the
  // synthetic catch-all pushed to the bottom where it belongs.
  return groups.sort((a, b) => {
    if (a.filterable !== b.filterable) return a.filterable ? -1 : 1;
    if (view === "all") return Number(b.key) - Number(a.key);
    return a.label.localeCompare(b.label);
  });
}

/** Clicking a group's name narrows the list to it — grouping and filtering, one gesture. */
function withGroupSelected(filters: PubFilters, group: Group): PubFilters {
  switch (filters.view) {
    case "all":
      return { ...filters, years: toggleIn(filters.years, Number(group.key)) };
    case "venue":
      return { ...filters, venues: toggleIn(filters.venues, group.key) };
    case "theme":
      return { ...filters, themes: toggleIn(filters.themes, group.key) };
    case "type":
      return { ...filters, types: toggleIn(filters.types, group.key) };
  }
}

function groupIsSelected(filters: PubFilters, group: Group): boolean {
  switch (filters.view) {
    case "all":
      return filters.years.includes(Number(group.key));
    case "venue":
      return filters.venues.includes(group.key);
    case "theme":
      return filters.themes.includes(group.key);
    case "type":
      return filters.types.includes(group.key);
  }
}

// Sticky "you are here" header for the grouped list (after skiper74): tracks
// which group section is under the header's bottom edge.
const ACTIVE_GROUP_LINE = 80; // px — the sticky header's height (h-20)

function useActiveGroup(groupKeys: string) {
  const sectionRefs = useRef(new Map<string, HTMLElement>());
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const intersecting = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const key = (entry.target as HTMLElement).dataset.groupKey!;
          if (entry.isIntersecting) intersecting.add(key);
          else intersecting.delete(key);
        }
        setActive(intersecting.values().next().value ?? null);
      },
      {
        rootMargin: `-${ACTIVE_GROUP_LINE}px 0px -${Math.max(window.innerHeight - ACTIVE_GROUP_LINE - 1, 0)}px 0px`,
      },
    );
    for (const el of sectionRefs.current.values()) observer.observe(el);
    return () => observer.disconnect();
  }, [groupKeys]);

  const register = (key: string) => (el: HTMLElement | null) => {
    if (el) sectionRefs.current.set(key, el);
    else sectionRefs.current.delete(key);
  };

  return { active, register };
}

function groupCountLabel(group: Group) {
  const n = group.publications.length;
  return `${n} ${n === 1 ? "publication" : "publications"}`;
}

/**
 * True once `ref`'s element has scrolled up past the sticky line.
 *
 * This is what hands the arrangement control over: the filter bar's copy and
 * the sticky bar's copy are the same control — both read and write
 * `filters.view`, so they always agree — and showing both at once reads as two
 * controls fighting. The sticky one appears only once the real one is gone.
 */
function useScrolledPast(enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [past, setPast] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // Measured on scroll rather than watched with an IntersectionObserver.
    // An observer only reports threshold *crossings*, so anything that moves
    // the page without crossing one — scroll restoration on reload, a jump
    // straight to an anchor, a zoom or layout shift under a stationary
    // scrollTop — leaves it reporting the position the page no longer has,
    // and the control never appears. Reading the rect always answers for the
    // position the page is actually at; it is one rect per animation frame,
    // and only while scrolling.
    let frame = 0;
    const measure = () => {
      frame = 0;
      const el = ref.current;
      if (el) setPast(el.getBoundingClientRect().bottom <= ACTIVE_GROUP_LINE);
    };
    const schedule = () => {
      frame ||= requestAnimationFrame(measure);
    };

    // Scheduled rather than called: a synchronous setState inside an effect
    // is a second render before paint, and the first frame is soon enough.
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [enabled]);

  // `enabled` gates the result rather than resetting the state, so turning the
  // filter bar off needs no extra render to forget where it used to be.
  return { ref, past: enabled && past };
}

/**
 * The sticky bar: where you are in the list, and — once you have scrolled past
 * the filter bar — the arrangement control that put you there. Those were two
 * separate things, which meant that regrouping a long list began with scrolling
 * back to the top of it.
 *
 * The group name keeps the skiper74 treatment (active group in full colour,
 * its count muted) and stays `aria-hidden`: it restates the real group header
 * scrolling underneath it. The control beside it is the live one.
 */
function StickyBar({
  group,
  filters,
  onFiltersChange,
  groupCounts: counts,
  showControl,
}: {
  group: Group | undefined;
  filters: PubFilters;
  onFiltersChange: (f: PubFilters) => void;
  groupCounts: Record<ViewMode, number>;
  /** Only once the filter bar's own copy of this control is off screen. */
  showControl: boolean;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <header className="sticky top-0 z-10 flex h-20 items-end justify-between gap-4 border-b border-foreground/20 bg-background pb-4">
      {/* Two flex items, not one truncating line: the name is the part that
          can run long (a spelt-out journal title), so it is the part that gets
          clipped. The count is three characters and always worth keeping. */}
      <span
        aria-hidden
        className="flex min-w-0 items-baseline gap-2 font-display text-2xl text-foreground/45 md:text-3xl"
      >
        {group && (
          <>
            <motion.span
              key={group.label}
              initial={reduceMotion ? { opacity: 0 } : { x: -5, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="min-w-0 truncate text-foreground"
            >
              {group.label}
            </motion.span>
            <span className="shrink-0">{groupCountLabel(group)}</span>
          </>
        )}
      </span>
      <AnimatePresence initial={false}>
        {showControl && (
          <motion.div
            key="arrangement"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            className="hidden shrink-0 md:block"
          >
            <SegmentedControl
              label="Group publications"
              size="sm"
              options={viewOptions(counts)}
              value={filters.view}
              onChange={(view) => onFiltersChange({ ...filters, view })}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

interface PublicationsSectionProps {
  yearGroups: PublicationYear[];
  highlightAuthors?: string[];
  /** null when the page header already names the list. */
  heading?: string | null;
  viewAllHref?: string;
  viewAllLabel?: string;
  showFilters?: boolean;
  /** Supply both to drive the filters from outside (the URL wrapper does). */
  filters?: PubFilters;
  onFiltersChange?: (filters: PubFilters) => void;
}

const PublicationsSection = ({
  yearGroups,
  highlightAuthors,
  heading = "Publications",
  viewAllHref,
  viewAllLabel = "View all publications",
  showFilters = false,
  filters: controlledFilters,
  onFiltersChange,
}: PublicationsSectionProps) => {
  const reduceMotion = useReducedMotion();
  const [ownFilters, setOwnFilters] = useState<PubFilters>(NO_FILTERS);
  const filters = controlledFilters ?? ownFilters;
  const setFilters = onFiltersChange ?? setOwnFilters;

  // One flat list of {publication, year} is the shape every facet works on;
  // the year-grouped input is just how the page happens to hand it over.
  const entries = useMemo<Entry<Publication>[]>(
    () => yearGroups.flatMap((yg) => yg.publications.map((pub) => ({ pub, year: yg.year }))),
    [yearGroups],
  );
  const pubYear = useMemo(() => new Map(entries.map((e) => [e.pub.id, e.year])), [entries]);
  const allYears = useMemo(
    () => [...new Set(entries.map((e) => e.year))].sort((a, b) => a - b),
    [entries],
  );

  const visible = useMemo(() => applyFilters(entries, filters), [entries, filters]);
  const counts = useMemo(() => groupCounts(visible), [visible]);
  const groups = useMemo(() => buildGroups(visible, filters.view), [visible, filters.view]);

  const { active, register } = useActiveGroup(groups.map((g) => g.key).join("\u0000"));
  const activeGroup = groups.find((g) => g.key === active) ?? groups[0];

  // Embedded lists have no filter bar at all, so there is nothing to take over
  // from and nothing to put in the sticky bar.
  const { ref: filterBarRef, past: filterBarGone } = useScrolledPast(showFilters);

  const query = filters.q.trim();
  const animateRows = !reduceMotion && visible.length <= LAYOUT_ANIMATION_LIMIT;

  return (
    <>
      <section className="pt-8 lg:pt-16">
        <div className="container flex items-center justify-between">
          {heading ? <h2 className={displaySectionTitle}>{heading}</h2> : <span />}
          {viewAllHref && (
            <Button variant="outline" asChild className="rounded-full">
              <Link href={viewAllHref}>
                {viewAllLabel}
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="container mt-6" ref={filterBarRef}>
            <PublicationFilterBar
              entries={entries}
              filters={filters}
              onChange={setFilters}
              allYears={allYears}
            />
          </div>
        )}
      </section>

      {groups.length === 0 ? (
        <section className="py-8 lg:py-16">
          <div className="container">
            <p className="text-muted-foreground">
              No publications match the current filters.{" "}
              {isFiltered(filters) && (
                <button
                  type="button"
                  onClick={() => setFilters({ ...NO_FILTERS, view: filters.view })}
                  className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-current"
                >
                  Clear them
                </button>
              )}
            </p>
          </div>
        </section>
      ) : (
        <div className="container pt-8 pb-16 lg:pb-32">
          <div className="max-w-4xl">
            <StickyBar
              group={activeGroup}
              filters={filters}
              onFiltersChange={setFilters}
              groupCounts={counts}
              showControl={showFilters && filterBarGone}
            />
            {/* Keyed on the arrangement so switching it crossfades the whole
                list: rows cannot slide from a pile of years into a pile of
                venues, and pretending otherwise reads as a glitch. Narrowing
                *within* an arrangement is the case the row layout animation
                below handles. Pulled up under the sticky bar so the first
                group's own header hides behind it, as in skiper74. */}
            <motion.div
              key={filters.view}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              className="-mt-20"
            >
              {groups.map((group) => {
                const selected = groupIsSelected(filters, group);
                return (
                  <section
                    key={group.key}
                    ref={register(group.key)}
                    data-group-key={group.key}
                    className="pt-8 first:pt-0 lg:pt-16"
                  >
                    <header className="flex h-20 items-end border-b border-foreground/20 pb-2 text-xl font-medium tracking-tight text-foreground/50">
                      {group.filterable ? (
                        // The group name is the filter: you are already looking
                        // at the pile, clicking it keeps only that pile.
                        <button
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setFilters(withGroupSelected(filters, group))}
                          title={
                            selected
                              ? `Stop filtering to ${group.label}`
                              : `Show only ${group.label}`
                          }
                          className="group/label flex items-baseline gap-1 text-left"
                        >
                          <span
                            className={cn(
                              "mr-1 underline-offset-4 transition-colors duration-150 ease-snappy",
                              selected
                                ? "text-brand underline decoration-brand/40"
                                : "text-foreground group-hover/label:underline group-hover/label:decoration-border",
                            )}
                          >
                            {group.label}
                          </span>
                          <span>/ {groupCountLabel(group)}</span>
                        </button>
                      ) : (
                        <>
                          <span className="mr-1 text-foreground">{group.label}</span>/{" "}
                          {groupCountLabel(group)}
                        </>
                      )}
                    </header>
                    <ul>
                      <AnimatePresence initial={false} mode="popLayout">
                        {group.publications.map((pub) => (
                          <motion.li
                            key={pub.id}
                            layout={animateRows ? "position" : false}
                            exit={animateRows ? { opacity: 0, scale: 0.98 } : { opacity: 0 }}
                            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                          >
                            <PublicationRow
                              pub={pub}
                              year={pubYear.get(pub.id) ?? 0}
                              showYear={filters.view !== "all"}
                              highlightAuthors={highlightAuthors}
                              query={query}
                            />
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </ul>
                  </section>
                );
              })}
            </motion.div>
          </div>
        </div>
      )}
    </>
  );
};

interface FlatPublicationListProps {
  yearGroups: PublicationYear[];
  highlightAuthors?: string[];
  /** Show each row's year inline, for lists that are not grouped by year. */
  showYear?: boolean;
  className?: string;
}

const FlatPublicationList = ({
  yearGroups,
  highlightAuthors,
  showYear = false,
  className,
}: FlatPublicationListProps) => {
  const pubYearMap = new Map<string, number>();
  for (const yg of yearGroups) {
    for (const pub of yg.publications) {
      pubYearMap.set(pub.id, yg.year);
    }
  }
  const pubs = yearGroups.flatMap((yg) => yg.publications);

  return (
    <div className={className}>
      <Separator />
      {pubs.map((pub, i) => {
        const year = pubYearMap.get(pub.id) ?? 0;
        return (
          <Fragment key={pub.id ?? i}>
            <PublicationRow
              pub={pub}
              year={year}
              highlightAuthors={highlightAuthors}
              showYear={showYear}
            />
            <Separator />
          </Fragment>
        );
      })}
    </div>
  );
};

// ─── URL state ───────────────────────────────────────────────────────────────

const VIEWS: ViewMode[] = ["all", "venue", "theme", "type"];

function readFilters(sp: URLSearchParams): PubFilters {
  const view = sp.get("view") as ViewMode | null;
  return {
    view: view && VIEWS.includes(view) ? view : "all",
    q: sp.get("q") ?? "",
    // Multi-value facets are repeated params rather than a joined string: a
    // venue name may contain a comma, and "CHI, EA" is one venue, not two.
    years: sp.getAll("year").map(Number).filter(Number.isFinite),
    venues: sp.getAll("venue"),
    themes: sp.getAll("theme"),
    types: sp.getAll("type"),
    openAccess: sp.get("open") === "1",
    collaboration: sp.get("collab") === "1",
  };
}

function writeFilters(f: PubFilters): string {
  const sp = new URLSearchParams();
  if (f.view !== "all") sp.set("view", f.view);
  if (f.q.trim()) sp.set("q", f.q.trim());
  for (const year of f.years) sp.append("year", String(year));
  for (const venue of f.venues) sp.append("venue", venue);
  for (const theme of f.themes) sp.append("theme", theme);
  for (const type of f.types) sp.append("type", type);
  if (f.openAccess) sp.set("open", "1");
  if (f.collaboration) sp.set("collab", "1");
  return sp.toString();
}

// URL-aware wrapper — use this (inside Suspense) on pages with filter UI
function PublicationsSectionWithUrl({
  yearGroups,
  ...rest
}: Omit<PublicationsSectionProps, "filters" | "onFiltersChange" | "showFilters">) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Seeded from the URL once, then owned here. The search box has to answer a
  // keystroke immediately; it cannot wait on a route transition to re-render.
  const [filters, setFilters] = useState<PubFilters>(() =>
    readFilters(new URLSearchParams(searchParams.toString())),
  );

  const current = searchParams.toString();

  useEffect(() => {
    const next = writeFilters(filters);
    if (next === current) return;
    // `replace`, not `push`: a filter bar that leaves a history entry behind
    // every keystroke makes the back button useless for leaving the page.
    // Debounced so a typed query settles into one entry rather than twelve.
    const id = setTimeout(() => {
      router.replace(`${pathname}${next ? `?${next}` : ""}`, { scroll: false });
    }, 250);
    return () => clearTimeout(id);
  }, [filters, current, pathname, router]);

  return (
    <PublicationsSection
      yearGroups={yearGroups}
      showFilters
      filters={filters}
      onFiltersChange={setFilters}
      {...rest}
    />
  );
}

export { PublicationsSection, PublicationsSectionWithUrl, FlatPublicationList };
