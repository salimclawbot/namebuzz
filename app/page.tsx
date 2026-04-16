import { seedSales, type Sale } from "@/lib/seed-sales";
import Navbar from "./components/Navbar";
import EmailCapture from "./components/EmailCapture";
import SalesTableClient from "./components/SalesTableClient";

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#1F1F1F] bg-[#111111] p-4">
      <p className="text-xs text-[#888888]">{label}</p>
      <p className={`mt-1 text-xl font-bold ${accent ? "text-[#00FF88]" : "text-[#F0F0F0]"}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-[#00D4FF]">{sub}</p>}
    </div>
  );
}

export default function Home() {
  const sales = seedSales;

  const stats = (() => {
    if (sales.length === 0) return { total: 0, highest: null as Sale | null, avg: 0, volume: 0 };
    const total = sales.length;
    const highest = sales.reduce((max, s) => (s.price > max.price ? s : max), sales[0]);
    const volume = sales.reduce((sum, s) => sum + s.price, 0);
    const avg = Math.round(volume / total);
    return { total, highest, avg, volume };
  })();

  return (
    <div className="min-h-screen pb-16">
      <Navbar />

      {/* Sticky newsletter bar — visible as users scroll */}
      <div className="border-b border-[#00FF88]/20 bg-[#111]">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-3 sm:flex-row sm:justify-between">
          <p className="text-sm font-semibold text-[#F0F0F0] whitespace-nowrap">
            Get weekly .ai domain sales alerts →
          </p>
          <InlineEmailForm />
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-[#1F1F1F] px-4 py-8 text-center">
        <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl">
          <span className="text-[#00FF88]">.ai</span> Domain Sales Tracker
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#888888]">
          Comprehensive historical data &bull; {stats.total} sales tracked &bull; ${(stats.volume / 1000000).toFixed(1)}M+ total volume
        </p>
      </header>

      <div className="mx-auto max-w-6xl px-4">
        {/* Stats Bar */}
        <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
          <StatCard label="Total Sales Tracked" value={stats.total.toLocaleString()} />
          <StatCard
            label="Highest Sale"
            value={stats.highest?.priceFormatted ?? "-"}
            sub={stats.highest?.domain}
            accent
          />
          <StatCard label="Avg Sale Price" value={`$${stats.avg.toLocaleString()}`} />
          <StatCard label="Total Volume" value={`$${stats.volume.toLocaleString()}`} />
        </div>

        <SalesTableClient sales={sales} />
      </div>

      <EmailCapture subject="NameBuzz Subscriber — homepage" variant="bottom" />

      {/* Footer */}
      <footer className="border-t border-[#1F1F1F] px-4 py-8 text-center text-sm text-[#888888]">
        <p>
          Data sourced from NameBio, DN Journal, Sedo, Afternic, GoDaddy Auctions, press reports.
        </p>
        <p className="mt-2">
          Know of a sale?{" "}
          <a
            href="mailto:tips@namebuzz.co?subject=.ai Domain Sale Tip"
            className="text-[#00D4FF] hover:underline"
          >
            Submit it.
          </a>
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          <a href="/sales" className="text-[#00D4FF] hover:underline">All Sales</a>
          <a href="/charts" className="text-[#00D4FF] hover:underline">Charts</a>
          <a href="/domains/short" className="text-[#00D4FF] hover:underline">Short Domains</a>
          <a href="/domains/single-word" className="text-[#00D4FF] hover:underline">Single Word</a>
          <a href="/domains/premium" className="text-[#00D4FF] hover:underline">Premium ($100K+)</a>
          <a href="/blog" className="text-[#00D4FF] hover:underline">Blog</a>
        </div>
      </footer>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "NameBuzz",
        "url": "https://namebuzz.co",
        "description": "Track verified .ai domain sales. 500+ real sales with prices, dates, and venues.",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://namebuzz.co/value?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }) }} />
    </div>
  );
}

function InlineEmailForm() {
  "use client";
  return (
    <form
      action="https://formsubmit.co/ajax/dclbloggerx@gmail.com"
      method="POST"
      className="flex w-full gap-2"
    >
      <input type="hidden" name="_subject" value="New NameBuzz Homepage Signup!" />
      <input type="hidden" name="_captcha" value="false" />
      <input type="text" name="_honey" className="hidden" tabIndex={-1} autoComplete="off" />
      <input
        type="email"
        name="email"
        required
        placeholder="your@email.com"
        className="flex-1 rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] px-3 py-1.5 text-xs text-[#F0F0F0] placeholder-[#555] focus:outline-none focus:border-[#00FF88] transition-colors"
      />
      <button
        type="submit"
        className="rounded-lg bg-[#00FF88] px-4 py-1.5 text-xs font-bold text-[#0A0A0A] hover:bg-[#00dd77] transition-colors whitespace-nowrap"
      >
        Subscribe Free
      </button>
    </form>
  );
}
