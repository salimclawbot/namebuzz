"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import EmailCapture from "../components/EmailCapture";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ───────── types ───────── */
interface FearGreedData {
  value: number;
  value_classification: string;
}
interface BtcPrice {
  usd: number;
  usd_24h_change: number;
  usd_7d_change?: number;
  usd_market_cap: number;
}
interface GlobalData {
  market_cap_percentage: Record<string, number>;
  total_market_cap: Record<string, number>;
}
interface CoinMarket {
  id: string;
  symbol: string;
  name: string;
  market_cap: number;
  current_price: number;
}

interface SwingCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number;
  price_change_percentage_14d_in_currency: number;
  price_change_percentage_30d_in_currency: number;
  sparkline_in_7d: { price: number[] };
}

/* ───────── caching helpers ───────── */
const CACHE_TTL = 5 * 60 * 1000;
function getCached<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) {
      sessionStorage.removeItem(key);
      return null;
    }
    return data as T;
  } catch {
    return null;
  }
}
function setCache<T>(key: string, data: T) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch { /* quota exceeded — ignore */ }
}

/* ───────── signal helpers ───────── */
function getSignal(score: number) {
  if (score < 20) return { label: "\ud83d\udd25 VERY STRONG BUY", color: "#00FF88", sub: "Extreme Fear" };
  if (score < 35) return { label: "\u2705 STRONG BUY", color: "#00FF88", sub: "Fear" };
  if (score < 50) return { label: "\u26a1 ACCUMULATE", color: "#EAB308", sub: "Neutral-Fear" };
  if (score < 65) return { label: "\u26a0\ufe0f CAUTION", color: "#F97316", sub: "Neutral-Greed" };
  if (score < 80) return { label: "\ud83d\udd34 STRONG SELL", color: "#EF4444", sub: "Greed" };
  return { label: "\ud83d\udea8 VERY STRONG SELL \u2014 OVERBOUGHT", color: "#EF4444", sub: "Extreme Greed" };
}

function fmt(n: number) {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

function fmtUsd(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

/* ───────── swing trade scoring ───────── */
function calcSwingScore(coin: SwingCoin): number {
  let score = 50;
  const d7 = coin.price_change_percentage_7d_in_currency || 0;
  const d14 = coin.price_change_percentage_14d_in_currency || 0;
  const d30 = coin.price_change_percentage_30d_in_currency || 0;
  const d24 = coin.price_change_percentage_24h || 0;

  if (d30 < -20 && d7 > 0) score += 20;
  if (d30 < -30 && d7 > 5) score += 15;
  if (d7 > d14 && d7 > 5) score += 15;
  if (d30 > 20 && d7 < -5 && d24 > 0) score += 20;
  if (d7 > 30) score -= 25;
  if (d30 > 80) score -= 20;
  if (d7 < -20) score -= 20;
  if (d24 < -10) score -= 15;

  return Math.max(0, Math.min(100, score));
}

type SwingSignalLabel = "\ud83d\udfe2 STRONG BUY" | "\ud83d\udfe9 WATCH / ACCUMULATE" | "\u26aa NEUTRAL" | "\ud83d\udfe1 WAIT / CAUTION" | "\ud83d\udd34 AVOID";

function getSwingSignal(score: number): { label: SwingSignalLabel; color: string } {
  if (score >= 75) return { label: "\ud83d\udfe2 STRONG BUY", color: "#00FF88" };
  if (score >= 60) return { label: "\ud83d\udfe9 WATCH / ACCUMULATE", color: "#4ADE80" };
  if (score >= 45) return { label: "\u26aa NEUTRAL", color: "#888" };
  if (score >= 30) return { label: "\ud83d\udfe1 WAIT / CAUTION", color: "#EAB308" };
  return { label: "\ud83d\udd34 AVOID", color: "#EF4444" };
}

function getSwingReasoning(label: SwingSignalLabel, d30: number): string {
  switch (label) {
    case "\ud83d\udfe2 STRONG BUY":
      return `Down ${Math.abs(d30).toFixed(0)}% in 30d, recovering. Classic swing entry.`;
    case "\ud83d\udfe9 WATCH / ACCUMULATE":
      return "Momentum building. Watch for confirmation.";
    case "\u26aa NEUTRAL":
      return "No clear edge. Sit on hands.";
    case "\ud83d\udfe1 WAIT / CAUTION":
      return "Trend unclear. Higher risk.";
    case "\ud83d\udd34 AVOID":
      return "Selling pressure. Wait for base.";
  }
}

/* ───────── Sparkline SVG ───────── */
function Sparkline({ prices, color }: { prices: number[]; color: string }) {
  if (!prices || prices.length < 2) return null;
  const w = 120;
  const h = 40;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const points = prices.map((p, i) => {
    const x = (i / (prices.length - 1)) * w;
    const y = h - ((p - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        points={points.join(" ")}
      />
    </svg>
  );
}

/* ───────── Fear & Greed Gauge (SVG) ───────── */
function FearGreedGauge({ value }: { value: number }) {
  const cx = 150,
    cy = 140,
    r = 110;
  const startAngle = Math.PI;
  const endAngle = 0;
  const sweepAngle = startAngle - endAngle;
  const needleAngle = startAngle - (value / 100) * sweepAngle;

  // arc path helper
  const arc = (from: number, to: number) => {
    const x1 = cx + r * Math.cos(from);
    const y1 = cy - r * Math.sin(from);
    const x2 = cx + r * Math.cos(to);
    const y2 = cy - r * Math.sin(to);
    const large = from - to > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  const nx = cx + (r - 20) * Math.cos(needleAngle);
  const ny = cy - (r - 20) * Math.sin(needleAngle);

  return (
    <svg viewBox="0 0 300 170" className="w-full max-w-[320px]">
      <defs>
        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="25%" stopColor="#F97316" />
          <stop offset="50%" stopColor="#EAB308" />
          <stop offset="75%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#00FF88" />
        </linearGradient>
      </defs>
      <path d={arc(startAngle, endAngle)} fill="none" stroke="url(#gaugeGrad)" strokeWidth="18" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#F0F0F0" strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="6" fill="#F0F0F0" />
      <text x={cx} y={cy + 30} textAnchor="middle" fill="#F0F0F0" fontSize="36" fontWeight="bold">
        {value}
      </text>
      <text x={20} y={cy + 14} fill="#888" fontSize="11">0</text>
      <text x={270} y={cy + 14} fill="#888" fontSize="11">100</text>
    </svg>
  );
}

/* ───────── pill component ───────── */
function Pill({ text, color }: { text: string; color: string }) {
  return (
    <span
      className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {text}
    </span>
  );
}

/* ───────── change pill ───────── */
function ChangePill({ label, value }: { label: string; value: number }) {
  const c = value >= 0 ? "#00FF88" : "#EF4444";
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${c}15`, color: c }}
    >
      {label} {value >= 0 ? "+" : ""}{value.toFixed(1)}%
    </span>
  );
}

/* ───────── swing filter/sort types ───────── */
type SwingFilter = "all" | "buy" | "avoid";
type SwingSort = "score" | "market_cap" | "7d";

/* ───────── main page ───────── */
export default function CryptoPage() {
  const [fearGreed, setFearGreed] = useState<FearGreedData | null>(null);
  const [btcPrice, setBtcPrice] = useState<BtcPrice | null>(null);
  const [globalData, setGlobalData] = useState<GlobalData | null>(null);
  const [markets, setMarkets] = useState<CoinMarket[]>([]);
  const [swingCoins, setSwingCoins] = useState<SwingCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [swingFilter, setSwingFilter] = useState<SwingFilter>("all");
  const [swingSort, setSwingSort] = useState<SwingSort>("score");

  const fetchAll = useCallback(async (force = false) => {
    setRefreshing(true);
    setError(null);
    try {
      // Fear & Greed
      let fg = !force ? getCached<FearGreedData>("crypto_fg") : null;
      if (!fg) {
        const res = await fetch("https://api.alternative.me/fng/");
        const json = await res.json();
        fg = { value: Number(json.data[0].value), value_classification: json.data[0].value_classification };
        setCache("crypto_fg", fg);
      }
      setFearGreed(fg);

      // BTC price
      let btc = !force ? getCached<BtcPrice>("crypto_btc") : null;
      if (!btc) {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_market_cap=true"
        );
        const json = await res.json();
        btc = {
          usd: json.bitcoin.usd,
          usd_24h_change: json.bitcoin.usd_24h_change,
          usd_market_cap: json.bitcoin.usd_market_cap,
        };
        setCache("crypto_btc", btc);
      }
      setBtcPrice(btc);

      // Global data
      let gd = !force ? getCached<GlobalData>("crypto_global") : null;
      if (!gd) {
        const res = await fetch("https://api.coingecko.com/api/v3/global");
        const json = await res.json();
        gd = {
          market_cap_percentage: json.data.market_cap_percentage,
          total_market_cap: json.data.total_market_cap,
        };
        setCache("crypto_global", gd);
      }
      setGlobalData(gd);

      // Markets (for bar chart)
      let mk = !force ? getCached<CoinMarket[]>("crypto_markets") : null;
      if (!mk) {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&sparkline=false"
        );
        mk = await res.json();
        setCache("crypto_markets", mk!);
      }
      setMarkets(mk!);

      // Swing trade coins (top 20 with sparkline + multi-period changes)
      let sw = !force ? getCached<SwingCoin[]>("crypto_swing") : null;
      if (!sw) {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&sparkline=true&price_change_percentage=1h,24h,7d,14d,30d"
        );
        sw = await res.json();
        setCache("crypto_swing", sw!);
      }
      setSwingCoins(sw!);

      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const compositeScore = fearGreed ? 100 - fearGreed.value : 50;
  const signal = getSignal(compositeScore);

  const GOLD_MCAP = 15.7e12;
  const btcMcap = btcPrice?.usd_market_cap ?? 0;
  const btcSupply = 21_000_000;
  const btcIfGold = GOLD_MCAP / btcSupply;
  const btcGoldRatio = btcMcap / GOLD_MCAP;

  const btcDom = globalData?.market_cap_percentage?.btc ?? 0;
  const ethDom = globalData?.market_cap_percentage?.eth ?? 0;
  const othersDom = Math.max(0, 100 - btcDom - ethDom);
  const domSignal =
    btcDom > 60 ? { label: "BTC Season", color: "#F7931A" } : btcDom < 40 ? { label: "Altseason", color: "#627EEA" } : { label: "Transitioning", color: "#EAB308" };

  const pieData = [
    { name: "BTC", value: +btcDom.toFixed(1) },
    { name: "ETH", value: +ethDom.toFixed(1) },
    { name: "Others", value: +othersDom.toFixed(1) },
  ];
  const PIE_COLORS = ["#F7931A", "#627EEA", "#00FF88"];

  const barData = markets.map((c) => ({
    name: c.symbol.toUpperCase(),
    market_cap: c.market_cap,
    fill: c.id === "bitcoin" ? "#F7931A" : c.id === "ethereum" ? "#627EEA" : "#00FF88",
  }));

  // Entry indicators
  const indicators = [
    {
      name: "Fear & Greed Index",
      value: fearGreed ? `${fearGreed.value} (${fearGreed.value_classification})` : "\u2014",
      signal: compositeScore < 35 ? "BUY" : compositeScore < 65 ? "NEUTRAL" : "SELL",
      color: compositeScore < 35 ? "#00FF88" : compositeScore < 65 ? "#EAB308" : "#EF4444",
    },
    {
      name: "BTC 24h Change",
      value: btcPrice ? `${btcPrice.usd_24h_change.toFixed(2)}%` : "\u2014",
      signal: btcPrice ? (btcPrice.usd_24h_change < -5 ? "STRONG BUY" : btcPrice.usd_24h_change < 0 ? "BUY" : btcPrice.usd_24h_change > 5 ? "SELL" : "NEUTRAL") : "\u2014",
      color: btcPrice ? (btcPrice.usd_24h_change < -5 ? "#00FF88" : btcPrice.usd_24h_change < 0 ? "#00FF88" : btcPrice.usd_24h_change > 5 ? "#EF4444" : "#EAB308") : "#888",
    },
    {
      name: "BTC Dominance",
      value: `${btcDom.toFixed(1)}%`,
      signal: domSignal.label,
      color: domSignal.color,
    },
    {
      name: "BTC vs Gold Ratio",
      value: `${(btcGoldRatio * 100).toFixed(1)}%`,
      signal: btcGoldRatio < 0.1 ? "Massive Upside" : btcGoldRatio < 0.5 ? "Upside" : "Mature",
      color: btcGoldRatio < 0.1 ? "#00FF88" : btcGoldRatio < 0.5 ? "#EAB308" : "#F97316",
    },
    {
      name: "Market Sentiment",
      value: fearGreed?.value_classification ?? "\u2014",
      signal: compositeScore < 25 ? "Extreme Fear = Opportunity" : compositeScore > 75 ? "Extreme Greed = Risk" : "Mixed",
      color: compositeScore < 25 ? "#00FF88" : compositeScore > 75 ? "#EF4444" : "#EAB308",
    },
    {
      name: "Composite Score",
      value: `${compositeScore}/100`,
      signal: signal.label.replace(/^[^\w]*/, ""),
      color: signal.color,
    },
  ];

  /* ─── swing trade processed data ─── */
  const swingScored = swingCoins.map((coin) => {
    const score = calcSwingScore(coin);
    const sig = getSwingSignal(score);
    return { coin, score, ...sig };
  });

  const swingFiltered = swingScored.filter((s) => {
    if (swingFilter === "buy") return s.score >= 60;
    if (swingFilter === "avoid") return s.score < 30;
    return true;
  });

  const swingSorted = [...swingFiltered].sort((a, b) => {
    if (swingSort === "score") return b.score - a.score;
    if (swingSort === "market_cap") return b.coin.market_cap - a.coin.market_cap;
    return (b.coin.price_change_percentage_7d_in_currency || 0) - (a.coin.price_change_percentage_7d_in_currency || 0);
  });

  const buyCount = swingScored.filter((s) => s.score >= 60).length;
  const neutralCount = swingScored.filter((s) => s.score >= 30 && s.score < 60).length;
  const avoidCount = swingScored.filter((s) => s.score < 30).length;

  /* ─── render ─── */
  const card = "rounded-xl border border-[#1F1F1F] bg-[#111] p-6";
  const filterBtn = (active: boolean) =>
    `rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${active ? "bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/40" : "bg-[#1A1A1A] text-[#888] border border-[#1F1F1F] hover:text-[#F0F0F0]"}`;

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-12 text-center">
          <div className="animate-pulse text-[#888] text-lg">Loading market data...</div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#F0F0F0]">Crypto Swing Trading &amp; Signals</h1>
            <p className="mt-1 text-sm text-[#888]">Real-time swing trade radar, market signals &amp; indicators</p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-[#666]">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={() => fetchAll(true)}
              disabled={refreshing}
              className="rounded-lg border border-[#1F1F1F] bg-[#1A1A1A] px-4 py-2 text-sm font-medium text-[#00FF88] transition-colors hover:bg-[#222] disabled:opacity-50"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 p-4 text-sm text-[#EF4444]">
            {error}
          </div>
        )}

        {/* 1 — SIGNAL PANEL */}
        <section className={`${card} mb-6 text-center`}>
          <div className="mb-2 text-sm font-medium uppercase tracking-wider text-[#888]">
            Composite Signal &middot; Score {compositeScore}/100
          </div>
          <div className="text-4xl font-black sm:text-5xl" style={{ color: signal.color }}>
            {signal.label}
          </div>
          <div className="mt-2 text-sm text-[#888]">{signal.sub}</div>
          {btcPrice && (
            <div className="mt-4 text-lg text-[#F0F0F0]">
              BTC {fmtUsd(btcPrice.usd)}{" "}
              <span className={btcPrice.usd_24h_change >= 0 ? "text-[#00FF88]" : "text-[#EF4444]"}>
                {btcPrice.usd_24h_change >= 0 ? "+" : ""}
                {btcPrice.usd_24h_change.toFixed(2)}%
              </span>
            </div>
          )}
        </section>

        {/* ⚡ SWING TRADE RADAR */}
        {swingCoins.length > 0 && (
          <section className={`${card} mb-6`}>
            <div className="mb-1">
              <h2 className="text-2xl font-bold text-[#F0F0F0]">{"\u26a1"} Swing Trade Radar</h2>
              <p className="mt-1 text-sm text-[#888]">Long swing opportunities &mdash; updated live. Based on RSI, trend, and momentum.</p>
            </div>

            {/* summary bar */}
            <div className="my-4 rounded-lg bg-[#0A0A0A] border border-[#1F1F1F] px-4 py-3 text-sm text-[#CCC]">
              <span className="text-[#00FF88] font-semibold">{buyCount}</span> coins showing buy signals
              {" | "}
              <span className="text-[#888] font-semibold">{neutralCount}</span> neutral
              {" | "}
              <span className="text-[#EF4444] font-semibold">{avoidCount}</span> avoid
              {lastUpdated && (
                <span className="text-[#666]"> &mdash; as of {lastUpdated.toLocaleTimeString()}</span>
              )}
            </div>

            {/* filter & sort bar */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <button className={filterBtn(swingFilter === "all")} onClick={() => setSwingFilter("all")}>All</button>
              <button className={filterBtn(swingFilter === "buy")} onClick={() => setSwingFilter("buy")}>{"\ud83d\udfe2"} Buy Signals Only</button>
              <button className={filterBtn(swingFilter === "avoid")} onClick={() => setSwingFilter("avoid")}>{"\ud83d\udd34"} Avoid Only</button>
              <span className="mx-2 text-[#333]">|</span>
              <select
                value={swingSort}
                onChange={(e) => setSwingSort(e.target.value as SwingSort)}
                className="rounded-lg border border-[#1F1F1F] bg-[#1A1A1A] px-3 py-1.5 text-xs text-[#CCC] outline-none"
              >
                <option value="score">Best Signal First</option>
                <option value="market_cap">By Market Cap</option>
                <option value="7d">By 7d Change</option>
              </select>
            </div>

            {/* card grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {swingSorted.map(({ coin, score, label, color }) => {
                const d24 = coin.price_change_percentage_24h || 0;
                const d7 = coin.price_change_percentage_7d_in_currency || 0;
                const d30 = coin.price_change_percentage_30d_in_currency || 0;
                const reasoning = getSwingReasoning(label, d30);
                const sparklineColor = d7 >= 0 ? "#00FF88" : "#EF4444";
                return (
                  <div key={coin.id} className="rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={coin.image} alt={coin.name} width={32} height={32} className="rounded-full" />
                        <div>
                          <div className="font-semibold text-[#F0F0F0]">{coin.name} <span className="text-[#888] text-xs uppercase">{coin.symbol}</span></div>
                          <div className="text-xl font-bold text-[#F0F0F0]">
                            ${coin.current_price < 1 ? coin.current_price.toPrecision(4) : coin.current_price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                      <div
                        className="rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap"
                        style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
                      >
                        {label}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <ChangePill label="24h" value={d24} />
                      <ChangePill label="7d" value={d7} />
                      <ChangePill label="30d" value={d30} />
                    </div>

                    <div className="mt-3 flex items-end justify-between gap-4">
                      <Sparkline prices={coin.sparkline_in_7d?.price ?? []} color={sparklineColor} />
                      <div className="text-right text-xs text-[#666]">
                        Score: <span className="font-bold" style={{ color }}>{score}</span>/100
                      </div>
                    </div>

                    <p className="mt-2 text-xs text-[#888] italic">{reasoning}</p>
                    <p className="mt-1 text-[10px] text-[#555]">Typical hold: 1&ndash;4 weeks</p>
                  </div>
                );
              })}
            </div>

            {/* disclaimer */}
            <p className="mt-4 text-xs" style={{ color: "#555" }}>
              {"\u26a0\ufe0f"} Not financial advice. Swing scores are algorithmic &mdash; do your own research before trading.
            </p>
          </section>
        )}

        {/* 2 — FEAR & GREED GAUGE + 3 — BTC DOMINANCE */}
        <div className="mb-6 grid gap-6 md:grid-cols-2">
          {/* gauge */}
          <section className={card}>
            <h2 className="mb-4 text-lg font-semibold text-[#F0F0F0]">Fear &amp; Greed Index</h2>
            <div className="flex flex-col items-center">
              <FearGreedGauge value={fearGreed?.value ?? 0} />
              <div className="mt-2 text-sm text-[#888]">
                {fearGreed?.value_classification ?? "\u2014"}
              </div>
            </div>
          </section>

          {/* BTC dominance */}
          <section className={card}>
            <h2 className="mb-2 text-lg font-semibold text-[#F0F0F0]">BTC Dominance</h2>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-[#F7931A]">{btcDom.toFixed(1)}%</span>
              <Pill text={domSignal.label} color={domSignal.color} />
            </div>
            <div className="mt-4 flex justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1A1A1A", border: "1px solid #1F1F1F", borderRadius: 8, color: "#F0F0F0" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* 4 — MARKET CAP BAR CHART */}
        <section className={`${card} mb-6`}>
          <h2 className="mb-4 text-lg font-semibold text-[#F0F0F0]">Top 10 by Market Cap</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={barData} layout="vertical" margin={{ left: 50, right: 20, top: 10, bottom: 10 }}>
              <XAxis type="number" tickFormatter={(v: number) => fmt(v)} tick={{ fill: "#888", fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#F0F0F0", fontSize: 12 }} width={50} />
              <Tooltip
                formatter={(v) => fmt(Number(v))}
                contentStyle={{ background: "#1A1A1A", border: "1px solid #1F1F1F", borderRadius: 8, color: "#F0F0F0" }}
              />
              <Bar dataKey="market_cap" radius={[0, 6, 6, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* 5 — BTC VS GOLD */}
        <section className={`${card} mb-6`}>
          <h2 className="mb-4 text-lg font-semibold text-[#F0F0F0]">BTC vs Gold</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] p-5 text-center">
              <div className="text-sm text-[#888]">BTC Market Cap</div>
              <div className="mt-1 text-2xl font-bold text-[#F7931A]">{fmt(btcMcap)}</div>
            </div>
            <div className="rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] p-5 text-center">
              <div className="text-sm text-[#888]">Gold Market Cap</div>
              <div className="mt-1 text-2xl font-bold text-[#EAB308]">{fmt(GOLD_MCAP)}</div>
            </div>
          </div>
          {/* progress bar */}
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-[#888]">
              <span>BTC / Gold Ratio</span>
              <span>{(btcGoldRatio * 100).toFixed(2)}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[#1F1F1F]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#F7931A] to-[#00FF88]"
                style={{ width: `${Math.min(btcGoldRatio * 100, 100)}%` }}
              />
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] p-4 text-center">
            <div className="text-sm text-[#888]">If BTC = Gold market cap</div>
            <div className="mt-1 text-xl font-bold text-[#00FF88]">1 BTC = {fmtUsd(btcIfGold)}</div>
          </div>
          {btcGoldRatio < 0.1 && (
            <div className="mt-3 text-center text-sm font-semibold text-[#00FF88]">
              Massive Upside Potential {"\ud83d\ude80"}
            </div>
          )}
        </section>

        {/* 6 — ENTRY INDICATORS TABLE */}
        <section className={`${card} mb-6`}>
          <h2 className="mb-4 text-lg font-semibold text-[#F0F0F0]">Entry Indicators</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1F1F1F] text-left text-[#888]">
                  <th className="pb-2 pr-4 font-medium">Indicator</th>
                  <th className="pb-2 pr-4 font-medium">Value</th>
                  <th className="pb-2 font-medium">Signal</th>
                </tr>
              </thead>
              <tbody>
                {indicators.map((ind) => (
                  <tr key={ind.name} className="border-b border-[#1F1F1F]/50">
                    <td className="py-3 pr-4 text-[#F0F0F0]">{ind.name}</td>
                    <td className="py-3 pr-4 font-mono text-[#F0F0F0]">{ind.value}</td>
                    <td className="py-3">
                      <Pill text={ind.signal} color={ind.color} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 7 — HOW TO READ */}
        <section className={`${card} mb-12`}>
          <h2 className="mb-3 text-lg font-semibold text-[#F0F0F0]">How to Read This Dashboard</h2>
          <div className="space-y-2 text-sm leading-relaxed text-[#888]">
            <p>
              <strong className="text-[#F0F0F0]">Swing Trade Radar</strong> scores top-20 coins (0-100) using multi-timeframe momentum. Green signals indicate oversold recoveries or dip-buying opportunities in uptrends. Red signals indicate active selling pressure.
            </p>
            <p>
              <strong className="text-[#F0F0F0]">Composite Score</strong> inverts the Fear &amp; Greed Index: when the market is fearful (low F&amp;G), the score is low, signaling a buy opportunity. When greedy (high F&amp;G), the score is high, signaling caution.
            </p>
            <p>
              <strong className="text-[#F0F0F0]">BTC Dominance</strong> above 60% suggests capital is flowing into Bitcoin (BTC Season). Below 40% indicates altcoin rotation (Altseason).
            </p>
            <p>
              <strong className="text-[#F0F0F0]">BTC vs Gold</strong> compares Bitcoin&apos;s market cap to gold&apos;s ~$15.7T. The &quot;If BTC = Gold&quot; price shows theoretical upside if Bitcoin matched gold&apos;s valuation.
            </p>
            <p>
              <strong className="text-[#F0F0F0]">Entry Indicators</strong> combine multiple signals into a quick-reference table. Green = favorable entry, Yellow = neutral, Red = caution.
            </p>
            <p className="text-xs text-[#666]">
              This dashboard is for informational purposes only and does not constitute financial advice. Always do your own research.
            </p>
          </div>
        </section>

        <EmailCapture subject="NameBuzz Subscriber — /crypto" variant="bottom" />
      </main>
    </>
  );
}
