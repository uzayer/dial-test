# DIAL site — route-by-route review

> **To Claude:** this is a manual visual review of every route type in `dial-test/`, on desktop and mobile. Each route below has my feedback for each viewport, with screenshots saved in this directory (`route-review/`). Fix everything I flagged. Where feedback lands on a shared component (navbar, footer, `ThemePage`, `MemberProfile`, …), fix it once at the component and tell me which other routes it changed. Anything marked **(question)** is me asking, not asking for a change — answer it before touching code. A viewport that's ticked with no notes looks right; an unticked one wasn't reviewed.

**Viewports:** desktop ≈ 1440px · mobile ≈ 390px

<!--
How to fill in:
  - Tick "- [x] Reviewed" once you've looked at that viewport.
  - One bullet per issue. Start with the part of the page: "**Hero** — title wraps badly".
  - Screenshot: drop the file in this folder, then add ![what it shows](./home-mobile-hero.png) under the bullet.
-->

## Routes

0. [Site-wide chrome](#0-site-wide-chrome) — navbar + mobile menu, footer, tab title/favicon, link previews
1. [Home](#1-home) — `/`
2. [About](#2-about) — `/about`
3. [Research overview](#3-research-overview) — `/research`
4. [Research theme](#4-research-theme) — `/research/[theme]`
5. [Projects index](#5-projects-index) — `/projects`
6. [Project detail](#6-project-detail) — `/projects/[slug]`
7. [Publications index](#7-publications-index) — `/publications`
8. [Publication detail](#8-publication-detail) — `/publications/[id]`
9. [People index](#9-people-index) — `/people`
10. [Person profile](#10-person-profile) — `/people/[slug]`
11. [News feed](#11-news-feed) — `/news`
12. [News post](#12-news-post) — `/news/[slug]`
13. [Awards](#13-awards) — `/awards`
14. [Join us](#14-join-us) — `/join-us`
15. [Contact](#15-contact) — `/contact`
16. [404](#16-404) — any unknown path
17. [Design system (internal)](#17-design-system-internal) — `/design-system`

---

## 0. Site-wide chrome

_navbar + mobile menu, footer, tab title/favicon, link previews_

#### Desktop

i think maybe the order should be "research", "lab", "publications", "people" because lab is at the end and it doesn't really receieve a lot of attention. some core pages like the about page for the lab got hidden into that submenu.

navbar megamenu opening on hover should happen instantly. this takes a while to happen and gets people confused. another open issue is the current hover/open behaviour. most people expect that clicking the link should lead to somewhere, although in this case, i think clicking should also lead to opening/closing the megamenu. actually i think might be best to remove on open/close animation from here? what would you suggest

research tab is fine, hover states reveal that all are clickable paths. although a way to make the /research route easier to understand as the primary would be good. i know it's a big tile but it feels off, the goal is for most people to click on that and see the overview of our research

publications, icons or some visual way to show awards would be great.

people is my favourite, it's fine

a note in general, on hover, how many visual changes would you actually want here? and i think we need to mix and match. currently in the navbar i've seen a icon tilt, background darken, and underline squiggle appear all at once. three together is too much, i think we need to pick and choose

lab megamenu should we call it design system or brand guidelines? i think we should pick one and stick to it, currently it's weird

/projects route should get a tile or it should be more proninent in the navbar

after i click on a page in the navbar, the navbar should disappear. for example, under the research menu if i click on the big tile that takes me to /research then the giant megamenu nav should disappear when i reach /research because i can't tell otherwise that i have reached the new page.

![alt text](<CleanShot 2026-09-23 at 2.57.33 AM@2x.png>) sometimes they have uneven left and right spacing in the tiles.

OG images:
Site default: http://localhost:3000/opengraph-image

not sure what feels off, maybe the line break

Publication: http://localhost:3000/publications/2026-google-maps-can-say-lot/opengraph-image

the wave is far too big. the underline squiggle doesn't cover the whole thing, and im not even sure if the underline is supposed to be there in the first place

bottom dial footer and top info showing the venue and everything is fine

Project: http://localhost:3000/projects/protibadi/opengraph-image
these are fine


News: http://localhost:3000/news/iftar-knowledge-dissemination-2026/opengraph-image
news copied the project OG image hence it's fine

Person: http://localhost:3000/people/nova-ahmed/opengraph-image
the underline doesn't cover the whole headline. not sure if we need an underline


all routes should have opengraph images that aren't just the landing page, they should all be dynamically generated. there's lots of routes that don't have an OG image yet.

#### Mobile


research megamenu not sure how people would understand research themes are cliclable. or am i overthinking it? mobiles have no hover states

everything else is fine

---

## 1. Home

`/`

#### Desktop

there's too much white space after the "in collboration with" section and it moves from #FBF7F2 to #F9F7F2 and it should just stay one color. the intial scrolling hero moved onto the next hero, that used a darken blur, that's fine. this section does not need that.


the "about dial" section needs some visual fluff. would a fieldnote work good here? i don't think it's visually interseting enough or aligned with the riso notebook art direction for people to click on the "about the lab" button

there should be a new section that takes users to /projects

#### Mobile

![alt text](<CleanShot 2026-09-23 at 2.15.57 AM@2x.png>) explore research and join the lab button should be aligned

research overlook section

![alt text](<DIAL — Design Inclusion and Access Lab.png>) real iphone screenshot shows this issue where holding one causes a big bar to come across the screen. 
![alt text](<CleanShot 2026-09-23 at 2.17.52 AM@2x.png>) but the simulated phone version does not show this error

![alt text](<CleanShot 2026-09-23 at 2.18.52 AM@2x.png>) the publications overview component, in mobile, should have its action buttons on aligned to the right. so DOI and cite buttons would be right alinged. this is a dense piece of UI showing information, we want it to be easier to scan.

i have a bigger problem with the publication component itself, which is that the venue and type, very important things, e.g., tochi and journal, or ictd and conference. these are really important to the viewer and should be scannable. currently it's sharing the same level of visual emphasis and space such as the tags "open access" and "collaboration". how can we redesign this while keeping the riso notebook theme?

---

## 2. About

`/about`

#### Desktop

the underline is currently broken on both desktop and mobile, and i'm not too sure if this place needs the underline 

![alt text](<CleanShot 2026-09-23 at 2.28.50 AM@2x.png>)
![alt text](<CleanShot 2026-09-23 at 2.29.01 AM@2x.png>)

also the image on the right is too big, so it hinders with the scroll bar on the right too.

the venues that DIAL publishes in is actually a big prestige signal marker for it as a lab, currently it's a list of venues in text, can we make this more visually prominent? any ideas

after the what we do sections, there's two images, they're asymmetrical on desktop, don't really know how to improve here. these are good placements for lab images that i don't have yet, so this as a stand-in works fine

values the lab holds on to. i think we can design this better. it feels like too much repetition of similar content visually, i need this to be scannable

fieldnote placement feels off

#### Mobile

covered everything in desktop

---

## 3. Research overview

`/research`

#### Desktop

not sure if header needs underline
same venue issue 

icons. this is a site-wide change that should happen, if i go to /projects and hover over a project, then the letter "user photo" does a tilt. the letter i think gets bigger and does a tilt. this is a useful pattern, there are more areas in the site that would benefit from this pattern. e.g., when i hover over a research theme listing.

it feels like a dump for research themes. it doesn't really say much about the research DIAL does

#### Mobile

on research themes why are there no icons

---

## 4. Research theme

`/research/[theme]`

#### Desktop

no issue

#### Mobile

no issue

---

## 5. Projects index

`/projects`

#### Desktop

no issue

#### Mobile

no issue

---

## 6. Project detail

`/projects/[slug]`

#### Desktop

no issue


![alt text](<CleanShot 2026-09-23 at 2.43.38 AM@2x.png>)

i have an issue with this component. the user photo and name are together, so it makes sense for them to be together in a pill. however the person's title is different and should be scannable. like say what if i just want to scan titles, not names, would it make more sense to break these apart and align differently? im not too sure how to solve this but i think i described the problem well. the title shouldn't be inside the pill, but i don't know what else to do either.
#### Mobile

no issue

---

## 7. Publications index

`/publications`

#### Desktop

the illustration on the right is too big.

![alt text](<CleanShot 2026-09-23 at 2.45.43 AM@2x.png>) this is flat list, is there anything else we can do?

some of the publication titles on hover feels bad when i have the squiggly underline because the titles are too long. let's not add the underline here, but what else can we show for emphasis?

![alt text](<CleanShot 2026-09-23 at 2.47.22 AM@2x.png>)

these are different sizes. they should be the same size and i prefer the bottom one's smaller size. another reason im saying is, there's visual separation in the bottom one that lets the user scan the number of published publications more easily.

#### Mobile

no issue

---

## 8. Publication detail

`/publications/[id]`

#### Desktop

no issue

#### Mobile

no issue

---

## 9. People index

`/people`

#### Desktop

![alt text](<CleanShot 2026-09-23 at 2.54.40 AM@2x.png>)

not sure about how her awards are displayed here, it's just a flat list

would changing the position of the searchbar help?

#### Mobile

no issue

---

## 10. Person profile

`/people/[slug]`

#### Desktop

awards are just a flat list, needs to change

#### Mobile

photo should be aligned. i think this section has container issues in the html and css, spend some time here to see if it can be simplified while keeping visual parity. 

---

## 11. News feed

`/news`

#### Desktop

no issue

#### Mobile

lists might want to hve the event type on right aligned or something else. current version is hard to scan through

---

## 12. News post

`/news/[slug]`

#### Desktop

no issue, has the same underlying template as project detail, right?
might want to remove underline

#### Mobile

no issue
no underline on header

---

## 13. Awards

`/awards`

#### Desktop

illustration is too big

#### Mobile

awarding bodies should be shown visually different. now it's just algined with the publication that earned it and it's hard to scan.

---

## 14. Join us

`/join-us`

#### Desktop

it's the same boring triplets in one section, even that section is repeated thrice. entire page needs a redesign

#### Mobile

same as above

---

## 15. Contact

`/contact`

#### Desktop

no issue

#### Mobile

no issue

---

## 16. 404

_any unknown path_

#### Desktop

you need to design one in the same riso notebook art direction and theme

#### Mobile

same as above

---

## 17. Design system (internal)

`/design-system`

#### Desktop

needs more explaining on hover and more in-context usage shown. need to create a more illustrations, expand the current set

#### Mobile

- [ ] Reviewed

---

## Anything else

- entire site has weird spacing between sections randomly. need to do a sweep
