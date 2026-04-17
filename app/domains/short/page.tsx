import type { Metadata } from "next";
import Link from "next/link";
import { seedSales, domainToSlug } from "@/lib/seed-sales";

export const metadata: Metadata = {
  title: "Short .ai Domain Sales (4 Characters or Less) | NameBuzz",
  description:
    "Browse verified sales of short .ai domain names — 4 characters or fewer. See prices, dates, and venues.",
  openGraph: {
    title: "Short .ai Domain Sales (4 Characters or Less) | NameBuzz",
    description:
      "Browse verified sales of short .ai domain names — 4 characters or fewer.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Short .ai Domain Sales (4 Characters or Less) | NameBuzz",
    description: "Browse verified sales of short .ai domain names — 4 characters or fewer. See prices, dates, and venues.",
  },
  alternates: {
    canonical: "https://namebuzz.co/domains/short",
  },
};

export function generateSchema() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Short .ai Domain Sales (4 Characters or Less) | NameBuzz",
      description: "Browse verified sales of short .ai domain names — 4 characters or fewer. See prices, dates, and venues.",
      url: "https://namebuzz.co/domains/short",
      isPartOf: {
        "@type": "WebSite",
        name: "NameBuzz",
        url: "https://namebuzz.co",
      },
    },
  ];
}

export default function ShortDomainsPage() {
  const shortSales = seedSales
    .filter((s) => s.domain.replace(/\.ai$/i, "").length <= 4)
    .sort((a, b) => b.price - a.price);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0]">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <Link href="/" className="mb-6 inline-block text-sm text-[#00D4FF] hover:underline">
          &larr; Back to All Sales
        </Link>
        <h1 className="mb-2 text-3xl font-bold">
          Short .ai Domain Sales
        </h1>
        <p className="mb-8 text-[#888]">
          {shortSales.length} domains with 4 characters or fewer
        </p>

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
              {shortSales.map((s) => (
                <tr key={s.domain} className="border-b border-[#1F1F1F] hover:bg-[#1A1A1A]">
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
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateSchema()) }}
      />
    </div>
  );
}
