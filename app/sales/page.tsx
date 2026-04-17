import Link from "next/link";
import type { Metadata } from "next";
import { seedSales, domainToSlug } from "@/lib/seed-sales";

export const metadata: Metadata = {
  title: ".ai Domain Sales — NameBuzz",
  description:
    "Browse all recent .ai domain name sales. See what AI domains are selling for across NamePros, DN Journal, Sedo, Afternic and more.",
  alternates: {
    canonical: "https://namebuzz.co/sales",
  },  openGraph: {
    title: ".ai Domain Sales — NameBuzz",
    description: "Browse all recent .ai domain name sales. See what AI domains are selling for across NamePros, DN Journal, Sedo, Afternic and more.",
    url: "https://namebuzz.co/sales",
    siteName: "NameBuzz",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: ".ai Domain Sales — NameBuzz",
    description: "Browse all recent .ai domain name sales. See what AI domains are selling for across NamePros, DN Journal, Sedo, Afternic and more.",
  },

};

export function generateSchema() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: ".ai Domain Sales — NameBuzz",
      description: "Browse all recent .ai domain name sales. See what AI domains are selling for across NamePros, DN Journal, Sedo, Afternic and more.",
      url: "https://namebuzz.co/sales",
      isPartOf: {
        "@type": "WebSite",
        name: "NameBuzz",
        url: "https://namebuzz.co",
      },
    },
  ];
}
export default function SalesPage() {
  const sales = [...seedSales].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA;
  });

  const totalSales = sales.length;
  const totalValue = sales.reduce((sum, s) => sum + s.price, 0);
  const avgPrice = Math.round(totalValue / totalSales);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0]">
      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            <span className="text-[#00FF88]">.ai</span> Domain Sales
          </h1>
          <p className="text-[#888]">
            Real data from NamePros, DN Journal, Sedo, Afternic & more
          </p>
        </div>

        {/* Stats bar */}
        <div className="mb-10 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-[#1F1F1F] bg-[#111] p-4 text-center">
            <p className="text-2xl font-bold text-[#00FF88]">{totalSales.toLocaleString()}</p>
            <p className="text-xs text-[#888]">Total Sales</p>
          </div>
          <div className="rounded-xl border border-[#1F1F1F] bg-[#111] p-4 text-center">
            <p className="text-2xl font-bold text-[#00FF88]">
              ${(totalValue / 1_000_000).toFixed(1)}M
            </p>
            <p className="text-xs text-[#888]">Total Value</p>
          </div>
          <div className="rounded-xl border border-[#1F1F1F] bg-[#111] p-4 text-center">
            <p className="text-2xl font-bold text-[#00FF88]">
              ${avgPrice.toLocaleString()}
            </p>
            <p className="text-xs text-[#888]">Average Price</p>
          </div>
        </div>

        {/* Sales table */}
        <div className="overflow-x-auto rounded-lg border border-[#1F1F1F]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#1F1F1F] bg-[#111]">
              <tr>
                <th className="px-4 py-3 font-medium text-[#888]">Domain</th>
                <th className="px-4 py-3 font-medium text-[#888]">Price</th>
                <th className="px-4 py-3 font-medium text-[#888]">Date</th>
                <th className="px-4 py-3 font-medium text-[#888]">Venue</th>
                <th className="px-4 py-3 font-medium text-[#888]">Source</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr
                  key={`${sale.domain}-${sale.date}`}
                  className="border-b border-[#1F1F1F] hover:bg-[#1A1A1A]"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/sales/${domainToSlug(sale.domain)}`}
                      className="text-[#00D4FF] hover:underline"
                    >
                      {sale.domain}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium text-[#00FF88]">
                    {sale.priceFormatted}
                  </td>
                  <td className="px-4 py-3 text-[#888]">
                    {sale.date || "—"}
                  </td>
                  <td className="px-4 py-3 text-[#888]">{sale.venue}</td>
                  <td className="px-4 py-3 text-[#888]">{sale.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CTA */}
        <div className="mt-10 rounded-xl border border-[#00FF88]/20 bg-[#111] p-6 text-center">
          <h3 className="mb-2 text-lg font-bold">
            Want to know what your .ai domain is worth?
          </h3>
          <p className="mb-4 text-sm text-[#888]">
            Get an instant estimate based on real sales data.
          </p>
          <Link
            href="/value"
            className="inline-block rounded-lg bg-[#00FF88] px-6 py-2.5 text-sm font-semibold text-[#0A0A0A] hover:bg-[#00CC6A]"
          >
            Estimate My Domain Value
          </Link>
        </div>
      </div>
          <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateSchema()) }}
      />
</div>
  );
}
