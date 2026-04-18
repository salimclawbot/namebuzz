import type { Metadata } from "next";
import TrendChart from "@/app/components/TrendChart";
import Navbar from "@/app/components/Navbar";
import EmailCapture from "@/app/components/EmailCapture";

export const metadata: Metadata = {
  title: ".ai Domain Sales Charts & Analytics — NameBuzz",
  description:
    "Visualise .ai domain sales trends over time. See average prices, sales volume, top marketplaces, and price distribution across all verified AI domain sales.",
  alternates: {
    canonical: "https://namebuzz.co/charts",
  },
  openGraph: {
    title: ".ai Domain Sales Charts & Analytics — NameBuzz",
    description: "Visualise .ai domain sales trends over time. See average prices, sales volume, top marketplaces, and price distribution across all verified AI domain sales.",
    url: "https://namebuzz.co/charts",
    siteName: "NameBuzz",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: ".ai Domain Sales Charts & Analytics — NameBuzz",
    description: "Visualise .ai domain sales trends over time. See average prices, sales volume, top marketplaces, and price distribution across all verified AI domain sales.",
  },
};

const faqData = [
  {
    "@type": "Question",
    name: "What is the average .ai domain sale price?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "The average .ai domain sale price varies by year and market conditions. Based on NameBuzz tracking data, the average has ranged from $15,000 to $50,000 depending on the year and the mix of premium vs. mid-tier sales tracked.",
    },
  },
  {
    "@type": "Question",
    name: "Which marketplace sells the most .ai domains?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Sedo, Afternic, and GoDaddy Auctions are the top marketplaces for .ai domain sales. Many sales also occur privately or through domain brokers for higher-value domains. DN Journal documents sales from all these sources.",
    },
  },
  {
    "@type": "Question",
    name: "How has the .ai domain market trended since 2020?",
    acceptedAnswer: {
      "@type": "Answer",
      text: ".ai domain prices have generally trended upward since 2020, driven by AI industry growth. Sales volume and average prices both increased significantly from 2022 onwards, with notable record sales like Agent.ai ($1.2M) setting new benchmarks.",
    },
  },
  {
    "@type": "Question",
    name: "What price ranges do most .ai domain sales fall into?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Based on NameBuzz tracking data: approximately 40% of sales are under $5,000, 35% fall between $5,000 and $50,000, 20% range from $50,000 to $500,000, and 5% exceed $500,000. These percentages vary year by year.",
    },
  },
  {
    "@type": "Question",
    name: "Are .ai domains still a good investment in 2025-2026?",
    acceptedAnswer: {
      "@type": "Answer",
      text: ".ai domains remain one of the strongest new TLD investments, supported by sustained AI industry growth. However, investors should focus on short, brandable, keyword-rich domains rather than bulk buying random .ai domains, which rarely recoup their registration costs.",
    },
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["WebPage", "FAQPage"],
  name: ".ai Domain Sales Charts & Analytics — NameBuzz",
  description: "Visualise .ai domain sales trends over time. See average prices, sales volume, top marketplaces, and price distribution across all verified AI domain sales.",
  url: "https://namebuzz.co/charts",
  mainEntity: faqData,
};

export default function ChartsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <header className="border-b border-[#1F1F1F] px-4 py-8 text-center">
        <h1 className="text-3xl font-bold md:text-4xl">
          <span className="text-[#00FF88]">.ai</span> Domain Sales Charts
        </h1>
        <p className="mt-2 text-sm text-[#888888]">
          Visualise trends, volumes, and price distributions across verified sales
        </p>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <TrendChart />
      </div>

      <EmailCapture subject="NameBuzz Subscriber — charts page" variant="bottom" />
    </div>
  );
}
