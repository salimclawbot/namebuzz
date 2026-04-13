import type { MetadataRoute } from "next";
import { seedSales, domainToSlug } from "@/lib/seed-sales";
import { blogPosts } from "@/lib/blog-posts";

function getPriority(price: number): number {
  if (price >= 1_000_000) return 1.0;
  if (price >= 100_000) return 0.8;
  if (price >= 10_000) return 0.6;
  return 0.4;
}

function parseDate(dateStr: string): Date {
  if (!dateStr || dateStr.length < 4) return new Date("2026-01-01");
  if (dateStr.length === 4) return new Date(`${dateStr}-01-01`);
  const [y, m = "01", d = "01"] = dateStr.split("-");
  return new Date(`${y}-${m}-${d}`);
}

const VENUE_ALIASES: Record<string, string[]> = {
  "namepros": ["namepros forum", "namepros"],
  "sedo": ["sedo"],
  "afternic": ["afternic"],
  "dn-journal": ["dn journal", "dnjournal"],
  "godaddy": ["godaddy", "godaddy auctions"],
  "dynadot": ["dynadot"],
  "namecheap": ["namecheap"],
  "private": ["private", "reported"],
  "flippa": ["flippa"],
};

function matchVenue(venue: string): string | null {
  const v = venue.toLowerCase();
  for (const [key, aliases] of Object.entries(VENUE_ALIASES)) {
    if (aliases.some((a) => v.includes(a))) return key;
  }
  return null;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Year pages
  const years = new Set<string>();
  for (const s of seedSales) {
    if (s.date && s.date.length >= 4) years.add(s.date.slice(0, 4));
  }
  const yearPages = Array.from(years).map((year) => ({
    url: `https://namebuzz.co/domains/year/${year}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Venue pages
  const venues = new Set<string>();
  for (const s of seedSales) {
    const key = matchVenue(s.venue || "");
    if (key) venues.add(key);
  }
  const venuePages = Array.from(venues).map((venue) => ({
    url: `https://namebuzz.co/domains/venue/${venue}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const salePages: MetadataRoute.Sitemap = seedSales.map((sale) => {
    const lastMod = parseDate(sale.date);
    return {
      url: `https://namebuzz.co/sales/${domainToSlug(sale.domain)}`,
      lastModified: lastMod > now ? now : lastMod,
      changeFrequency: "monthly" as const,
      priority: getPriority(sale.price),
    };
  });

  const blogPages = blogPosts.map((post) => ({
    url: `https://namebuzz.co/blog/${post.slug}`,
    lastModified: now,
  }));

  return [
    { url: "https://namebuzz.co", lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: "https://namebuzz.co/sales", lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: "https://namebuzz.co/charts", lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: "https://namebuzz.co/value", lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: "https://namebuzz.co/blog", lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: "https://namebuzz.co/domains/short", lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: "https://namebuzz.co/domains/single-word", lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: "https://namebuzz.co/domains/premium", lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    ...yearPages,
    ...venuePages,
    ...salePages,
    ...blogPages,
  ];
}
