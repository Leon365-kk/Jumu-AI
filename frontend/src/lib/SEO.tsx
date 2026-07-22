import { useEffect, useRef } from "react";

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface PageSEO {
  title: string;
  description: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  openGraph?: { title?: string; description?: string; image?: string; url?: string; type?: string };
  twitter?: { card?: string; title?: string; description?: string; image?: string };
  noIndex?: boolean;
}

// ── Constants ──────────────────────────────────────────────────────────────

const BASE_URL = "https://jumu.ai";

// ── Update Page Metadata ───────────────────────────────────────────────────

export function updatePageMetadata(seo: PageSEO) {
  document.title = seo.title;

  upsertMeta("name", "description", seo.description);
  upsertMeta("name", "robots", seo.noIndex ? "noindex, nofollow" : "index, follow");

  if (seo.canonical) {
    let l = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!l) { l = document.createElement("link"); l.rel = "canonical"; document.head.appendChild(l); }
    l.href = seo.canonical;
  }

  const ogType = seo.ogType || seo.openGraph?.type || "website";
  const ogImage = seo.ogImage || seo.openGraph?.image || "";
  const ogUrl = seo.openGraph?.url || seo.canonical || "";

  upsertMeta("property", "og:title",       seo.openGraph?.title       || seo.title);
  upsertMeta("property", "og:description", seo.openGraph?.description || seo.description);
  ogImage && upsertMeta("property", "og:image", ogImage);
  ogUrl && upsertMeta("property", "og:url", ogUrl);
  upsertMeta("property", "og:type", ogType);

  if (seo.twitter) {
    upsertMeta("name", "twitter:title",       seo.twitter.title       || seo.title);
    upsertMeta("name", "twitter:description", seo.twitter.description || seo.description);
    seo.twitter.image && upsertMeta("name", "twitter:image",  seo.twitter.image);
    seo.twitter.card  && upsertMeta("name", "twitter:card",   seo.twitter.card  || "summary_large_image");
  }
}

function upsertMeta(attr: "name" | "property", attrValue: string, content: string) {
  const sel = `meta[${attr}="${attrValue}"]`;
  let el = document.querySelector(sel) as HTMLMetaElement | null;
  if (el) { el.setAttribute("content", content); return; }
  el = document.createElement("meta");
  el.setAttribute(attr, attrValue);
  el.setAttribute("content", content);
  document.head.appendChild(el);
}

// ── Default Export: <SEO /> React Component ────────────────────────────────

export interface SEOCompProps extends PageSEO {}

/** Renders nothing. Use at the top of any page component's JSX return. */
export default function SEO(props: SEOCompProps) {
  // Delegate to updatePageMetadata so the return-value contract (cleanup fn)
  // works with both direct-call and component-call patterns.
  useEffect(() => {
    updatePageMetadata(props);
  }, [props.title, props.description, props.canonical, props.noIndex]);
  return null;
}

// ── Per-Route Metadata Config ───────────────────────────────────────────────

// ── Per-Route Metadata Config ───────────────────────────────────────────────

export const pageMetadata: Record<string, PageSEO> = {
  "/": {
    title: "Jumu AI — Learn with Joy, Not Struggle",
    description:
      "Jumu AI provides reading assistance, math visualization, and focus tools designed specifically for students with ADHD, dyslexia, and other learning differences. Free to try.",
    canonical: BASE_URL,
    openGraph: {
      title: "Jumu AI — Learn with Joy, Not Struggle",
      description:
        "Reading assistance, math visualization, and focus tools designed for students with ADHD, dyslexia, and processing differences.",
      image: `${BASE_URL}/og-image.png`,
      url: BASE_URL,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Jumu AI — Learn with Joy, Not Struggle",
      description:
        "Reading tools, math helper, and focus timer for students who learn differently.",
      image: `${BASE_URL}/og-image.png`,
    },
  },
  "/reader": {
    title: "Smart Reader — Jumu AI",
    description:
      "Text-to-speech reading with OpenDyslexic fonts, instant word definitions, custom speed controls, and reading comprehension support. Designed for students with dyslexia and reading difficulties.",
    openGraph: {
      title: "Smart Reader — Jumu AI",
      description:
        "Text-to-speech reading with OpenDyslexic fonts, voice narration, and comprehension support.",
    },
  },
  "/library": {
    title: "Free Books Library — Jumu AI",
    description:
      "Browse thousands of free classic books from Project Gutenberg in the Jumu AI Library. Accessible reading with text-to-speech for all ages and abilities.",
    openGraph: {
      title: "Free Books Library — Jumu AI",
      description:
        "Discover thousands of free classic books with accessibility-first reading tools. Find your next adventure in the Jumu AI Library.",
    },
  },
  "/writer": {
    title: "Story Maker — Jumu AI",
    description:
      "Create your own stories with guided writing prompts and genre templates. Build creative writing skills through structured storytelling exercises.",
    openGraph: {
      title: "Story Maker — Jumu AI",
      description:
        "Create stories with guided writing prompts and genre templates. Choose adventure, mystery, sci-fi, and more.",
    },
  },
  "/math": {
    title: "Math Visualizer — Jumu AI",
    description:
      "Break down math problems into step-by-step explanations. Upload a worksheet or snap a photo to see each solution step clearly explained.",
    openGraph: {
      title: "Math Visualizer — Jumu AI",
      description:
        "Step-by-step math explanations with visual guides. Camera or file upload supported.",
    },
  },
  "/focus-zone": {
    title: "Focus Zone — Jumu AI",
    description:
      "A focus timer with ambient sounds including rain, forest, and white noise. Includes visual fidget tools and task tracking for students who need sensory regulation.",
    openGraph: {
      title: "Focus Zone — Jumu AI",
      description:
        "Focus timer with ambient sounds and visual tools for sensory regulation.",
    },
  },
  "/camera": {
    title: "Camera OCR — Jumu AI",
    description:
      "Take a photo or upload an image and extract text instantly with Jumu AI's OCR reader. Open-source, local processing — your photos never leave your device.",
    openGraph: {
      title: "Camera OCR — Jumu AI",
      description:
        "Extract text from photos and documents instantly using local OCR. Fully private, open-source text recognition.",
    },
    noIndex: true,
  },
  "/progress": {
    title: "Reading Progress — Jumu AI",
    description:
      "Track your reading time, pages read, comprehension scores, and weekly activity. View your streaks and achievements in one dashboard.",
    openGraph: {
      title: "Reading Progress — Jumu AI",
      description:
        "Track reading time, pages, comprehension scores, and achievements.",
    },
  },
  "/glossary": {
    title: "Personal Glossary — Jumu AI",
    description:
      "Build your personal vocabulary glossary with Jumu AI. Save words you encounter while reading with definitions, examples, and IPA pronunciations.",
    openGraph: {
      title: "Personal Glossary — Jumu AI",
      description:
        "Save and review new words you discover while reading. Build a richer vocabulary at your own pace.",
    },
  },
  "/dashboard": {
    title: "Dashboard — Jumu AI",
    description:
      "Your learning dashboard with daily progress, reading challenges, badges, and weekly activity stats.",
    openGraph: {
      title: "Dashboard — Jumu AI",
      description:
        "Daily progress stats, challenges, badges, and activity tracking.",
    },
  },
  "/login": {
    title: "Sign In — Jumu AI",
    description:
      "Sign in to your Jumu AI account. Create with Google or email, or continue as a guest — free to start.",
    openGraph: {
      title: "Sign In to Jumu AI",
      description:
        "Start your learning adventure with Jumu AI. Sign in with Google, use email, or try guest mode — all for free.",
    },
  },
  "/settings": {
    title: "Settings — Jumu AI",
    description:
      "Customize your Jumu AI experience. Adjust your preferred language, theme, font (including OpenDyslexic), reading goals, and voice assistant settings.",
    openGraph: {
      title: "Settings — Jumu AI",
      description:
        "Personalize your learning: language, theme, OpenDyslexic font, accessibility preferences, and reading goals.",
    },
    noIndex: true,
  },
};
