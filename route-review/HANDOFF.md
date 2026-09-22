# Handoff — route-review fixes (session of 2026-09-23)

Read `review.md` in this folder first: it is the user's review this work answers. Nothing is committed yet. All edits are uncommitted in the working tree, on top of the user's own uncommitted work (member-profile / pi-profile / publication-post / mounted-portrait, plus bun.lock and skills-lock.json). Don't revert any of that.

## User instructions given during the session
- **Don't use Claude in Chrome.** Verify with `bunx tsc --noEmit -p .`, `bunx oxlint src`, `bunx oxfmt <files>` and `curl` against the dev server.
- **Use subagents where you can.** Forks worked well when each one owned a disjoint set of files.
- Never add Claude as co-author. Commit only when asked, with Conventional Commits (`fix:`, `feat:` …). Commitlint rejects anything else.

## Environment gotchas
- The dev server may or may not be running on :3000. Check with `lsof -iTCP:3000 -sTCP:LISTEN`. Start it with `bun dev` in the background, logging to the scratchpad `dev.log`.
- Tailwind v4 dev cache: a class like `max-[hover:none]:hidden` produces invalid CSS, and the stale build 500s every page until the dev server restarts, even after the class is gone from source.
- `.next/types/validator.ts` has a stale error for the old `src/app/design-system` path. Ignore it; it regenerates.

## Decisions made (answer these consistently in the final report)
1. **Hover vocabulary** (globals.css, "Hover vocabulary"): a hovered link answers with at most one word signal (squiggle, or on long publication titles a margin rule) plus one mark signal (`.mark-lift`, or an arrow turn when there is no mark). Backgrounds never darken on hover; `:active` press feedback stays. Hover is gated to `(hover: hover) and (pointer: fine)`, which also fixed the iOS long-press "big bar" (Safari dropped the wave mask on a pressed, scaled link).
2. **No squiggle under page titles anywhere**, including headers, detail pages, OG cards and contact. The squiggle means "this is a link".
3. **Megamenu:**
   - Order is Research · Lab · Publications · People.
   - Opens after a 75ms hover delay with no open/close/slide animation.
   - A click within 400ms of a hover-open keeps it open instead of toggling it shut.
   - Any link click, or a route change, closes it.
   - Research has a "Research overview" primary tile with a filled button, plus a Projects tile.
   - Rosette marks show awards; About leads the Lab menu.
   - Tile icons sit in a fixed `size-7` slot (the uneven spacing fix).
   - Rows show arrows below lg only.
   - NavigationMenuItems need an explicit `value={item.key}`; that bug has been fixed.
4. **"Brand guidelines" is the one name.** The route moved to `/brand`, with a 301 from `/design-system` in next.config.ts.
5. **Home:**
   - The colour change at the hero seam was the scroll hero's veils hanging past it. Fixed with `overflow-clip` on the hero root; the panel also no longer forces `min-h-screen` (that was the dead space), and its lift shadow fades via `--lift`.
   - The About DIAL section gets a FieldNote and a taped plate linking to /about.
   - New Projects section.
   - On phones the secondary action is an outline pill, so the two buttons align.
6. **PageHeader art** is smaller (22–26rem, was 30–34). CropMarks sit inside the gutter below `sm`, and `body { overflow-x: clip }` stops sideways scroll on phones.
7. **RosetteMark** (marks.tsx) means an award; AsteriskMark is a footnote.
8. **Project rows:** letter `.mark-lift`, no desktop arrow, no hover background.

## Fork results (all six finished)
- **F1 publications:**
  - PublicationRow has a venue/type ledger column (container-query based) and a kicker line when narrow.
  - Actions sit right-aligned.
  - Hover draws an ink margin rule instead of the squiggle.
  - Sticky and group headers now match ("2025 / N publications").
  - The Scholar line is face chips.
  - Its suggestion, still open: icon-only Open-access/Collaboration tags on phones.
- **F2 research/about:**
  - New `venue-ledger.tsx` (the mapper `topVenueEntries` was moved into views.ts).
  - About values are numbered ledger rows; the field note sits in a margin column by the method steps.
  - /research has a "through-line" narrative and per-theme example projects.
  - Theme glyphs lift, and show on phones.
  - Data helpers `venueRecords` and `themeExampleProjects` were appended to data/index.ts.
- **F3 people:**
  - New `award-list.tsx` with structured award data (the duplicate year is fixed).
  - The search box sits in "The team" header row.
  - Profile header flattened, portrait aligned on phones.
  - Project team grouped by role, with role headings.
  - The roster tilt bug is fixed; PersonChip hover no longer changes the background.
- **F4:**
  - News rows on phones: date left, type tag right.
  - Awards: new `award-stamp.tsx` makes the organization a distinct stamp line.
  - /join-us fully rebuilt (letter-style application, one InkBand, contact sheet).
  - New `app/not-found.tsx` (mis-registered 404).
  - `expandable-list` hover background removed, which also affects every FAQ.
- **F5 OG:**
  - Squiggle removed; the site card's line break fixed; publication-card art scales with title length.
  - OG images added for about, research plus the 9 themes (in their own ink), projects, publications, people, news, awards, join-us, contact and brand.
- **F6 /brand:**
  - Annotated specimens (hover/focus notes, always open on touch), an "In context" section, Do/Don't pairs, and eased motion demos.
  - Four new riso variants in riso.tsx: `thread`, `grid`, `echo`, `seed`.
  - This session's decisions are documented on the page.

## In progress when the session ended: spacing sweep (user item "weird spacing between sections")
Done so far:
- `sectionSpacing` in editorial.tsx is now the one rhythm, `py-12 md:py-16`.
- `sectionSpacingTight` was deleted and all its usages replaced.
- ClosingNote uses `sectionSpacing`.

Remaining. Rule: the first section under a PageHeader gets `cn("container", sectionSpacing, "pt-0 md:pt-0")`; every other page-level section gets `cn("container", sectionSpacing)`.
- `src/app/research/page.tsx`: the sections at ~l.91 (first under the header → pt-0), ~l.141 and ~l.145 still use `container pb-16 md:pb-24`.
- `src/app/about/page.tsx`: ~l.106 (VenueLedger, first → pt-0) uses `pb-16 md:pb-24`. The next section (~l.110) has `pt-0 md:pt-0` and should lose it.
- `src/app/awards/page.tsx` ~l.49: `container pb-24` → first → pt-0 token. `awards-filter-table.tsx` `<section className="pb-24">` → token.
- `src/components/news-feed.tsx`: the upcoming section `container pb-16` → token with pt-0; the archive `container pb-24` → token, pt-0 only when there are no upcoming entries.
- `src/app/projects/page.tsx` ~l.40: `<section className="container">` → token with pt-0.
- `src/app/publications/page.tsx`: FaqSection is first under the header → pass `className="pt-0 md:pt-0"`.
- `publications1.tsx` PublicationsSection: its own `pt-8 lg:pt-16` / `pb-16 lg:pb-32` is ad hoc. Consider `pb-12 md:pb-16` at the end.
- Check the detail pages too (project-post, publication-post, news-post, theme-page, people/[slug]) for `pb-24` etc.

Then: tsc, oxlint, oxfmt, and curl every route for 200 (/, /about, /research, /research/ictd, /projects, /projects/protibadi, /publications, /publications/2026-google-maps-can-say-lot, /people, /people/nova-ahmed, /news, /news/iftar-knowledge-dissemination-2026, /awards, /join-us, /contact, /brand, and a 404 path; plus `/opengraph-image` for each).

## Not yet done / to report to the user
- The final summary to the user: include per-route which shared-component changes affected which routes. Title squiggle removal and the hover rule touch almost every route; the expandable-list change hits every FAQ; CropMarks and PageHeader art hit every header page.
- Consider a LOG.md entry at the repo root (`../LOG.md`, newest first) for the non-obvious decisions: the hover vocabulary, no title squiggle, instant megamenu, `/brand`, one section rhythm, and why the hero root is `overflow-clip`.
- The user's `/find-animation-opportunities` and `/improve-animations` skills are read-only advisors. Their principles were applied: no animation on the high-frequency megamenu, hover gating, reduced motion. No `plans/` files were written; offer that if the user wants an animation audit report.
