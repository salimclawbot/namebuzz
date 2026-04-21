"use client";

import { useEffect, useState } from "react";
import type { Sale } from "@/lib/seed-sales";

export default function MarketStats() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/sales?v=${Date.now()}`)
      .then((r) => r.json())
      .then((data: Sale[]) => {
        setSales(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl border border-[#1F1F1F] bg-[#111111]" />
        ))}
      </div>
    );
  }

  function getDateNDaysAgo(n: number): string {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  }

  const now30 = getDateNDaysAgo(30);
  const now60 = getDateNDaysAgo(60);
  const now7 = getDateNDaysAgo(7);

  const last30 = sales.filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s.date) && s.date >= now30);
  const prev30 = sales.filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s.date) && s.date >= now60 && s.date < now30);
  const last7 = sales.filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s.date) && s.date >= now7);

  const avg30 = last30.length > 0 ? Math.round(last30.reduce((s, x) => s + x.price, 0) / last30.length) : 0;
  const avgPrev = prev30.length > 0 ? Math.round(prev30.reduce((s, x) => s + x.price, 0) / prev30.length) : 0;
  const change = avgPrev > 0 && avg30 > 0 ? ((avg30 - avgPrev) / avgPrev) * 100 : 0;
  const volume30 = last30.reduce((s, x) => s + x.price, 0);

  const topVenue = (() => {
    if (last30.length === 0) return "—";
    const counts: Record<string, number> = {};
    for (const s of last30) {
      const v = (s.venue || "Unknown").split("/")[0].trim();
      counts[v] = (counts[v] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  })();

  const hottest7 = last7.sort((a, b) => b.price - a.price)[0] ?? null;
  const highest = [...sales].sort((a, b) => b.price - a.price)[0];

  const fmt = (v: number) =>
    v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `$${(v / 1_000).toFixed(0)}K` : `$${v}`;

  const cards = [
    {
      label: "Avg Sale (30 days)",
      value: avg30 > 0 ? fmt(avg30) : "—",
      sub: avgPrev > 0 && avg30 > 0
        ? { text: `${change >= 0 ? "▲" : "▼"} ${Math.abs(change).toFixed(0)}% vs prev 30d`, up: change >= 0 }
        : { text: `Based on ${last30.length} sales`, up: true },
      accent: "#00FF88",
    },
    {
      label: "Hottest (7 days)",
      value: hottest7 ? hottest7.domain : "—",
      sub: hottest7 ? { text: hottest7.priceFormatted, up: true } : undefined,
      accent: false,
    },
    {
      label: "Top Venue (30 days)",
      value: topVenue,
      sub: { text: `${last30.length} sales`, up: true },
      accent: false,
    },
    {
      label: "All-Time Highest",
      value: highest ? highest.domain : "—",
      sub: highest ? { text: highest.priceFormatted, up: true } : undefined,
      accent: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {cards.map((card, i) => (
        <div key={i} className="rounded-xl border border-[#1F1F1F] bg-[#111111] p-4">
          <p className="text-xs text-[#888888]">{card.label}</p>
          <p className={`mt-1 text-base sm:text-xl font-bold ${card.accent ? "text-[#00FF88]" : "text-[#F0F0F0]"}`}>
            {card.value}
          </p>
          {card.sub && (
            <p className="text-xs text-[#00D4FF]">{card.sub.text}</p>
          )}
        </div>
      ))}
    </div>
  );
}
