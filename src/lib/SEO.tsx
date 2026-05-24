import { useEffect, useRef } from "react";

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface PageSEO {
  title: string;
  description: string;
  canonical?: string;
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
    let l = document.querySelector('link[rel="canonical"]') as HTMLAnchorElement | null;
    if (!l) { l = document.createElement("link"); l.rel = "canonical"; document.head.appendChild(l); }
    l.href = seo.canonical;
  }

  if (seo.openGraph) {
    upsertMeta("property", "og:title",       seo.openGraph.title       || seo.title);
    upsertMeta("property", "og:description", seo.openGraph.description || seo.description);
    seo.openGraph.image && upsertMeta("property", "og:image", seo.openGraph.image);
    seo.openGraph.url   && upsertMeta("property", "og:url",   seo.openGraph.url);
    seo.openGraph.type  && upsertMeta("property", "og:type",  seo.openGraph.type);
  }

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
      "Jumu AI is a cognitive sanctuary for neurodiverse learners. Features smart text-to-speech reading, an AI-powered story maker, math visualizer, focus zone, and voice assistant. Free to try.",
    canonical: BASE_URL,
    openGraph: {
      title: "Jumu AI — Learn with Joy, Not Struggle",
      description:
        "A cognitive sanctuary for neurodiverse learners. AI-powered reading, math, and focus tools built with love for brains that work differently.",
      image: `${BASE_URL}/og-image.png`,
      url: BASE_URL,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Jumu AI — Learn with Joy, Not Struggle",
      description:
        "AI-powered learning companion. Smart Reader, Math Visualizer, Focus Zone & more — built for neurodiverse minds.",
      image: `${BASE_URL}/og-image.png`,
    },
  },
  "/reader": {
    title: "Smart Reader — Jumu AI",
    description:
      "Read with Jumu AI's text-to-speech Smart Reader. Features OpenDyslexic fonts, instant word definitions, custom speed controls, and AI-powered comprehension. Designed for neurodiverse learners.",
    openGraph: {
      title: "Smart Reader — Jumu AI",
      description:
        "Text-to-speech reading with OpenDyslexic fonts, voice narration, and AI comprehension. Making reading accessible and joyful.",
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
    title: "AI Story Maker — Jumu AI",
    description:
      "Transform your wild ideas into beautiful stories with the Jumu AI Story Maker. Let AI guide your creative writing journey with genre-specific templates.",
    openGraph: {
      title: "AI Story Maker — Jumu AI",
      description:
        "Turn your imagination into written stories with AI-guided templates. Choose adventure, mystery, sci-fi, and more.",
    },
  },
  "/math": {
    title: "Math Visualizer — Jumu AI",
    description:
      "Break down complex math problems into easy-to-follow steps with Jumu AI's Math Visualizer. Upload a problem or snap a photo for an instant step-by-step solution.",
    openGraph: {
      title: "Math Visualizer — Jumu AI",
      description:
        "AI-powered math tutor that breaks problems into friendly, visual, step-by-step guides. Camera or file upload supported.",
    },
  },
  "/focus-zone": {
    title: "Focus Zone — Jumu AI",
    description:
      "Enter the Focus Zone — a sensory-friendly environment with ambient white noise, pink noise, and rain sounds to help neurodiverse learners find their calm.",
    openGraph: {
      title: "Focus Zone — Jumu AI",
      description:
        "A safe harbor of ambient sounds and sensory tools to help you find your calm when the world feels too loud.",
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
      "Track your learning journey with Jumu AI's Progress dashboard. See your reading streaks, XP, badges, and weekly activity at a glance.",
    openGraph: {
      title: "Reading Progress — Jumu AI",
      description:
        "Track your reading streaks, XP, and badges. Celebrate every small victory on your personal learning journey.",
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
      "Your personalized Jumu AI dashboard. Track daily progress, view reading challenges, earn badges, and focus insights — all in one place.",
    openGraph: {
      title: "Dashboard — Jumu AI",
      description:
        "Your daily learning hub. Progress stats, challenges, badges, and AI insights to motivate you every day.",
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
