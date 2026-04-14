"use client";

import { seedSales } from "@/lib/seed-sales";

function getDateNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export default function MarketStats() {
  const now30 = getDateNDaysAgo(30);
  const now60 = getDateNDaysAgo(60);
  const now7 = getDateNDaysAgo(7);

  // Last 30 days vs 31-60 days ago
  const last30 = seedSales.filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s.date) && s.date >= now30);
  const prev30 = seedSales.filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s.date) && s.date >= now60 && s.date < now30);
  const last7 = seedSales.filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s.date) && s.date >= now7);

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
  const highest = [...seedSales].sort((a, b) => b.price - a.price)[0];

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
      label: "30-Day Volume",
      value: volume30 > 0 ? fmt(volume30) : "—",
      sub: { text: `${last30.length} reported sales`, up: true },
      accent: "#00D4FF",
    },
    {
      label: "Top Venue (30d)",
      value: topVenue,
      sub: { text: "Most active marketplace", up: true },
      accent: "#00D4FF",
    },
    {
      label: "Hottest This Week",
      value: hottest7 ? hottest7.domain : "No data yet",
      sub: hottest7 ? { text: hottest7.priceFormatted, up: true } : { text: "Check back soon", up: true },
      accent: "#FFB800",
    },
    {
      label: "Record Sale",
      value: highest ? fmt(highest.price) : "—",
      sub: { text: highest?.domain ?? "", up: true },
      accent: "#FF44AA",
    },
    {
      label: "Sales Tracked",
      value: seedSales.length.toLocaleString(),
      sub: { text: "Verified & sourced", up: true },
      accent: "#00FF88",
    },
  ];

  return (
    <div className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#F0F0F0]">📊 Market Stats</h2>
        <span className="text-xs text-[#555]">Based on verified DN Journal data</span>
      </div>
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
        {cards.map((card) => (
          <div
            key={card.label}
            className="min-w-[160px] rounded-xl border border-[#1F1F1F] bg-[#111111] p-4 flex-shrink-0"
            style={{ borderTop: `2px solid ${card.accent}33` }}
          >
            <p className="text-xs text-[#555] uppercase tracking-wide">{card.label}</p>
            <p className="mt-1.5 text-xl font-bold" style={{ color: card.accent }}>{card.value}</p>
            {card.sub && (
              <p className={`mt-1 text-xs ${card.sub.up ? "text-[#888]" : "text-red-400"}`}>
                {card.sub.text}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
