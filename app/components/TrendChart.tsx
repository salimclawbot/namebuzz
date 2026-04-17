"use client";

import { useState, useMemo } from "react";
import { seedSales } from "@/lib/seed-sales";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// ── Constants ─────────────────────────────────────────────────────

const YEARS = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

const PRICE_RANGES = [
  { label: "Under $1K",    min: 0,           max: 1_000 },
  { label: "$1K–$10K",     min: 1_000,        max: 10_000 },
  { label: "$10K–$50K",    min: 10_000,       max: 50_000 },
  { label: "$50K–$100K",   min: 50_000,       max: 100_000 },
  { label: "$100K–$500K",  min: 100_000,      max: 500_000 },
  { label: "$500K+",       min: 500_000,      max: Infinity },
];

const DONUT_COLORS = ["#00D4FF", "#AA44FF", "#FF44AA", "#FFB800", "#00FF88", "#FF6644"];

// ── Formatters ────────────────────────────────────────────────────

const fmtPrice = (v: number) =>
  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M`
  : v >= 1_000   ? `$${(v / 1_000).toFixed(0)}K`
  : `$${v}`;

const fmtCount = (v: number) =>
  v >= 1_000 ? `${(v / 1_000).toFixed(1)}K` : String(v);

// ── Linear regression ────────────────────────────────────────────

function linearRegression(points: { x: number; y: number }[]): { slope: number; intercept: number } {
  const n = points.length;
  if (n === 0) return { slope: 0, intercept: 0 };
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

// ── Chart card wrapper ────────────────────────────────────────────

function ChartCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-4">
      <h2 className="text-lg font-semibold text-[#F0F0F0]">{title}</h2>
      <p className="mb-4 text-xs text-[#555]">{description}</p>
      {children}
    </div>
  );
}

// ── Chart 1: Monthly Avg Price + Trendline ───────────────────────

function AvgPriceTrendlineChart({ data }: { data: { month: string; avg: number }[] }) {
  // Build points for regression from the last 36 months
  const points = data.map((d, i) => ({ x: i, y: d.avg }));
  const { slope, intercept } = linearRegression(points);

  const trendData = data.map((d, i) => ({ month: d.month, trend: Math.round(slope * i + intercept) }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid stroke="#1F1F1F" strokeDasharray="3 3" />
        <XAxis dataKey="month" tick={{ fill: "#555", fontSize: 11 }} interval={2} />
        <YAxis tickFormatter={fmtPrice} tick={{ fill: "#555", fontSize: 11 }} width={60} />
        <Tooltip
          contentStyle={{ background: "#111", border: "1px solid #1F1F1F", borderRadius: 8 }}
          labelStyle={{ color: "#888" }}
          formatter={(v: any) => [fmtPrice(Number(v)), "Avg Price"]}
        />
        <Legend wrapperStyle={{ color: "#888", fontSize: 12 }} />
        <Line type="monotone" dataKey="avg" stroke="#00FF88" strokeWidth={2} dot={{ fill: "#00FF88", r: 3 }} name="Avg Price" />
        <Line type="monotone" dataKey="trend" stroke="#FFB800" strokeWidth={2} strokeDasharray="5 3" dot={false} name="Trendline" />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Chart 2: Monthly Sales Volume ────────────────────────────────

function SalesVolumeChart({ data }: { data: { month: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid stroke="#1F1F1F" strokeDasharray="3 3" />
        <XAxis dataKey="month" tick={{ fill: "#555", fontSize: 11 }} interval={2} />
        <YAxis tickFormatter={fmtCount} tick={{ fill: "#555", fontSize: 11 }} width={40} />
        <Tooltip
          contentStyle={{ background: "#111", border: "1px solid #1F1F1F", borderRadius: 8 }}
          labelStyle={{ color: "#888" }}
          formatter={(v: any) => [v, "Sales Count"]}
        />
        <Bar dataKey="count" fill="#00D4FF" radius={[3, 3, 0, 0]} name="Sales Count" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Chart 3: Price Distribution by Year ─────────────────────────

function YearlyAvgChart({ data }: { data: { year: string; avg: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid stroke="#1F1F1F" strokeDasharray="3 3" />
        <XAxis dataKey="year" tick={{ fill: "#555", fontSize: 12 }} />
        <YAxis tickFormatter={fmtPrice} tick={{ fill: "#555", fontSize: 11 }} width={60} />
        <Tooltip
          contentStyle={{ background: "#111", border: "1px solid #1F1F1F", borderRadius: 8 }}
          labelStyle={{ color: "#888" }}
          formatter={(v: any) => [fmtPrice(Number(v)), "Avg Price"]}
        />
        <Bar dataKey="avg" fill="#AA44FF" radius={[3, 3, 0, 0]} name="Avg Price" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Chart 4: Marketplace Volume ────────────────────────────────────

function VenueChart({ data }: { data: { name: string; total: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 70, bottom: 5 }}>
        <CartesianGrid stroke="#1F1F1F" strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tickFormatter={fmtPrice} tick={{ fill: "#555", fontSize: 11 }} />
        <YAxis type="category" dataKey="name" tick={{ fill: "#888", fontSize: 11 }} width={65} />
        <Tooltip
          contentStyle={{ background: "#111", border: "1px solid #1F1F1F", borderRadius: 8 }}
          formatter={(v: any) => [fmtPrice(Number(v)), "Total Volume"]}
        />
        <Bar dataKey="total" fill="#FF44AA" radius={[0, 3, 3, 0]} name="Total Volume" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Chart 5: Price Range Breakdown ───────────────────────────────

function PriceRangeChart({ data }: { data: { label: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="label"
          cx="50%"
          cy="50%"
          outerRadius={110}
          label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
          labelLine={{ stroke: "#555" }}
        >
          {data.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
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

// ── Main component ────────────────────────────────────────────────

export default function TrendChart() {
  const [startYear, setStartYear] = useState(2020);

  // Filtered sales based on selected start year
  const filteredSales = useMemo(
    () => seedSales.filter((s) => parseInt(s.date.slice(0, 4)) >= startYear),
    [startYear]
  );

  // Summary stats
  const stats = useMemo(() => {
    const total = filteredSales.length;
    const volume = filteredSales.reduce((sum, s) => sum + s.price, 0);
    const avg = total > 0 ? Math.round(volume / total) : 0;
    return { total, volume, avg };
  }, [filteredSales]);

  // Chart 1 & 2: monthly aggregates (last 36 months from filtered data)
  const monthlyData = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    for (const s of filteredSales) {
      const m = s.date.match(/^(\d{4}-\d{2})/);
      if (!m) continue;
      if (!map[m[1]]) map[m[1]] = { count: 0, total: 0 };
      map[m[1]].count++;
      map[m[1]].total += s.price;
    }
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-36)
      .map(([month, { count, total }]) => ({
        month: month.slice(2).replace("-", "/"),
        avg: Math.round(total / count),
        count,
        total,
      }));
  }, [filteredSales]);

  // Chart 3: yearly avg price
  const yearlyData = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    for (const s of filteredSales) {
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
        avg: Math.round(total / count),
      }));
  }, [filteredSales]);

  // Chart 4: venue volume
  const venueData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of filteredSales) {
      const v = (s.venue || "Unknown").split("/")[0].trim() || "Unknown";
      map[v] = (map[v] ?? 0) + s.price;
    }
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, total]) => ({ name, total }));
  }, [filteredSales]);

  // Chart 5: price ranges
  const priceRangeData = useMemo(() =>
    PRICE_RANGES.map(({ label, min, max }) => ({
      label,
      count: filteredSales.filter((s) => s.price >= min && s.price < max).length,
    })),
    [filteredSales]
  );

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#F0F0F0]">Market Charts</h2>
        <span className="text-xs text-[#555]">{seedSales.length.toLocaleString()} total verified sales</span>
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-0 z-10 mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] px-4 py-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-[#888]" htmlFor="year-select">
            From year:
          </label>
          <select
            id="year-select"
            value={startYear}
            onChange={(e) => setStartYear(Number(e.target.value))}
            className="rounded border border-[#1F1F1F] bg-[#111] px-2 py-1 text-sm text-[#F0F0F0] focus:border-[#00FF88] focus:outline-none"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="h-4 w-px bg-[#1F1F1F]" />

        <div className="flex flex-wrap gap-4 text-xs text-[#888]">
          <span>
            <span className="text-[#555]">Showing </span>
            <span className="font-semibold text-[#F0F0F0]">{stats.total.toLocaleString()}</span>
            <span className="text-[#555]"> sales</span>
          </span>
          <span>
            <span className="text-[#555]">Volume </span>
            <span className="font-semibold text-[#F0F0F0]">{fmtPrice(stats.volume)}</span>
          </span>
          <span>
            <span className="text-[#555]">Avg </span>
            <span className="font-semibold text-[#F0F0F0]">{fmtPrice(stats.avg)}</span>
          </span>
        </div>
      </div>

      {/* Chart 1 */}
      <div className="mb-5">
        <ChartCard
          title="Monthly Average Price + Trendline"
          description="Monthly average sale price with a linear regression trendline overlaid (last 36 months from selected year)"
        >
          <AvgPriceTrendlineChart data={monthlyData} />
        </ChartCard>
      </div>

      {/* Chart 2 */}
      <div className="mb-5">
        <ChartCard
          title="Monthly Sales Volume"
          description="Number of reported .ai domain sales per month"
        >
          <SalesVolumeChart data={monthlyData} />
        </ChartCard>
      </div>

      {/* Chart 3 */}
      <div className="mb-5">
        <ChartCard
          title="Price Distribution by Year"
          description="Average sale price per year — watch the AI boom play out"
        >
          <YearlyAvgChart data={yearlyData} />
        </ChartCard>
      </div>

      {/* Chart 4 */}
      <div className="mb-5">
        <ChartCard
          title="Marketplace Volume"
          description="Total sales volume by marketplace (top 8 venues)"
        >
          <VenueChart data={venueData} />
        </ChartCard>
      </div>

      {/* Chart 5 */}
      <div className="mb-5">
        <ChartCard
          title="Price Range Breakdown"
          description="Count of sales across each price bracket"
        >
          <PriceRangeChart data={priceRangeData} />
        </ChartCard>
      </div>
    </div>
  );
}
