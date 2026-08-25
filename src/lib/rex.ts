// RExchange shared domain helpers.
// Designed for future upgrade (out of scope now): image upload, real-time chat,
// multi-party barter chain matching, real push notifications, full auth.

export const CATEGORIES = ["Item", "Service", "Notes", "Lend", "Request"] as const;
export type Category = (typeof CATEGORIES)[number];

export type ListingType = "offer" | "request";
export type TrustTier = "New" | "Trusted" | "Campus Regular";

export interface Listing {
  id: string;
  title: string;
  category: string;
  type: ListingType;
  description: string;
  poster_name: string;
  poster_year: string;
  // Contact is never part of the public feed payload; fetch it on demand.
  contact?: string;
  exchange_count: number;
  trust_tier: string;
  created_at: string;
}

export function tierFor(exchangeCount: number): TrustTier {
  if (exchangeCount >= 10) return "Campus Regular";
  if (exchangeCount >= 3) return "Trusted";
  return "New";
}

const STOP_WORDS = new Set([
  "a","an","the","for","to","of","and","or","my","me","i","is","are","need","needed","needs",
  "looking","want","wanted","anyone","some","with","on","in","at","it","this","that","can",
  "please","help","have","has","get","got","will","would","if","you","your","from","by","be",
  // generic time/logistics words — they create false matches between unrelated posts
  "morning","evening","afternoon","night","today","tomorrow","weekend","week","day","days",
  "year","years","hour","hours","time","soon","back","return","same","also","only","just","one","two",
]);

export function keywordsOf(text: string): string[] {
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2 && !STOP_WORDS.has(w)),
    ),
  );
}

/** Client-side keyword match score between a request text and an offer listing. */
export function matchScore(requestText: string, offer: Listing): number {
  const needle = keywordsOf(requestText);
  if (needle.length === 0) return 0;
  const hay = new Set(keywordsOf(`${offer.title} ${offer.description} ${offer.category}`));
  let score = 0;
  for (const word of needle) {
    if (hay.has(word)) score += 2;
    else if (
      word.length >= 5 &&
      [...hay].some((h) => h.length >= 5 && (h.startsWith(word) || word.startsWith(h)))
    )
      score += 1;
  }
  return score;
}

export function findMatches(requestText: string, listings: Listing[], limit = 3): Listing[] {
  return listings
    .filter((l) => l.type === "offer")
    .map((l) => ({ l, s: matchScore(requestText, l) }))
    .filter((x) => x.s >= 2)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.l);
}

export function textMatchesKeywords(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((k) => k.trim().length > 0 && lower.includes(k.trim().toLowerCase()));
}

const DEVICE_KEY = "rex-device-id";

export function getDeviceId(): string {
  if (typeof window === "undefined") return "server";
  let id = window.localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}
