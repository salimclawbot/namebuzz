import type { Metadata } from "next";
import { seedSales, domainToSlug } from "@/lib/seed-sales";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Short .ai Domains (1-3 Characters) — NameBuzz",
  description: "Browse short .ai domain sales with 1-3 character domains. Premium short AI domains like Chat.ai, Bio.ai and more.",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["WebPage", "FAQPage"],
  name: "Short .ai Domain Sales — NameBuzz",
  description: "Browse short .ai domain sales with 1-3 character domains.",
  url: "https://namebuzz.co/domains/short",
  mainEntity: [
    {
      "@type": "Question",
      name: "Why are short .ai domains so expensive?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Short .ai domains are premium because they are brandable, easy to remember, easy to type, and convey authority. A single or two-character .ai domain is a rare asset — there are only a limited number available, driving prices into the hundreds of thousands or millions of dollars.",
      },
    },
    {
      "@type": "Question",
      name: "What is the most expensive short .ai domain ever sold?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Agent.ai sold for $1.2 million in 2024, making it one of the most expensive .ai domain sales on record. Other notable short .ai sales include Chat.ai at $329,000 and Bio.ai at significant premiums, reflecting the high value of single-word AI domain names.",
      },
    },
    {
      "@type": "Question",
      name: "Can I still find short .ai domains available?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most premium short .ai domains have already been registered. However, some may become available through expiration or can be acquired through brokers. Checking domain aftermarket platforms like Afternic and Sedo regularly is recommended.",
      },
    },
    {
      "@type": "Question",
      name: "How much do 2-letter .ai domains cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "2-letter .ai domains are extremely rare with only around 3,000 possible combinations. Prices typically start at $50,000 and can reach $500,000+ depending on the letters. Dictionary words, brandable names, and acronyms in 2-letter combinations command the highest premiums.",
      },
    },
    {
      "@type": "Question",
      name: "Are 3-letter .ai domains a good investment?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "3-letter .ai domains (around 26,000 combinations) are more affordable than 1-2 letter domains but still hold strong investment potential. Acronyms, common words, and AI-relevant terms in 3-letter .ai format are the most valuable. Prices range from $5,000 to $150,000.",
      },
    },
  ],
};

export default function ShortDomainsPage() {
  const sales = seedSales.filter(s => {
    const name = s.domain.replace(/\.ai$/i, "");
    return name.length >= 1 && name.length <= 3;
  }).sort((a, b) => b.price - a.price);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="mb-2 text-3xl font-bold">Short .ai Domains</h1>
        <p className="mb-8 text-[#888]">1-3 character .ai domains — the most premium tier</p>
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
