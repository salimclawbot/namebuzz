"use client";

import { useState } from "react";
import Link from "next/link";
import { seedSales, type Sale } from "@/lib/seed-sales";
import Navbar from "../components/Navbar";
import EmailCapture from "../components/EmailCapture";

const HIGH_VALUE_WORDS = [
  "pay","law","cloud","data","chat","voice","play","flow","trade","money","cash","fund","bank",
  "ai","go","get","run","buy","sell","build","make","find","read","send","move","work","grow",
  "fast","smart","auto","real","safe","help","care","hire","lead","next","open","code","app",
  "web","api","bot","tool","kit","hub","lab","pro","plus","max","one","now","top","fit","key",
  "base","core","net","link","tech","media","news","health","legal","finance","market","social",
  "learn","study","staff","team","sales","cost","risk","tax","loan","invest","credit","asset",
  "claim","grant","pitch","brand","coach","recruit","remote","audit","track","search","check",
  "scan","rate","score","rank","index","list","map","match","chart","dash","view","show","share",
  "post","feed","sync","book","call","note","task","plan","meet","sign","doc","file","quote",
  "case","deal","apply","onboard",
];

interface ValuationResult {
  low: number;
  high: number;
  confidence: "High" | "Medium" | "Low";
  factors: string[];
  comparables: Sale[];
}

function estimateValue(domain: string): ValuationResult {
  const cleaned = domain.replace(/\.ai$/i, "").toLowerCase().trim();
  const length = cleaned.length;

  const lengthScore =
    length <= 2 ? 95 :
    length === 3 ? 85 :
    length <= 5 ? 70 :
    length <= 7 ? 50 :
    length <= 10 ? 30 : 15;

  const isHighValue = HIGH_VALUE_WORDS.includes(cleaned);
  const hasHyphen = cleaned.includes("-");
  const isNumeric = /^\d+$/.test(cleaned);

  // Find comparables
  const comparables = seedSales
    .filter((s) => {
      const sName = s.domain.replace(/\.ai$/i, "").toLowerCase();
      const lenDiff = Math.abs(sName.length - length);
      if (lenDiff <= 2) return true;
      if (isHighValue && HIGH_VALUE_WORDS.includes(sName)) return true;
      return false;
    })
    .sort((a, b) => b.price - a.price)
    .slice(0, 8);

  // Calculate estimate
  let base: number;
  if (comparables.length > 0) {
    const prices = comparables.map((c) => c.price).sort((a, b) => a - b);
    const mid = Math.floor(prices.length / 2);
    base = prices.length % 2 === 0 ? (prices[mid - 1] + prices[mid]) / 2 : prices[mid];
  } else {
    base = 5000;
  }

  let adjusted = base * (lengthScore / 50);
  if (isHighValue) adjusted *= 1.2;
  if (hasHyphen) adjusted *= 0.5;
  if (isNumeric) adjusted *= 0.7;

  // Market bias correction: our dataset only contains reported/notable sales
  // which represent the top ~10% of actual market transactions.
  // Apply a realistic market discount to reflect true median buyer prices.
  adjusted *= 0.15;

  // Floor at $500, realistic minimums
  adjusted = Math.max(adjusted, 500);

  const low = Math.round(adjusted * 0.4);
  const high = Math.round(adjusted * 2.2);

  const confidence: "High" | "Medium" | "Low" =
    comparables.length >= 5 ? "High" : comparables.length >= 2 ? "Medium" : "Low";

  const factors: string[] = [];
  if (length <= 3) factors.push(`Short domain (${length} chars) — premium pricing tier`);
  else if (length <= 5) factors.push(`Short-medium domain (${length} chars) — strong pricing tier`);
  else factors.push(`Domain length: ${length} chars`);

  if (isHighValue) factors.push("High-value keyword match");
  if (!hasHyphen) factors.push("No hyphens — clean brandable name");
  if (hasHyphen) factors.push("Contains hyphen — reduces brandability");
  if (isNumeric) factors.push("Numeric domain — niche market");
  factors.push(`${comparables.length} comparable sales found`);

  factors.push("Note: reported sales skew high — real market median is significantly lower");
  return { low, high, confidence, factors, comparables };
}

const fmtPrice = (v: number) =>
  v >= 1_000_000
    ? `$${(v / 1_000_000).toFixed(1)}M`
    : `$${v.toLocaleString()}`;

const confidenceColor = { High: "#00FF88", Medium: "#FFB800", Low: "#FF4444" };

export default function ValuePage() {
  const [inputDomain, setInputDomain] = useState("");
  const [result, setResult] = useState<ValuationResult | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputDomain.trim()) return;
    const domain = inputDomain.trim().toLowerCase();
    setResult(estimateValue(domain));
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "NameBuzz .ai Domain Valuation Tool",
          "url": "https://namebuzz.co/value",
          "description": "Get an instant estimate for your .ai domain based on 500+ verified sales.",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Any",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          }
        }) }}
      />
      <Navbar />
      <EmailCapture subject="NameBuzz Subscriber — /value" variant="sticky" />
      <div className="mx-auto max-w-4xl px-4 py-16">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#F0F0F0]">
            What Is Your .ai Domain Worth?
          </h1>
          <p className="mt-3 text-[#888]">
            Instant estimate based on 500+ verified sales. Used by domain investors and AI founders.
          </p>
          <div className="mt-5 flex flex-col items-center gap-2 text-sm text-[#AAAAAA]">
            <span>✓ Based on real verified sales</span>
            <span>✓ 500+ transactions tracked</span>
            <span>✓ Free, no signup required</span>
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <input
            type="text"
            value={inputDomain}
            onChange={(e) => setInputDomain(e.target.value)}
            placeholder="Enter your .ai domain (e.g. robot.ai)"
            className="w-full max-w-md rounded-xl border border-[#1F1F1F] bg-[#111111] px-5 py-3 text-lg text-[#F0F0F0] placeholder-[#555] outline-none focus:border-[#00FF88]/50 transition-colors"
          />
          <button
            type="submit"
            className="rounded-xl bg-[#00FF88] px-6 py-3 text-lg font-bold text-black hover:bg-[#00DD77] transition-colors whitespace-nowrap"
          >
            Estimate Value →
          </button>
        </form>

        {/* Results */}
        {result && (
          <div className="mt-10 space-y-6">
            {/* Price Range */}
            <div className="rounded-xl border border-[#1F1F1F] bg-[#111111] p-6 text-center">
              <p className="text-sm text-[#555]">Estimated Value Range</p>
              <p className="mt-2 text-3xl font-bold text-[#00FF88]">
                {fmtPrice(result.low)} – {fmtPrice(result.high)}
              </p>
              <span
                className="mt-3 inline-block rounded-full px-3 py-1 text-xs font-bold"
                style={{
                  color: confidenceColor[result.confidence],
                  backgroundColor: `${confidenceColor[result.confidence]}22`,
                  border: `1px solid ${confidenceColor[result.confidence]}44`,
                }}
              >
                {result.confidence} Confidence
              </span>
            </div>

            {/* Factors */}
            <div className="rounded-xl border border-[#1F1F1F] bg-[#111111] p-6">
              <h3 className="text-sm font-bold text-[#888]">Valuation Factors</h3>
              <ul className="mt-3 space-y-2">
                {result.factors.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#AAAAAA]">
                    <span className="text-[#00FF88]">•</span> {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Comparables */}
            {result.comparables.length > 0 && (
              <div className="rounded-xl border border-[#1F1F1F] bg-[#111111] p-6">
                <h3 className="text-sm font-bold text-[#888]">
                  Similar .ai domains that sold:
                </h3>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#1F1F1F] text-[#555] text-xs uppercase">
                        <th className="px-3 py-2 text-left">Domain</th>
                        <th className="px-3 py-2 text-right">Price</th>
                        <th className="px-3 py-2 text-left">Date</th>
                        <th className="px-3 py-2 text-left">Venue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.comparables.map((s, i) => (
                        <tr key={s.domain + i} className="border-b border-[#1F1F1F] last:border-0">
                          <td className="px-3 py-2 font-mono text-[#F0F0F0]">{s.domain}</td>
                          <td className="px-3 py-2 text-right font-bold text-[#00FF88]">{s.priceFormatted}</td>
                          <td className="px-3 py-2 text-[#888]">{s.date}</td>
                          <td className="px-3 py-2 text-[#888]">{s.venue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-center text-xs text-[#444]">
              This is a rough estimate based on historical sales data and heuristic scoring.
              Actual domain values may vary significantly based on market conditions, buyer intent, and other factors.
            </p>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="text-sm text-[#00D4FF] hover:underline"
          >
            ← Back to Sales Tracker
          </Link>
        </div>
      </div>
      <EmailCapture subject="NameBuzz Subscriber — /value" variant="bottom" />
    </div>
  );
}
