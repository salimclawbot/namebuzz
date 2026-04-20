"use client";

import { useState, useEffect } from "react";
import type { Sale } from "@/lib/seed-sales";

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
  spaceship: "#FF44AA",
  "spaceship/sellerhub": "#FF44AA",
  brandforce: "#AA44FF",
  "legalbrandmarketing": "#44AAFF",
  "brands.io": "#FF8844",
};

function getBadgeColor(label: string) {
  return venueBadgeColor[label.toLowerCase()] ?? "#6B6B6B";
}

type RecentRange = 3 | 7 | 14 | 30;

const buttons: { label: string; value: RecentRange }[] = [
  { label: "Last 3 Days", value: 3 },
  { label: "Last 7 Days", value: 7 },
  { label: "Last 14 Days", value: 14 },
  { label: "Last 30 Days", value: 30 },
];

function getTopSalesForRange(sales: Sale[], days: number): Sale[] {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  return sales
    .filter((s) => {
      if (!s.date || s.date.length < 4) return false;
      const dateStr = s.date.length === 4 ? s.date + "-01-01" : s.date;
      return dateStr >= cutoffStr;
    })
    .sort((a, b) => b.price - a.price)
    .slice(0, 10);
}

export default function RecentSales() {
  const [days, setDays] = useState<RecentRange>(30);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    fetch("/api/sales")
      .then((r) => r.json())
      .then((data: Sale[]) => {
        setSales(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = getTopSalesForRange(sales, days);

  const copyDomain = (domain: string) => {
    navigator.clipboard.writeText(domain);
    setCopied(domain);
    setTimeout(() => setCopied(""), 1500);
  };

  if (loading) {
    return (
      <div className="mt-8">
        <div className="h-6 w-40 animate-pulse rounded bg-[#1F1F1F]" />
        <div className="mt-4 flex gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 w-[180px] animate-pulse rounded-xl bg-[#1F1F1F]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-base sm:text-xl font-bold text-[#F0F0F0]">
          🔥 Recent Top Sales
        </h2>
        <div className="flex flex-wrap gap-2">
          {buttons.map((b) => (
            <button
              key={b.value}
              type="button"
              onClick={() => setDays(b.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                days === b.value
                  ? "bg-[#00D4FF] text-black"
                  : "bg-[#111111] text-[#888888] hover:text-[#F0F0F0] border border-[#1F1F1F]"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <p className="mt-4 text-sm text-[#555]">No verified sales in this period — try &quot;Last 30 Days&quot; or browse the full table below.</p>
      ) : (
        <div className="no-scrollbar mt-4 flex flex-row gap-3 overflow-x-auto pt-3 pr-3 pb-2">
          {filtered.map((sale, i) => (
            <div
              key={sale.domain + sale.date}
              className="relative w-[180px] min-w-[180px] sm:w-[220px] sm:min-w-[220px] overflow-visible rounded-xl border border-[#1F1F1F] bg-[#111111] p-3 hover:border-[#00FF88]/40 transition-colors"
            >
              {i < 3 && (
                <span className="absolute -top-2 -right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#00FF88] text-[10px] font-bold text-black">
                  {i + 1}
                </span>
              )}
              <button
                type="button"
                onClick={() => copyDomain(sale.domain)}
                className="font-mono text-xs sm:text-sm font-semibold text-[#F0F0F0] hover:text-[#00D4FF] transition-colors cursor-pointer truncate block w-full text-left"
                title="Click to copy"
              >
                {sale.domain}
                {copied === sale.domain && (
                  <span className="ml-1 text-xs text-[#00FF88]">✓</span>
                )}
              </button>
              <p className="mt-0.5 text-sm sm:text-base font-bold text-[#00FF88]">
                {sale.priceFormatted}
              </p>
              <div className="mt-1 flex items-center gap-2">
                {sale.sourceUrl ? (
                  <a
                    href={sale.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium hover:brightness-125 transition-all"
                    style={{
                      backgroundColor: `${getBadgeColor(sale.venue)}22`,
                      color: getBadgeColor(sale.venue),
                      border: `1px solid ${getBadgeColor(sale.venue)}44`,
                    }}
                  >
                    {sale.venue}
                  </a>
                ) : (
                  <span
                    className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: `${getBadgeColor(sale.venue)}22`,
                      color: getBadgeColor(sale.venue),
                      border: `1px solid ${getBadgeColor(sale.venue)}44`,
                    }}
                  >
                    {sale.venue}
                  </span>
                )}
                <span className="text-xs text-[#555]">{sale.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
