import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { seedSales, domainToSlug } from "@/lib/seed-sales";

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

export async function generateStaticParams() {
  const venues = new Set<string>();
  for (const s of seedSales) {
    const key = matchVenue(s.venue || "");
    if (key) venues.add(key);
  }
  return Array.from(venues).map((venue) => ({ venue }));
}

const VENUE_LABELS: Record<string, string> = {
  "namepros": "NamePros Forum",
  "sedo": "Sedo",
  "afternic": "Afternic",
  "dn-journal": "DN Journal",
  "godaddy": "GoDaddy",
  "dynadot": "Dynadot",
  "namecheap": "Namecheap",
  "private": "Private / Reported",
  "flippa": "Flippa",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ venue: string }>;
}): Promise<Metadata> {
  const { venue } = await params;
  const label = VENUE_LABELS[venue] || venue;
  return {
    title: `.ai Domain Sales on ${label} | NameBuzz`,
    description: `Browse all verified .ai domain sales on ${label}. See what AI domains are selling for across this marketplace.`,
    alternates: {
      canonical: `https://namebuzz.co/domains/venue/${venue}`,
    },
  };
}

export default async function VenuePage({
  params,
}: {
  params: Promise<{ venue: string }>;
}) {
  const { venue } = await params;
  const venueKey = venue.toLowerCase();
  const venueLabel = VENUE_LABELS[venueKey] || venue;

  const sales = seedSales
    .filter((s) => matchVenue(s.venue || "") === venueKey)
    .sort((a, b) => b.price - a.price);

  const totalVolume = sales.reduce((sum, s) => sum + s.price, 0);
  const avgPrice = sales.length > 0 ? Math.round(totalVolume / sales.length) : 0;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0]">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <Link href="/" className="mb-6 inline-block text-sm text-[#00D4FF] hover:underline">
          &larr; Back to Home
        </Link>
        <h1 className="mb-2 text-3xl font-bold">
          <span className="text-[#00FF88]">.ai</span> Domain Sales — {venueLabel}
        </h1>
        <p className="mb-8 text-[#888]">
          {sales.length.toLocaleString()} sales &bull; ${(totalVolume / 1_000_000).toFixed(1)}M total volume &bull; avg ${avgPrice.toLocaleString()}
        </p>

        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-[#1F1F1F] bg-[#111] p-4 text-center">
            <p className="text-2xl font-bold text-[#00FF88]">{sales.length.toLocaleString()}</p>
            <p className="text-xs text-[#888]">Total Sales</p>
          </div>
          <div className="rounded-xl border border-[#1F1F1F] bg-[#111] p-4 text-center">
            <p className="text-2xl font-bold text-[#00FF88]">${(totalVolume / 1_000_000).toFixed(1)}M</p>
            <p className="text-xs text-[#888]">Total Volume</p>
          </div>
          <div className="rounded-xl border border-[#1F1F1F] bg-[#111] p-4 text-center">
            <p className="text-2xl font-bold text-[#00FF88]">${avgPrice.toLocaleString()}</p>
            <p className="text-xs text-[#888]">Avg Price</p>
          </div>
        </div>

        {sales.length === 0 ? (
          <p className="text-[#555]">No sales data for this venue.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[#1F1F1F]">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#1F1F1F] bg-[#111]">
                <tr>
                  <th className="px-4 py-3 font-medium text-[#888]">Domain</th>
                  <th className="px-4 py-3 font-medium text-[#888]">Price</th>
                  <th className="px-4 py-3 font-medium text-[#888]">Date</th>
                  <th className="px-4 py-3 font-medium text-[#888]">Venue</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.domain + s.date} className="border-b border-[#1F1F1F] hover:bg-[#1A1A1A]">
                    <td className="px-4 py-3">
                      <Link href={`/sales/${domainToSlug(s.domain)}`} className="text-[#00D4FF] hover:underline">
                        {s.domain}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[#00FF88]">{s.priceFormatted}</td>
                    <td className="px-4 py-3 text-[#888]">{s.date}</td>
                    <td className="px-4 py-3 text-[#888]">{s.venue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 rounded-xl border border-[#1F1F1F] bg-[#111] p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">Browse all categories</p>
          <Link href="/domains/premium" className="mr-4 text-sm text-[#00FF88] hover:underline">Premium domains</Link>
          <Link href="/domains/short" className="mr-4 text-sm text-[#00FF88] hover:underline">Short domains</Link>
          <Link href="/domains/single-word" className="mr-4 text-sm text-[#00FF88] hover:underline">Single-word domains</Link>
          <Link href="/sales" className="text-sm text-[#00D4FF] hover:underline">All .ai sales →</Link>
        </div>
      </div>
    </div>
  );
}
