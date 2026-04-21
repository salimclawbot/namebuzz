"use client";

import { useState, useEffect, useMemo } from "react";
import type { Sale } from "@/lib/seed-sales";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

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

const fmtPrice = (v: number) =>
  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M`
  : v >= 1_000   ? `$${(v / 1_000).toFixed(0)}K`
  : `$${v}`;

function linearRegression(points: { x: number; y: number }[]): { slope: number; intercept: number } {
  const n = points.length;
  if (n === 0) return { slope: 0, intercept: 0 };
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (const p of points) { sumX += p.x; sumY += p.y; sumXY += p.x * p.y; sumXX += p.x * p.x; }
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX) || 0;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

type Tab = "yearly" | "price";

export default function TrendChart() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("yearly");

  useEffect(() => {
    fetch(`/api/sales?v=${Date.now()}`)
      .then((r) => r.json())
      .then((data: Sale[]) => {
        setSales(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const yearlyData = useMemo(() => {
    return YEARS.map((year) => {
      const yearSales = sales.filter((s) => s.date?.startsWith(String(year)));
      return {
        year,
        count: yearSales.length,
        volume: yearSales.reduce((sum, s) => sum + s.price, 0),
        avg: yearSales.length > 0 ? Math.round(yearSales.reduce((sum, s) => sum + s.price, 0) / yearSales.length) : 0,
      };
    });
  }, [sales]);

  const priceData = useMemo(() => {
    return PRICE_RANGES.map((range) => {
      const count = sales.filter((s) => s.price >= range.min && s.price < range.max).length;
      return { name: range.label, count };
    });
  }, [sales]);

  const regData = useMemo(() => {
    const points = yearlyData
      .filter((d) => d.count > 0)
      .map((d) => ({ x: d.year, y: d.volume }));
    const { slope, intercept } = linearRegression(points);
    return yearlyData.map((d) => ({
      year: d.year,
      actual: d.volume,
      trend: Math.round(slope * d.year + intercept),
    }));
  }, [yearlyData]);

  if (loading) {
    return (
      <div className="h-72 animate-pulse rounded-xl border border-[#1F1F1F] bg-[#111111]" />
    );
  }

  return (
    <div className="rounded-xl border border-[#1F1F1F] bg-[#111111] p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-[#F0F0F0]">📊 Market Charts</p>
        <div className="flex gap-1">
          {([["yearly","Yearly"],["price","Price Dist."]] as [Tab, string][]).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                tab === t ? "bg-[#AA44FF] text-white" : "bg-[#1A1A1A] text-[#888]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === "yearly" ? (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={yearlyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" />
            <XAxis dataKey="year" tick={{ fill: "#888", fontSize: 11 }} />
            <YAxis tick={{ fill: "#888", fontSize: 11 }} tickFormatter={(v) => fmtPrice(v)} />
            <Tooltip
              contentStyle={{ background: "#111", border: "1px solid #1F1F1F", borderRadius: 8 }}
              formatter={(v: number) => [fmtPrice(v), ""]}
            />
            <Bar dataKey="volume" fill="#00D4FF" radius={[4, 4, 0, 0]} name="Volume" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={priceData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2} dataKey="count" label={({ name, count }) => `${name}: ${count}`} labelLine={false}>
              {priceData.map((_, i) => (
                <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: "#111", border: "1px solid #1F1F1F", borderRadius: 8 }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
