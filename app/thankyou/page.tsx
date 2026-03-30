"use client";

import { useEffect } from "react";
import Link from "next/link";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const topSales = [
  { domain: "AI.com", price: "$70,000,000", year: "2023" },
  { domain: "X.ai", price: "$5,000,000", year: "2017" },
  { domain: "Data.ai", price: "$1,800,000", year: "2022" },
];

export default function ThankYouPage() {
  useEffect(() => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "conversion", { send_to: "AW-PLACEHOLDER/PLACEHOLDER" });
      // MATTY: Replace both PLACEHOLDER values with your conversion action tag from Google Ads
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0A] px-4 py-16">
      {/* Green Checkmark */}
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="40" r="38" stroke="#00FF88" strokeWidth="3" fill="#00FF8815" />
        <path d="M24 40L35 51L56 29" stroke="#00FF88" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <h1 className="mt-8 text-3xl font-bold text-[#F0F0F0] md:text-4xl">You&apos;re in the loop.</h1>
      <p className="mt-4 max-w-md text-center text-[#888]">
        Your first email is on its way. In the meantime, start exploring.
      </p>

      {/* CTA Buttons */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="rounded-xl bg-[#00FF88] px-6 py-3 text-center font-bold text-black hover:bg-[#00DD77] transition-colors"
        >
          View .ai Sales Tracker →
        </Link>
        <Link
          href="/value"
          className="rounded-xl bg-[#00FF88] px-6 py-3 text-center font-bold text-black hover:bg-[#00DD77] transition-colors"
        >
          Value My Domain →
        </Link>
      </div>

      {/* Top 3 Sales */}
      <div className="mt-16 w-full max-w-3xl">
        <h2 className="mb-4 text-center text-lg font-bold text-[#888]">Top 3 .ai Sales Ever</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {topSales.map((sale) => (
            <div
              key={sale.domain}
              className="rounded-xl border border-[#1F1F1F] bg-[#111] p-6 text-center"
            >
              <p className="text-lg font-mono font-bold text-[#F0F0F0]">{sale.domain}</p>
              <p className="mt-2 text-2xl font-bold text-[#00FF88]">{sale.price}</p>
              <p className="mt-1 text-sm text-[#555]">{sale.year}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
