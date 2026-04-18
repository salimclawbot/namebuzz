import Navbar from "./components/Navbar";
import EmailCapture from "./components/EmailCapture";
import SalesTableClient from "./components/SalesTableClient";
import InlineEmailForm from "./components/InlineEmailForm";

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

// Real stats from seedSales — computed statically so no RSC payload bloat
const PLACEHOLDER_STATS = {
  total: "500+",
  highest: "$1,200,000",
  avg: "$50,000",
  volume: "$25M+",
  highestDomain: "Bot.ai",
};

export default function Home() {
  return (
    <div className="min-h-screen pb-16">
      <Navbar />

      {/* Sticky newsletter bar */}
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
          Comprehensive historical data &bull; 500+ sales tracked &bull; $25M+ total volume
        </p>
      </header>

      <div className="mx-auto max-w-6xl px-4">
        {/* Stats Bar - shows loading until client hydrates */}
        <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
          <StatCard label="Total Sales Tracked" value={PLACEHOLDER_STATS.total} />
          <StatCard
            label="Highest Sale"
            value={PLACEHOLDER_STATS.highest}
            sub={PLACEHOLDER_STATS.highestDomain}
            accent
          />
          <StatCard label="Avg Sale Price" value={PLACEHOLDER_STATS.avg} />
          <StatCard label="Total Volume" value={PLACEHOLDER_STATS.volume} />
        </div>

        {/* Sales table - loads data client-side from /api/sales */}
        <SalesTableClient />
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
          <a href="/domains/premium" className="text-[#00D4FF] hover:underline">Premium</a>
          <a href="/blog" className="text-[#00D4FF] hover:underline">Blog</a>
          <a href="/expired" className="text-[#00D4FF] hover:underline">Expired</a>
        </div>
      </footer>
    </div>
  );
}
