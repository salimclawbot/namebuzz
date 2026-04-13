import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { seedSales, domainToSlug } from "@/lib/seed-sales";

export async function generateStaticParams() {
  const years = new Set<string>();
  for (const s of seedSales) {
    if (s.date && s.date.length >= 4) {
      years.add(s.date.slice(0, 4));
    }
  }
  return Array.from(years).map((year) => ({ year }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>;
}): Promise<Metadata> {
  const { year } = await params;
  return {
    title: `.ai Domain Sales in ${year} | NameBuzz`,
    description: `Browse all verified .ai domain sales that occurred in ${year}. See what AI domains sold for and track market trends year over year.`,
    alternates: {
      canonical: `https://namebuzz.co/domains/year/${year}`,
    },
  };
}

export default async function YearPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  const yearNum = parseInt(year, 10);
  if (isNaN(yearNum)) notFound();

  const sales = seedSales
    .filter((s) => s.date && s.date.startsWith(year))
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
          <span className="text-[#00FF88]">.ai</span> Domain Sales — {year}
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
          <p className="text-[#555]">No sales data for {year}.</p>
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
      </div>
    </div>
  );
}
