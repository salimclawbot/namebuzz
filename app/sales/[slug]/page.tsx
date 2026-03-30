import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { seedSales, domainToSlug } from "@/lib/seed-sales";

export function generateStaticParams() {
  return seedSales.map((sale) => ({ slug: domainToSlug(sale.domain) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sale = seedSales.find((s) => domainToSlug(s.domain) === slug);
  if (!sale) return {};
  return {
    title: `${sale.domain} Sold for ${sale.priceFormatted} — .ai Domain Sale | NameBuzz`,
    description: `${sale.domain} was sold for ${sale.priceFormatted} on ${sale.date} via ${sale.venue}. See comparable .ai domain sales and estimate your domain value.`,
    alternates: {
      canonical: `https://namebuzz.co/sales/${slug}`,
    },
    openGraph: {
      title: `${sale.domain} Sold for ${sale.priceFormatted} — .ai Domain Sale | NameBuzz`,
      description: `${sale.domain} was sold for ${sale.priceFormatted} on ${sale.date} via ${sale.venue}. See comparable .ai domain sales and estimate your domain value.`,
      url: `https://namebuzz.co/sales/${slug}`,
    },
  };
}

export default async function SalePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sale = seedSales.find((s) => domainToSlug(s.domain) === slug);
  if (!sale) notFound();

  const domainBase = sale.domain.replace(/\.ai$/i, "");
  const comparables = seedSales
    .filter((s) => {
      if (s.domain === sale.domain) return false;
      const priceDiff = Math.abs(s.price - sale.price) / sale.price;
      const sBase = s.domain.replace(/\.ai$/i, "");
      const lenDiff = Math.abs(sBase.length - domainBase.length);
      return priceDiff < 0.8 && lenDiff <= 3;
    })
    .sort((a, b) => Math.abs(a.price - sale.price) - Math.abs(b.price - sale.price))
    .slice(0, 5);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: sale.domain,
    description: `.ai domain name sold for ${sale.priceFormatted}`,
    offers: {
      "@type": "Offer",
      price: sale.price.toString(),
      priceCurrency: "USD",
      availability: "https://schema.org/SoldOut",
    },
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-[#888]">
          <Link href="/" className="hover:text-[#00FF88]">
            Home
          </Link>
          <span className="mx-2">{">"}</span>
          <Link href="/" className="hover:text-[#00FF88]">
            Sales
          </Link>
          <span className="mx-2">{">"}</span>
          <span className="text-[#F0F0F0]">{sale.domain}</span>
        </nav>

        {/* Hero */}
        <div className="mb-10 rounded-xl border border-[#1F1F1F] bg-[#111] p-8 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">{sale.domain}</h1>
          <p className="mb-6 text-3xl font-bold text-[#00FF88]">
            {sale.priceFormatted}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {sale.date && (
              <span className="rounded-full bg-[#1F1F1F] px-3 py-1 text-sm text-[#D0D0D0]">
                {sale.date}
              </span>
            )}
            <span className="rounded-full bg-[#1F1F1F] px-3 py-1 text-sm text-[#D0D0D0]">
              {sale.venue}
            </span>
          </div>
          {sale.sourceUrl && (
            <a
              href={sale.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm text-[#00D4FF] hover:underline"
            >
              View source: {sale.source}
            </a>
          )}
        </div>

        {/* Comparables */}
        {comparables.length > 0 && (
          <div className="mb-10">
            <h2 className="mb-4 text-xl font-bold">Comparable .ai Sales</h2>
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
                  {comparables.map((c) => (
                    <tr
                      key={c.domain}
                      className="border-b border-[#1F1F1F] hover:bg-[#1A1A1A]"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/sales/${domainToSlug(c.domain)}`}
                          className="text-[#00D4FF] hover:underline"
                        >
                          {c.domain}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-[#00FF88]">
                        {c.priceFormatted}
                      </td>
                      <td className="px-4 py-3 text-[#888]">{c.date}</td>
                      <td className="px-4 py-3 text-[#888]">{c.venue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mb-10 rounded-xl border border-[#00FF88]/20 bg-[#111] p-6 text-center">
          <h3 className="mb-2 text-lg font-bold">
            What is your .ai domain worth?
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

        {/* Back link */}
        <Link
          href="/"
          className="text-sm text-[#00D4FF] hover:underline"
        >
          &larr; View all .ai sales
        </Link>
      </div>
    </div>
  );
}
