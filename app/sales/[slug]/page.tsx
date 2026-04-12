import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { seedSales, domainToSlug } from "@/lib/seed-sales";

// ── Helper: Price tier framing ──────────────────────────────────────────────
function getPriceTier(price: number): {
  label: string;
  description: string;
  headline: string;
} {
  if (price >= 300_000) {
    return {
      label: "Premium AI Domain",
      headline: "A premium AI domain that signals serious intent.",
      description:
        "At this price point, the domain carries significant brand equity. Premium .ai domains in this range reflect the growing importance of AI across every industry — companies are willing to pay a substantial premium to own their corner of the .ai namespace. These sales set benchmarks for what short, memorable AI-focused domains are worth in today's market.",
    };
  }
  if (price >= 100_000) {
    return {
      label: "Strong Mid-Tier AI Domain",
      headline: "A strong .ai domain with real market value.",
      description:
        "Domains in this range represent solid AI brands with meaningful market positioning. The $100K–$300K tier reflects domains that convey authority and innovation — ideal for startups, AI-focused companies, or established businesses launching an AI product line. These names are short, brandable, and carry clear utility signals.",
    };
  }
  if (price >= 50_000) {
    return {
      label: "Solid AI Domain Investment",
      headline: "A solid .ai domain at a reasonable valuation.",
      description:
        "The $50K–$100K range is where serious AI ventures and well-funded startups compete. These domains strike a balance between affordability and brand power — they are short enough to be memorable and specific enough to signal a clear AI focus. This tier consistently attracts buyers who understand the long-term value of a clean digital identity.",
    };
  }
  return {
    label: "Accessible AI Domain",
    headline: "An accessible entry point into the .ai namespace.",
    description:
      "The sub-$50K .ai market remains highly active, particularly among early-stage AI startups, indie developers, and solo founders building AI-powered products. These domains offer an affordable way to establish a credible AI presence. They are also popular among investors who see potential for appreciation as the AI revolution continues.",
  };
}

// ── Helper: Get 3 closest comparable sales ───────────────────────────────────
function getComparables(sale: (typeof seedSales)[0], count = 3) {
  return seedSales
    .filter((s) => s.domain !== sale.domain)
    .map((s) => ({
      ...s,
      diff: Math.abs(s.price - sale.price),
    }))
    .sort((a, b) => a.diff - b.diff)
    .slice(0, count);
}

// ── Dynamic metadata ─────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sale = seedSales.find((s) => domainToSlug(s.domain) === slug);
  if (!sale) return {};
  const tier = getPriceTier(sale.price);
  return {
    title: `${sale.domain}.ai Sold for ${sale.priceFormatted} — NameBuzz`,
    description: `${sale.domain}.ai sold for ${sale.priceFormatted} on ${sale.date} via ${sale.venue}. ${tier.headline} See comparable .ai domain sales and estimate your domain's value on NameBuzz.`,
    alternates: {
      canonical: `https://namebuzz.co/sales/${slug}`,
    },
    openGraph: {
      title: `${sale.domain}.ai Sold for ${sale.priceFormatted} — NameBuzz`,
      description: `${sale.domain}.ai sold for ${sale.priceFormatted} on ${sale.date}. ${tier.headline}`,
      url: `https://namebuzz.co/sales/${slug}`,
      type: "website",
    },
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function SalePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sale = seedSales.find((s) => domainToSlug(s.domain) === slug);
  if (!sale) notFound();

  const tier = getPriceTier(sale.price);
  const comparables = getComparables(sale, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemPage",
    name: `${sale.domain}.ai Sold for ${sale.priceFormatted}`,
    description: tier.description,
    mainEntity: {
      "@type": "Product",
      name: sale.domain + ".ai",
      description: `.ai domain name sold for ${sale.priceFormatted}`,
      offers: {
        "@type": "Offer",
        price: sale.price.toString(),
        priceCurrency: "USD",
        availability: "https://schema.org/SoldOut",
      },
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
          <Link href="/sales" className="hover:text-[#00FF88]">
            Sales
          </Link>
          <span className="mx-2">{">"}</span>
          <span className="text-[#F0F0F0]">{sale.domain}</span>
        </nav>

        {/* Hero */}
        <div className="mb-10 rounded-xl border border-[#1F1F1F] bg-[#111] p-8 text-center">
          <div className="mb-2">
            <span className="rounded-full border border-[#00FF88]/30 bg-[#00FF88]/10 px-3 py-1 text-xs text-[#00FF88]">
              {tier.label}
            </span>
          </div>
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            {sale.domain}
          </h1>
          <p className="mb-2 text-5xl font-bold text-[#00FF88]">
            {sale.priceFormatted}
          </p>
          <p className="mb-6 text-sm text-[#666]">Sold on {sale.date}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="rounded-full bg-[#1F1F1F] px-3 py-1 text-sm text-[#D0D0D0]">
              {sale.venue}
            </span>
            <span className="rounded-full bg-[#1F1F1F] px-3 py-1 text-sm text-[#D0D0D0]">
              {sale.source}
            </span>
          </div>
          {sale.sourceUrl && (
            <a
              href={sale.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block text-sm text-[#00D4FF] hover:underline"
            >
              View source thread on NamePros →
            </a>
          )}
        </div>

        {/* What this sale means */}
        <div className="mb-10 rounded-xl border border-[#1F1F1F] bg-[#111] p-8">
          <h2 className="mb-4 text-xl font-bold text-[#F0F0F0]">
            What this sale means
          </h2>
          <p className="mb-4 text-lg text-[#D0D0D0] leading-relaxed">
            {tier.headline}
          </p>
          <p className="text-sm text-[#888] leading-relaxed">
            {tier.description}
          </p>
          <p className="mt-4 text-sm text-[#888] leading-relaxed">
            This sale took place on <strong className="text-[#D0D0D0]">{sale.date}</strong> via{" "}
            <strong className="text-[#D0D0D0]">{sale.venue}</strong>. The{" "}
            <strong className="text-[#D0D0D0]">{sale.domain}</strong> domain is valued at{" "}
            <strong className="text-[#00FF88]">{sale.priceFormatted}</strong>, placing it in
            the{" "}
            <strong className="text-[#D0D0D0]">{tier.label.toLowerCase()}</strong>{" "}
            category within our database of .ai domain sales.
          </p>
        </div>

        {/* Comparable Sales */}
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

        {/* Internal links to related .ai sales */}
        <div className="mb-10 rounded-xl border border-[#1F1F1F] bg-[#111] p-6">
          <h3 className="mb-3 text-lg font-bold">Explore More .ai Sales</h3>
          <p className="mb-4 text-sm text-[#888]">
            Browse the full NameBuzz database of .ai domain sales across all price ranges.
          </p>
          <div className="flex flex-wrap gap-2">
            {seedSales
              .slice(0, 12)
              .filter((s) => s.domain !== sale.domain)
              .map((s) => (
                <Link
                  key={s.domain}
                  href={`/sales/${domainToSlug(s.domain)}`}
                  className="rounded-full border border-[#1F1F1F] bg-[#0A0A0A] px-3 py-1 text-xs text-[#888] hover:border-[#00FF88] hover:text-[#00FF88]"
                >
                  {s.domain}
                </Link>
              ))}
          </div>
        </div>

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
        <Link href="/sales" className="text-sm text-[#00D4FF] hover:underline">
          ← View all .ai sales
        </Link>
      </div>
    </div>
  );
}
