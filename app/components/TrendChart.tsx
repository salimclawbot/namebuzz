"use client";

import { useState } from "react";
import { seedSales } from "@/lib/seed-sales";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// ── Data builders ─────────────────────────────────────────────────

function buildMonthlyData() {
  const map: Record<string, { count: number; total: number }> = {};
  for (const s of seedSales) {
    const m = s.date.match(/^(\d{4}-\d{2})/);
    if (!m) continue;
    if (!map[m[1]]) map[m[1]] = { count: 0, total: 0 };
    map[m[1]].count++;
    map[m[1]].total += s.price;
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-24)
    .map(([month, { count, total }]) => ({
      month: month.slice(2).replace("-", "/"),
      avg: Math.round(total / count),
      count,
      total,
    }));
}

function buildVenueData() {
  const map: Record<string, { count: number; total: number }> = {};
  for (const s of seedSales) {
    const v = (s.venue || "Unknown").split("/")[0].trim() || "Unknown";
    if (!map[v]) map[v] = { count: 0, total: 0 };
    map[v].count++;
    map[v].total += s.price;
  }
  return Object.entries(map)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 8)
    .map(([name, { count, total }]) => ({ name, count, total, avg: Math.round(total / count) }));
}

function buildPriceRangeData() {
  const ranges = [
    { label: "$1K–$10K", min: 1000, max: 10000 },
    { label: "$10K–$50K", min: 10000, max: 50000 },
    { label: "$50K–$100K", min: 50000, max: 100000 },
    { label: "$100K–$500K", min: 100000, max: 500000 },
    { label: "$500K+", min: 500000, max: Infinity },
  ];
  return ranges.map(({ label, min, max }) => ({
    label,
    count: seedSales.filter((s) => s.price >= min && s.price < max).length,
  }));
}

function buildYearlyData() {
  const map: Record<string, { count: number; total: number }> = {};
  for (const s of seedSales) {
    const y = s.date.slice(0, 4);
    if (!y || y.length !== 4) continue;
    if (!map[y]) map[y] = { count: 0, total: 0 };
    map[y].count++;
    map[y].total += s.price;
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, { count, total }]) => ({
      year,
      count,
      total,
      avg: Math.round(total / count),
    }));
}

// ── Formatters ────────────────────────────────────────────────────

const fmtPrice = (v: number) =>
  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `$${(v / 1_000).toFixed(0)}K` : `$${v}`;

const COLORS = ["#00FF88", "#00D4FF", "#FF44AA", "#FFB800", "#AA44FF", "#FF6644", "#44AAFF", "#FF44FF"];

// ── Chart components ──────────────────────────────────────────────

function AvgPriceChart({ data }: { data: ReturnType<typeof buildMonthlyData> }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid stroke="#1F1F1F" strokeDasharray="3 3" />
        <XAxis dataKey="month" tick={{ fill: "#555", fontSize: 11 }} interval={2} />
        <YAxis tickFormatter={fmtPrice} tick={{ fill: "#555", fontSize: 11 }} width={55} />
        <Tooltip
          contentStyle={{ background: "#111", border: "1px solid #1F1F1F", borderRadius: 8 }}
          labelStyle={{ color: "#888" }}
          formatter={(v: any) => [fmtPrice(Number(v)), "Avg Price"]}
        />
        <Line type="monotone" dataKey="avg" stroke="#00FF88" strokeWidth={2} dot={{ fill: "#00FF88", r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function SalesVolumeChart({ data }: { data: ReturnType<typeof buildMonthlyData> }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid stroke="#1F1F1F" strokeDasharray="3 3" />
        <XAxis dataKey="month" tick={{ fill: "#555", fontSize: 11 }} interval={2} />
        <YAxis tickFormatter={(v) => String(v)} tick={{ fill: "#555", fontSize: 11 }} width={35} />
        <Tooltip
          contentStyle={{ background: "#111", border: "1px solid #1F1F1F", borderRadius: 8 }}
          labelStyle={{ color: "#888" }}
          formatter={(v: any) => [v, "Sales Count"]}
        />
        <Bar dataKey="count" fill="#00D4FF" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function VenueChart({ data }: { data: ReturnType<typeof buildVenueData> }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 70, bottom: 5 }}>
        <CartesianGrid stroke="#1F1F1F" strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tickFormatter={fmtPrice} tick={{ fill: "#555", fontSize: 11 }} />
        <YAxis type="category" dataKey="name" tick={{ fill: "#888", fontSize: 11 }} width={65} />
        <Tooltip
          contentStyle={{ background: "#111", border: "1px solid #1F1F1F", borderRadius: 8 }}
          formatter={(v: any, name: any) => [name === "total" ? fmtPrice(Number(v)) : v, name === "total" ? "Total Volume" : "Sales"]}
        />
        <Bar dataKey="total" fill="#FF44AA" radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function PriceRangeChart({ data }: { data: ReturnType<typeof buildPriceRangeData> }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} labelLine={{ stroke: "#555" }}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip
          contentStyle={{ background: "#111", border: "1px solid #1F1F1F", borderRadius: 8 }}
          formatter={(v: any) => [v, "Sales"]}
        />
        <Legend wrapperStyle={{ color: "#888", fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function YearlyChart({ data }: { data: ReturnType<typeof buildYearlyData> }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid stroke="#1F1F1F" strokeDasharray="3 3" />
        <XAxis dataKey="year" tick={{ fill: "#555", fontSize: 12 }} />
        <YAxis tickFormatter={fmtPrice} tick={{ fill: "#555", fontSize: 11 }} width={55} />
        <Tooltip
          contentStyle={{ background: "#111", border: "1px solid #1F1F1F", borderRadius: 8 }}
          labelStyle={{ color: "#888" }}
          formatter={(v: any, name: any) => [name === "avg" ? fmtPrice(Number(v)) : v, name === "avg" ? "Avg Price" : "Sales Count"]}
        />
        <Bar dataKey="avg" fill="#AA44FF" radius={[3, 3, 0, 0]} name="avg" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Main component ────────────────────────────────────────────────

const CHARTS = [
  { id: "avgprice", label: "📈 Avg Price/Month", desc: "Average sale price per month (last 24 months)" },
  { id: "volume", label: "📦 Sales Volume", desc: "Number of reported sales per month" },
  { id: "venue", label: "🏦 By Venue", desc: "Total volume sold per marketplace" },
  { id: "range", label: "🎯 Price Ranges", desc: "Distribution of sales by price bracket" },
  { id: "yearly", label: "📅 Year by Year", desc: "Average sale price per year — see the AI boom" },
];

export default function TrendChart() {
  const [active, setActive] = useState("avgprice");

  const monthly = buildMonthlyData();
  const venue = buildVenueData();
  const priceRange = buildPriceRangeData();
  const yearly = buildYearlyData();

  const current = CHARTS.find((c) => c.id === active)!;

  return (
    <div className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#F0F0F0]">Market Charts</h2>
        <span className="text-xs text-[#555]">{seedSales.length} verified sales</span>
      </div>

      {/* Horizontal scrollable tab strip */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {CHARTS.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap ${
              active === c.id
                ? "bg-[#00FF88] text-black"
                : "bg-[#111] border border-[#1F1F1F] text-[#888] hover:text-[#F0F0F0]"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Chart card */}
      <div className="mt-3 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-4">
        <p className="mb-4 text-xs text-[#555]">{current.desc}</p>
        {active === "avgprice" && <AvgPriceChart data={monthly} />}
        {active === "volume" && <SalesVolumeChart data={monthly} />}
        {active === "venue" && <VenueChart data={venue} />}
        {active === "range" && <PriceRangeChart data={priceRange} />}
        {active === "yearly" && <YearlyChart data={yearly} />}
      </div>
    </div>
  );
}
