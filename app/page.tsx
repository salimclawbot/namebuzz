import Link from "next/link";
import { seedSales, domainToSlug, type Sale } from "@/lib/seed-sales";
import { expiredDomains } from "@/lib/expired-domains";
import Navbar from "./components/Navbar";
import EmailCapture from "./components/EmailCapture";
import SalesTableClient from "./components/SalesTableClient";

const STATIC_ROWS = 50;

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

  // Pre-sorted by price descending for static rendering
  const topSales = [...sales].sort((a, b) => b.price - a.price).slice(0, STATIC_ROWS);

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      {/* Header */}
      <header className="border-b border-[#1F1F1F] px-4 py-8 text-center">
        <h1 className="text-3xl font-bold md:text-4xl">
          <span className="text-[#00FF88]">.ai</span> Domain Sales Tracker
        </h1>
        <p className="mt-2 text-sm text-[#888888]">
          Comprehensive historical data &bull; {stats.total} sales tracked &bull; ${(stats.volume / 1000000).toFixed(1)}M+ total volume
        </p>
      </header>

      <div className="mx-auto max-w-6xl px-4">
        {/* Stats Bar — server rendered */}
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
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

        {/* Expired Domains Teaser — server rendered */}
        <div className="mt-8 rounded-xl border border-[#1F1F1F] bg-[#111] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#F0F0F0]">Recently Expired <span className="text-[#00FF88]">.ai</span> Domains</h2>
            <Link href="/expired" className="text-xs font-medium text-[#00FF88] hover:underline">
              View all expired domains &rarr;
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {expiredDomains.filter((d) => d.status === "expired").slice(0, 3).map((d) => (
              <div key={d.domain} className="rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] p-3">
                <p className="font-mono text-sm font-bold text-white">{d.domain}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-full bg-[#F9731622] border border-[#F9731644] px-2 py-0.5 text-[10px] font-medium text-[#F97316]">EXPIRED</span>
                  <span className="text-[10px] text-[#555]">{d.expiredDaysAgo}d ago</span>
                  <span className="text-[10px] text-[#555]">{d.characters} chars</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Static SSR table — visible to crawlers, hidden when JS hydrates */}
        <noscript>
          <div className="mt-8">
            <h2 className="text-lg font-bold text-[#F0F0F0] mb-4">Top {STATIC_ROWS} .ai Domain Sales</h2>
            <div className="overflow-x-auto rounded-xl border border-[#1F1F1F] bg-[#111111]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#1F1F1F] text-[#888888]">
                    <th className="px-4 py-3 w-12">#</th>
                    <th className="px-4 py-3">Domain</th>
                    <th className="px-4 py-3">Sale Price</th>
                    <th className="px-4 py-3">Venue</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {topSales.map((sale, i) => (
                    <tr key={sale.domain + sale.date} className="border-b border-[#1F1F1F]">
                      <td className="px-4 py-3 text-[#555]">{i + 1}</td>
                      <td className="px-4 py-3">
                        <Link href={`/sales/${domainToSlug(sale.domain)}`} className="font-mono text-base font-semibold text-[#F0F0F0]">
                          {sale.domain}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-lg font-bold text-[#00FF88]">{sale.priceFormatted}</td>
                      <td className="px-4 py-3 text-[#888888]">{sale.venue}</td>
                      <td className="px-4 py-3 text-[#888888]">{sale.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </noscript>

        {/* SSR seed table — always in HTML for Google, visually replaced by client component */}
        <div className="mt-8" id="ssr-sales-table" suppressHydrationWarning>
          <h2 className="text-lg font-bold text-[#F0F0F0] mb-4">Top .ai Domain Sales by Price</h2>
          <div className="overflow-x-auto rounded-xl border border-[#1F1F1F] bg-[#111111]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#1F1F1F] text-[#888888]">
                  <th className="px-4 py-3 w-12">#</th>
                  <th className="px-4 py-3">Domain</th>
                  <th className="px-4 py-3">Sale Price</th>
                  <th className="px-4 py-3">Buyer</th>
                  <th className="px-4 py-3">Venue</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Source</th>
                </tr>
              </thead>
              <tbody>
                {topSales.map((sale, i) => (
                  <tr
                    key={sale.domain + sale.date}
                    className="border-b border-[#1F1F1F] last:border-0"
                  >
                    <td className="px-4 py-3 text-[#555]">{i + 1}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/sales/${domainToSlug(sale.domain)}`}
                        className="font-mono text-base font-semibold text-[#F0F0F0]"
                      >
                        {sale.domain}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-lg font-bold text-[#00FF88]">
                      {sale.priceFormatted}
                    </td>
                    <td className="px-4 py-3 text-[#AAAAAA] text-xs max-w-32 truncate" title={sale.buyer}>
                      {sale.buyer}
                    </td>
                    <td className="px-4 py-3 text-[#888888]">
                      {sale.venue}
                    </td>
                    <td className="px-4 py-3 text-[#888888]">{sale.date}</td>
                    <td className="px-4 py-3">
                      {sale.sourceUrl ? (
                        <a
                          href={sale.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#555] hover:text-[#00D4FF]"
                        >
                          {sale.source}
                        </a>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Interactive client component — takes over for filtering, search, tabs */}
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
