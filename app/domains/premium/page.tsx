import type { Metadata } from "next";
import { seedSales, domainToSlug } from "@/lib/seed-sales";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Premium .ai Domains ($100K+) — NameBuzz",
  description: "Browse high-value .ai domain sales valued at $100,000 or more. See what AI domains command premium prices.",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["WebPage", "FAQPage"],
  name: "Premium .ai Domain Sales ($100K+) — NameBuzz",
  description: "Browse high-value .ai domain sales valued at $100,000 or more.",
  url: "https://namebuzz.co/domains/premium",
  mainEntity: [
    {
      "@type": "Question",
      name: "What makes an .ai domain worth $100,000 or more?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Domains valued at $100,000+ are typically short (1-4 characters), exact-match keywords for high-commercial-intent AI terms, or brandable names that could serve as company names for AI startups. The intersection of brevity, brandability, and AI relevance drives these premiums.",
      },
    },
    {
      "@type": "Question",
      name: "What are the most expensive .ai domains ever sold?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Agent.ai sold for $1.2M in 2024. Other record sales include Chat.ai ($329K), Bio.ai, Law.ai, and numerous 2-letter .ai domains in the $200K-$500K range. The NameBuzz tracker documents 500+ verified sales spanning the full price range.",
      },
    },
    {
      "@type": "Question",
      name: "How can I buy a premium .ai domain?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Premium .ai domains are typically sold through Afternic, Sedo, or DAN.com listing networks, making them available across multiple registrars simultaneously. For domains priced above $50,000, engaging a domain broker is recommended for negotiation and escrow services.",
      },
    },
    {
      "@type": "Question",
      name: "Do premium .ai domain prices continue to rise?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Premium .ai domain prices have shown strong appreciation since 2022, correlating with the AI industry boom. However, like any investment, returns are not guaranteed. Short, brandable, keyword-rich domains have the strongest fundamental support for continued appreciation.",
      },
    },
    {
      "@type": "Question",
      name: "Can I finance a premium .ai domain purchase?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Some domain marketplaces and brokers offer financing options for high-value domain purchases. payment plans are typically available for domains over $25,000 through services like DAN.com or through domain-backed lenders. Negotiate financing terms directly with the seller or broker.",
      },
    },
  ],
};

export default function PremiumDomainsPage() {
  const sales = seedSales
    .filter(s => s.price >= 100_000)
    .sort((a, b) => b.price - a.price);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="mb-2 text-3xl font-bold">Premium .ai Domains</h1>
        <p className="mb-8 text-[#888]">Sales priced at $100,000 or more</p>
        <div className="space-y-3">
          {sales.map(sale => (
            <div key={sale.domain} className="flex items-center justify-between rounded-lg border border-[#1F1F1F] bg-[#111] p-4">
              <div>
                <Link href={`/sales/${domainToSlug(sale.domain)}`} className="font-mono text-lg font-semibold text-[#00D4FF] hover:underline">{sale.domain}</Link>
                <p className="text-xs text-[#555]">{sale.date} · {sale.venue}</p>
              </div>
              <span className="text-xl font-bold text-[#00FF88]">{sale.priceFormatted}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
