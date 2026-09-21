import type { Metadata } from "next";
import { Caveat, Geist, Geist_Mono, Fraunces, Mina } from "next/font/google";
import "./globals.css";
import { Navbar4 } from "@/components/navbar4";
import { Footer18 } from "@/components/footer18";
import { RevealObserver } from "@/components/reveal-observer";
import { getNavData } from "@/data/views";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Fonts that never appear in the first viewport skip preload, so they do not
// compete with the hero's Fraunces and Geist for bandwidth on first load.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

// Display serif for page and section titles. Bengali project names fall
// through to the Bengali face, so Project names like "স্যন্ধি" are
// set on purpose rather than in whatever the OS happens to have.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  // opsz tightens the letterforms at display sizes; SOFT is tuned in globals.css.
  axes: ["opsz", "SOFT"],
});

// Margin notes and annotations only, never body copy.
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  preload: false,
});

// Bengali in one face, Mina, behind every stack. Bengali subset only: the
// file loads only when Bengali glyphs are on the page, and Latin text never
// falls through to it.
const bengali = Mina({
  variable: "--font-bengali",
  weight: ["400", "700"],
  subsets: ["bengali"],
  preload: false,
});

// Runs before first paint so a stored dark preference never flashes light
// (navbar4's toggle writes the same key), and flags that JavaScript runs, so
// scroll reveals only hide content when something will reveal it.
const themeScript = `document.documentElement.classList.add("js");try{var t=localStorage.getItem("dial-theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;

export const metadata: Metadata = {
  title: {
    default: "DIAL — Design Inclusion and Access Lab",
    template: "%s | DIAL",
  },
  description:
    "Human-computer interaction research from the Design Inclusion and Access Lab at North South University, Dhaka.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // The theme script adds `dark` before hydration.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${caveat.variable} ${bengali.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <div data-site-nav-scope className="text-foreground">
          <Navbar4 nav={getNavData()} className="sticky" />
        </div>
        <main className="flex-1">{children}</main>
        <Footer18 />
        <RevealObserver />
      </body>
    </html>
  );
}
