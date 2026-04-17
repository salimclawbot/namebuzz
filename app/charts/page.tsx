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

export function generateSchema() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: ".ai Domain Sales Charts & Analytics — NameBuzz",
      description: "Visualise .ai domain sales trends over time. See average prices, sales volume, top marketplaces, and price distribution across all verified AI domain sales.",
      url: "https://namebuzz.co/charts",
      isPartOf: {
        "@type": "WebSite",
        name: "NameBuzz",
        url: "https://namebuzz.co",
      },
    },
  ];
}

export default function ChartsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0]">
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateSchema()) }}
      />
    </div>
  );
}
