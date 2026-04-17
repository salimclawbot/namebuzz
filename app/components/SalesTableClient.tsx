"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { domainToSlug, type Sale } from "@/lib/seed-sales";
import RecentSales from "./RecentSales";
import MarketStats from "./MarketStats";
import TrendChart from "./TrendChart";

const venueBadgeColor: Record<string, string> = {
  sedo: "#0057FF",
  godaddy: "#1BDBDB",
  "godaddy auctions": "#1BDBDB",
  afternic: "#FF6B00",
  private: "#6B6B6B",
  reported: "#A855F7",
  "dn journal": "#FFD700",
  openai: "#A855F7",
  "dan.com": "#FF4488",
  flippa: "#22CC88",
  namebio: "#00AAFF",
  "press release": "#FF6B00",
  techcrunch: "#00CC66",
};

function getBadgeColor(label: string) {
  return venueBadgeColor[label.toLowerCase()] ?? "#6B6B6B";
}

type PriceFilter = "all" | "10k+" | "100k+" | "1m+";
type SortMode = "price" | "recent";
const PAGE_SIZE = 50;

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${color}22`, color, border: `1px solid ${color}44` }}
    >
      {label}
    </span>
  );
}

function SourceBadge({ label, color, url }: { label: string; color: string; url: string }) {
  const style = { backgroundColor: `${color}22`, color, border: `1px solid ${color}44` };
  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium hover:brightness-125 transition-all"
        style={style}
      >
        {label}
      </a>
    );
  }
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={style}
    >
      {label}
    </span>
  );
}

export default function SalesTableClient({ sales }: { sales: Sale[] }) {
  const [filter, setFilter] = useState<PriceFilter>("all");
  const [sort, setSort] = useState<SortMode>("price");
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [copied, setCopied] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [activeTab, setActiveTab] = useState<"all" | "recent" | "charts">("all");

  const years = (() => {
    const set = new Set<string>();
    for (const s of sales) {
      set.add(s.date.slice(0, 4));
    }
    return Array.from(set).sort().reverse();
  })();

  const filtered = (() => {
    let result = sales;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.domain.toLowerCase().includes(q) ||
          s.buyer.toLowerCase().includes(q) ||
          s.seller.toLowerCase().includes(q)
      );
    }

    if (yearFilter !== "all") {
      result = result.filter((s) => s.date.startsWith(yearFilter));
    }

    switch (filter) {
      case "10k+":
        result = result.filter((s) => s.price >= 10000);
        break;
      case "100k+":
        result = result.filter((s) => s.price >= 100000);
        break;
      case "1m+":
        result = result.filter((s) => s.price >= 1000000);
        break;
    }

    if (sort === "price") {
      result = [...result].sort((a, b) => b.price - a.price);
    } else {
      result = [...result].sort((a, b) => {
        const d = b.date.localeCompare(a.date);
        return d !== 0 ? d : b.price - a.price;
      });
    }

    return result;
  })();

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filter, sort, search, yearFilter]);

  const visibleFiltered = filtered.slice(0, visibleCount);

  // Top 100 recent sales — filtered by price like the All Sales tab
  const recentSales = [...sales]
    .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s.date))
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter((s) => {
      switch (filter) {
        case "10k+": return s.price >= 10000;
        case "100k+": return s.price >= 100000;
        case "1m+": return s.price >= 1000000;
        default: return true;
      }
    })
    .slice(0, 100);

  const copyDomain = (domain: string) => {
    navigator.clipboard.writeText(domain);
    setCopied(domain);
    setTimeout(() => setCopied(""), 1500);
  };

  const filterButtons: { label: string; value: PriceFilter }[] = [
    { label: "All", value: "all" },
    { label: "$10K+", value: "10k+" },
    { label: "$100K+", value: "100k+" },
    { label: "$1M+", value: "1m+" },
  ];

  return (
    <>
      {/* Recent Top Sales */}
      <RecentSales />

      {/* Tab Toggle */}
      <div className="mt-6 sm:mt-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#555]">Browse Sales</p>
      </div>
      <div className="no-scrollbar flex gap-1 sm:gap-2 overflow-x-auto border-b border-[#1F1F1F] pb-0">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3 sm:px-5 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === "all" ? "border-[#00FF88] text-[#00FF88]" : "border-transparent text-[#888] hover:text-[#F0F0F0]"}`}
        >
          All Sales ({sales.length})
        </button>
        <button
          onClick={() => setActiveTab("recent")}
          className={`px-3 sm:px-5 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === "recent" ? "border-[#00D4FF] text-[#00D4FF]" : "border-transparent text-[#888] hover:text-[#F0F0F0]"}`}
        >
          🆕 Recent Sales ({recentSales.length})
        </button>
        <button
          onClick={() => setActiveTab("charts")}
          className={`px-3 sm:px-5 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === "charts" ? "border-[#AA44FF] text-[#AA44FF]" : "border-transparent text-[#888] hover:text-[#F0F0F0]"}`}
        >
          📊 Charts & Analytics
        </button>
      </div>

      {/* Recent Tab */}
      {activeTab === "recent" && (
        <div className="mt-6">
          <p className="text-xs text-[#555] mb-4">Top 100 most recent verified .ai sales — sorted by sale date descending. All entries sourced from DN Journal public records.</p>
          <div className="overflow-x-auto rounded-xl border border-[#1F1F1F]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1F1F1F] text-[#555] text-xs uppercase">
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Domain</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Venue</th>
                  <th className="px-4 py-3 text-left">Source</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((s, i) => (
                  <tr key={s.domain + s.date + i} className={`border-b border-[#1F1F1F] hover:bg-[#111] transition-colors ${i % 2 === 0 ? "" : "bg-[#0A0A0A]"}`}>
                    <td className="px-4 py-3 text-[#444] text-xs">{i + 1}</td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => copyDomain(s.domain)} className="font-mono text-[#F0F0F0] hover:text-[#00D4FF] transition-colors">
                        {s.domain}{copied === s.domain && <span className="ml-1 text-xs text-[#00FF88]">✓</span>}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-[#00FF88]">{s.priceFormatted}</td>
                    <td className="px-4 py-3 text-[#888] font-mono text-xs">{s.date}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: `${getBadgeColor(s.venue)}22`, color: getBadgeColor(s.venue), border: `1px solid ${getBadgeColor(s.venue)}44` }}>
                        {s.venue || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {s.sourceUrl ? (
                        <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#555] hover:text-[#00D4FF] transition-colors underline underline-offset-2">
                          {s.source}
                        </a>
                      ) : (
                        <span className="text-xs text-[#555]">{s.source}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Charts Tab */}
      {activeTab === "charts" && (
        <div className="mt-6 space-y-2">
          <MarketStats />
          <TrendChart />
        </div>
      )}

      {/* All Sales Tab */}
      {activeTab === "all" && (
        <>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-3">
            <div className="flex flex-wrap gap-2">
              {filterButtons.map((b) => (
                <button
                  key={b.value}
                  onClick={() => setFilter(b.value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    filter === b.value
                      ? "bg-[#00FF88] text-black"
                      : "bg-[#111111] text-[#888888] hover:text-[#F0F0F0] border border-[#1F1F1F]"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="rounded-lg border border-[#1F1F1F] bg-[#111111] px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-[#F0F0F0] outline-none w-full sm:w-auto"
              >
                <option value="all">All Years</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortMode)}
                className="rounded-lg border border-[#1F1F1F] bg-[#111111] px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-[#F0F0F0] outline-none w-full sm:w-auto"
              >
                <option value="price">Highest Price</option>
                <option value="recent">Most Recent</option>
              </select>
              <input
                type="text"
                placeholder="Search domains, buyers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-lg border border-[#1F1F1F] bg-[#111111] px-3 py-1.5 text-sm text-[#F0F0F0] placeholder-[#555] outline-none w-full sm:w-48"
              />
            </div>
          </div>

          {/* Results count */}
          <p className="mt-4 text-xs text-[#555]">
            Showing {visibleFiltered.length} of {filtered.length} sales
          </p>

          {/* Sales Table (desktop) */}
          <div className="mt-2 hidden md:block overflow-x-auto rounded-xl border border-[#1F1F1F] bg-[#111111]">
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
                {visibleFiltered.map((sale, i) => (
                  <tr
                    key={sale.domain + sale.date}
                    className="border-b border-[#1F1F1F] last:border-0 hover:bg-[#1A1A1A] transition-colors"
                  >
                    <td className="px-4 py-3 text-[#555]">{i + 1}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/sales/${domainToSlug(sale.domain)}`}
                        className="font-mono text-base font-semibold text-[#F0F0F0] hover:text-[#00D4FF] transition-colors"
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
                    <td className="px-4 py-3">
                      <Badge label={sale.venue} color={getBadgeColor(sale.venue)} />
                    </td>
                    <td className="px-4 py-3 text-[#888888]">{sale.date}</td>
                    <td className="px-4 py-3">
                      {sale.sourceUrl ? (
                        <SourceBadge label={sale.source} color={getBadgeColor(sale.source)} url={sale.sourceUrl} />
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="py-8 text-center text-[#555]">No sales match your filters.</p>
            )}
          </div>

          {/* Sales Cards (mobile) */}
          <div className="mt-2 flex flex-col gap-3 md:hidden">
            {visibleFiltered.map((sale, i) => (
              <div
                key={sale.domain + sale.date}
                className="rounded-xl border border-[#1F1F1F] bg-[#111111] p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="mr-2 text-xs text-[#555]">#{i + 1}</span>
                    <Link
                      href={`/sales/${domainToSlug(sale.domain)}`}
                      className="font-mono text-lg font-semibold text-[#F0F0F0] hover:text-[#00D4FF]"
                    >
                      {sale.domain}
                    </Link>
                  </div>
                  <span className="text-xl font-bold text-[#00FF88]">
                    {sale.priceFormatted}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <Badge label={sale.venue} color={getBadgeColor(sale.venue)} />
                  {sale.sourceUrl && <SourceBadge label={sale.source} color={getBadgeColor(sale.source)} url={sale.sourceUrl} />}
                  <span className="text-[#555]">{sale.date}</span>
                </div>
                {sale.buyer !== "Undisclosed" && (
                  <p className="mt-1 text-xs text-[#888]">Buyer: {sale.buyer}</p>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="py-8 text-center text-[#555]">No sales match your filters.</p>
            )}
          </div>

          {/* Load More */}
          {visibleCount < filtered.length && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setVisibleCount((c) => Math.min(c + PAGE_SIZE, filtered.length))}
                className="rounded-xl border border-[#333] bg-[#1A1A1A] px-6 py-2.5 text-sm font-medium text-[#888] hover:border-[#00FF88] hover:text-[#F0F0F0] transition-colors"
              >
                Load More ({Math.min(PAGE_SIZE, filtered.length - visibleCount)} more of{" "}
                {filtered.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
