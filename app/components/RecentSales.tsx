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

  useEffect(() => {
    fetch("/api/sales")
      .then((r) => r.json())
      .then((data: Sale[]) => {
        setSales(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const topSales = getTopSalesForRange(sales, days);

  if (loading) {
    return (
      <div className="mt-6 rounded-xl border border-[#1F1F1F] bg-[#111111] p-4">
        <div className="h-4 w-32 animate-pulse rounded bg-[#1F1F1F]" />
      </div>
    );
  }

  const hottest = topSales[0];

  return (
    <div className="mt-6 sm:mt-8">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#555]">
          🔥 Hottest Sales
        </p>
        <div className="flex gap-1 sm:gap-2">
          {buttons.map((b) => (
            <button
              key={b.value}
              onClick={() => setDays(b.value)}
              className={`rounded-full px-2 sm:px-3 py-1 text-xs font-medium transition-colors ${
                days === b.value
                  ? "bg-[#00FF88] text-black"
                  : "bg-[#111111] text-[#888888] border border-[#1F1F1F]"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {hottest ? (
        <div className="mt-3 rounded-xl border border-[#00FF88]/30 bg-[#111111] p-4">
          <p className="text-xs text-[#555]">Top sale this period</p>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="font-mono text-xl font-bold text-[#00FF88]">
              {hottest.domain}
            </span>
            <span className="text-xl font-bold text-[#00FF88]">
              {hottest.priceFormatted}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span
              className="inline-block rounded-full px-2 py-0.5 text-xs"
              style={{
                backgroundColor: `${getBadgeColor(hottest.venue)}22`,
                color: getBadgeColor(hottest.venue),
                border: `1px solid ${getBadgeColor(hottest.venue)}44`,
              }}
            >
              {hottest.venue}
            </span>
            <span className="text-xs text-[#888]">{hottest.date}</span>
          </div>
        </div>
      ) : (
        <div className="mt-3 rounded-xl border border-[#1F1F1F] bg-[#111111] p-4 text-sm text-[#555]">
          No sales found in this period.
        </div>
      )}

      {topSales.length > 1 && (
        <div className="mt-3 overflow-x-auto rounded-xl border border-[#1F1F1F]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1F1F1F] text-[#555] uppercase">
                <th className="px-3 py-2 font-medium">#</th>
                <th className="px-3 py-2 font-medium">Domain</th>
                <th className="px-3 py-2 text-right font-medium">Price</th>
                <th className="px-3 py-2 font-medium">Venue</th>
              </tr>
            </thead>
            <tbody>
              {topSales.slice(1).map((s, i) => (
                <tr
                  key={s.domain + s.date + i}
                  className="border-b border-[#1F1F1F] last:border-0 hover:bg-[#1A1A1A]"
                >
                  <td className="px-3 py-2 text-[#444]">{i + 2}</td>
                  <td className="px-3 py-2 font-mono text-[#F0F0F0]">{s.domain}</td>
                  <td className="px-3 py-2 text-right font-bold text-[#00FF88]">
                    {s.priceFormatted}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className="inline-block rounded-full px-2 py-0.5"
                      style={{
                        backgroundColor: `${getBadgeColor(s.venue)}22`,
                        color: getBadgeColor(s.venue),
                        border: `1px solid ${getBadgeColor(s.venue)}44`,
                      }}
                    >
                      {s.venue}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
