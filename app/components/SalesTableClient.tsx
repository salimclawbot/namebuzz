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
const PAGE_SIZE = 100;

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
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
        className="inline-block rounded-full px-2 py-0.5 text-xs font-medium hover:brightness-125 transition-all"
        style={style}
      >
        {label}
      </a>
    );
  }
  return (
    <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium" style={style}>
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
    for (const s of sales) { set.add(s.date.slice(0, 4)); }
    return Array.from(set).sort().reverse();
  })();

  const filtered = (() => {
    let result = sales;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.domain.toLowerCase().includes(q) || s.buyer.toLowerCase().includes(q) || s.seller.toLowerCase().includes(q));
    }
    if (yearFilter !== "all") result = result.filter((s) => s.date.startsWith(yearFilter));
    switch (filter) {
      case "10k+": result = result.filter((s) => s.price >= 10000); break;
      case "100k+": result = result.filter((s) => s.price >= 100000); break;
      case "1m+": result = result.filter((s) => s.price >= 1000000); break;
    }
    if (sort === "price") result = [...result].sort((a, b) => b.price - a.price);
    else result = [...result].sort((a, b) => { const d = b.date.localeCompare(a.date); return d !== 0 ? d : b.price - a.price; });
    return result;
  })();

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [filter, sort, search, yearFilter]);

  const visibleFiltered = filtered.slice(0, visibleCount);
  const recentSales = [...sales].filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s.date)).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 100);

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
      <RecentSales />

      {/* Tab Toggle */}
      <div className="mt-4 sm:mt-6 no-scrollbar flex gap-1 sm:gap-2 overflow-x-auto border-b border-[#1F1F1F] pb-0">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3 sm:px-4 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === "all" ? "border-[#00FF88] text-[#00FF88]" : "border-transparent text-[#888] hover:text-[#F0F0F0]"}`}
        >
          All Sales ({sales.length})
        </button>
        <button
          onClick={() => setActiveTab("recent")}
          className={`px-3 sm:px-4 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === "recent" ? "border-[#00D4FF] text-[#00D4FF]" : "border-transparent text-[#888] hover:text-[#F0F0F0]"}`}
        >
          🆕 Recent ({recentSales.length})
        </button>
        <button
          onClick={() => setActiveTab("charts")}
          className={`px-3 sm:px-4 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === "charts" ? "border-[#AA44FF] text-[#AA44FF]" : "border-transparent text-[#888] hover:text-[#F0F0F0]"}`}
        >
          📊 Charts
        </button>
      </div>

      {/* Recent Tab */}
      {activeTab === "recent" && (
        <div className="mt-4">
          <p className="text-xs text-[#444] mb-3">Top 100 most recent verified .ai sales.</p>
          <div className="overflow-x-auto rounded-lg border border-[#1F1F1F]">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#1F1F1F] text-[#555] text-[10px] uppercase tracking-wide">
                  <th className="px-3 py-2 text-left">Domain</th>
                  <th className="px-3 py-2 text-right">Price</th>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left hidden sm:table-cell">Venue</th>
                  <th className="px-3 py-2 text-left hidden md:table-cell">Source</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((s, i) => (
                  <tr key={s.domain + s.date + i} className={`border-b border-[#1A1A1A] last:border-0 hover:bg-[#111] transition-colors ${i % 2 === 0 ? "" : "bg-[#0C0C0C]"}`}>
                    <td className="px-3 py-1.5">
                      <button type="button" onClick={() => copyDomain(s.domain)} className="font-mono text-[#F0F0F0] hover:text-[#00D4FF] transition-colors text-xs">
                        {s.domain}{copied === s.domain && <span className="ml-1 text-[10px] text-[#00FF88]">✓</span>}
                      </button>
                    </td>
                    <td className="px-3 py-1.5 text-right font-bold text-[#00FF88] whitespace-nowrap">{s.priceFormatted}</td>
                    <td className="px-3 py-1.5 text-[#666] whitespace-nowrap">{s.date}</td>
                    <td className="px-3 py-1.5 hidden sm:table-cell">
                      <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ backgroundColor: `${getBadgeColor(s.venue)}22`, color: getBadgeColor(s.venue), border: `1px solid ${getBadgeColor(s.venue)}44` }}>
                        {s.venue || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 hidden md:table-cell">
                      {s.sourceUrl ? (
                        <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#555] hover:text-[#00D4FF] transition-colors underline underline-offset-2">
                          {s.source}
                        </a>
                      ) : (
                        <span className="text-[10px] text-[#555]">{s.source}</span>
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
        <div className="mt-4 space-y-2">
          <MarketStats />
          <TrendChart />
        </div>
      )}

      {/* All Sales Tab */}
      {activeTab === "all" && (
        <>
          {/* Filters */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="flex gap-1.5">
              {filterButtons.map((b) => (
                <button
                  key={b.value}
                  onClick={() => setFilter(b.value)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter === b.value ? "bg-[#00FF88] text-black" : "bg-[#111] text-[#888] border border-[#1F1F1F] hover:text-[#F0F0F0]"}`}
                >
                  {b.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="rounded-lg border border-[#1F1F1F] bg-[#111] px-2 py-1 text-xs text-[#F0F0F0] outline-none">
                <option value="all">All Years</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <select value={sort} onChange={(e) => setSort(e.target.value as SortMode)} className="rounded-lg border border-[#1F1F1F] bg-[#111] px-2 py-1 text-xs text-[#F0F0F0] outline-none">
                <option value="price">Highest $</option>
                <option value="recent">Newest</option>
              </select>
              <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-lg border border-[#1F1F1F] bg-[#111] px-3 py-1 text-xs text-[#F0F0F0] placeholder-[#444] outline-none w-32" />
            </div>
          </div>

          <p className="mt-2 text-[10px] text-[#444]">{visibleFiltered.length} of {filtered.length} sales</p>

          {/* Desktop Table — single compact row per sale */}
          <div className="mt-1 hidden md:block overflow-x-auto rounded-lg border border-[#1F1F1F]">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#1F1F1F] text-[#555] text-[10px] uppercase tracking-wide">
                  <th className="pl-3 pr-2 py-2 text-left">Domain</th>
                  <th className="px-2 py-2 text-right whitespace-nowrap">Price</th>
                  <th className="px-2 py-2 text-left hidden lg:table-cell">Buyer</th>
                  <th className="px-2 py-2 text-left">Venue</th>
                  <th className="px-2 py-2 text-left hidden xl:table-cell">Source</th>
                  <th className="px-2 py-2 text-left">Date</th>
                  <th className="pr-3 pl-2 py-2 text-right">
                    <span className="text-[#333]">Load</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleFiltered.map((sale, i) => (
                  <tr key={sale.domain + sale.date} className="border-b border-[#1A1A1A] last:border-0 hover:bg-[#111] transition-colors">
                    <td className="pl-3 pr-2 py-1.5">
                      <button type="button" onClick={() => copyDomain(sale.domain)} className="font-mono text-[#F0F0F0] hover:text-[#00D4FF] transition-colors text-xs whitespace-nowrap">
                        {sale.domain}{copied === sale.domain && <span className="ml-1 text-[10px] text-[#00FF88]">✓</span>}
                      </button>
                    </td>
                    <td className="px-2 py-1.5 text-right font-bold text-[#00FF88] whitespace-nowrap">{sale.priceFormatted}</td>
                    <td className="px-2 py-1.5 text-[#777] text-[10px] max-w-24 truncate hidden lg:table-cell" title={sale.buyer}>{sale.buyer}</td>
                    <td className="px-2 py-1.5">
                      <Badge label={sale.venue} color={getBadgeColor(sale.venue)} />
                    </td>
                    <td className="px-2 py-1.5 hidden xl:table-cell">
                      {sale.sourceUrl ? (
                        <SourceBadge label={sale.source} color={getBadgeColor(sale.source)} url={sale.sourceUrl} />
                      ) : null}
                    </td>
                    <td className="px-2 py-1.5 text-[#555] whitespace-nowrap">{sale.date}</td>
                    <td className="pr-3 pl-2 py-1.5 text-right">
                      <button onClick={() => setVisibleCount((c) => Math.min(c + 50, filtered.length))} className="text-[10px] text-[#333] hover:text-[#00FF88] transition-colors">
                        +{Math.min(50, filtered.length - visibleCount)}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="py-6 text-center text-xs text-[#555]">No sales match your filters.</p>}
          </div>

          {/* Mobile Cards — compact single-row style */}
          <div className="mt-2 flex flex-col gap-1 md:hidden">
            {visibleFiltered.map((sale, i) => (
              <div key={sale.domain + sale.date} className="flex items-center justify-between gap-2 rounded-lg border border-[#1A1A1A] bg-[#111] px-3 py-2 hover:bg-[#111]/80 transition-colors">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-[10px] text-[#333] whitespace-nowrap">{i + 1}</span>
                  <button type="button" onClick={() => copyDomain(sale.domain)} className="font-mono text-[#F0F0F0] hover:text-[#00D4FF] transition-colors text-xs truncate">
                    {sale.domain}
                  </button>
                  <Badge label={sale.venue} color={getBadgeColor(sale.venue)} />
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span className="font-bold text-[#00FF88] text-xs">{sale.priceFormatted}</span>
                  <span className="text-[10px] text-[#444]">{sale.date}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Load More — desktop only */}
          {visibleCount < filtered.length && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setVisibleCount((c) => Math.min(c + PAGE_SIZE, filtered.length))}
                className="rounded-xl border border-[#222] bg-[#111] px-6 py-2 text-xs text-[#666] hover:border-[#00FF88] hover:text-[#F0F0F0] transition-colors"
              >
                Load {Math.min(PAGE_SIZE, filtered.length - visibleCount)} more ↓
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
