"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import EmailCapture from "../components/EmailCapture";
import { expiredDomains, type ExpiredDomain } from "@/lib/expired-domains";

type TabKey = "live-available" | "expired" | "pending-delete" | "available";
type LengthFilter = "any" | "lte3" | "4-5" | "6-8" | "9+";
type TypeFilter = "any" | "word" | "acronym" | "brandable";
type SortMode = "newest" | "shortest" | "az";

interface WhoisResult {
  domain: string;
  available: boolean;
  status: string;
  expiry?: string;
  registrar?: string;
}

interface LiveDomain {
  domain: string;
  status: string;
  source: string;
  checkedAt?: string;
}

interface LiveFeedData {
  available: LiveDomain[];
  pendingDelete: LiveDomain[];
  expired: LiveDomain[];
  checkedCount: number;
  lastUpdated: string;
}

const byStatus = (status: ExpiredDomain["status"]) =>
  expiredDomains.filter((d) => d.status === status);

const statusCounts = {
  expired: byStatus("expired").length,
  "pending-delete": byStatus("pending-delete").length,
  available: byStatus("available").length,
};

async function batchFetchWhois(domains: string[]): Promise<WhoisResult[]> {
  const results: WhoisResult[] = [];
  const batchSize = 10;
  for (let i = 0; i < domains.length; i += batchSize) {
    const batch = domains.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((d) =>
        fetch(`/api/whois?domain=${encodeURIComponent(d)}`)
          .then((r) => r.json())
          .catch(() => ({ domain: d, available: false, status: "unknown" }))
      )
    );
    results.push(...batchResults);
  }
  return results;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
}

export default function ExpiredPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("live-available");
  const [lengthFilter, setLengthFilter] = useState<LengthFilter>("any");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("any");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [howOpen, setHowOpen] = useState(false);
  const [whoisData, setWhoisData] = useState<Record<string, WhoisResult>>({});
  const [whoisLoading, setWhoisLoading] = useState<Set<string>>(new Set());

  // Live feed state
  const [liveFeed, setLiveFeed] = useState<LiveFeedData | null>(null);
  const [liveFeedLoading, setLiveFeedLoading] = useState(false);

  const fetchLiveFeed = useCallback(async () => {
    setLiveFeedLoading(true);
    try {
      const res = await fetch("/api/expired-domains");
      if (res.ok) {
        const data = await res.json();
        setLiveFeed(data);
      }
    } catch {
      // silently fail
    } finally {
      setLiveFeedLoading(false);
    }
  }, []);

  // Fetch live feed on mount + every 5 minutes
  useEffect(() => {
    fetchLiveFeed();
    const interval = setInterval(fetchLiveFeed, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchLiveFeed]);

  const loadWhois = useCallback(
    async (tab: TabKey) => {
      if (tab === "live-available") return;
      const domains = byStatus(
        tab === "expired" ? "expired" : tab === "pending-delete" ? "pending-delete" : "available"
      ).map((d) => d.domain);

      const toFetch = domains.filter((d) => !whoisData[d]);
      if (toFetch.length === 0) return;

      setWhoisLoading((prev) => new Set([...prev, ...toFetch]));
      const results = await batchFetchWhois(toFetch);
      const map: Record<string, WhoisResult> = {};
      for (const r of results) map[r.domain] = r;
      setWhoisData((prev) => ({ ...prev, ...map }));
      setWhoisLoading((prev) => {
        const next = new Set(prev);
        for (const d of toFetch) next.delete(d);
        return next;
      });
    },
    [whoisData]
  );

  useEffect(() => {
    loadWhois(activeTab);
  }, [activeTab, loadWhois]);

  const tabDomains = activeTab !== "live-available"
    ? byStatus(
        activeTab === "expired"
          ? "expired"
          : activeTab === "pending-delete"
          ? "pending-delete"
          : "available"
      )
    : [];

  const filtered = tabDomains
    .filter((d) => {
      if (lengthFilter === "lte3" && d.characters > 3) return false;
      if (lengthFilter === "4-5" && (d.characters < 4 || d.characters > 5)) return false;
      if (lengthFilter === "6-8" && (d.characters < 6 || d.characters > 8)) return false;
      if (lengthFilter === "9+" && d.characters < 9) return false;
      if (typeFilter !== "any" && d.type !== typeFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortMode === "newest") return a.expiredDaysAgo - b.expiredDaysAgo;
      if (sortMode === "shortest") return a.characters - b.characters;
      return a.domain.localeCompare(b.domain);
    });

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "live-available", label: "\uD83D\uDFE2 Available RIGHT NOW", count: liveFeed?.available.length ?? 0 },
    { key: "expired", label: "Recently Expired", count: statusCounts.expired },
    { key: "pending-delete", label: "Pending Delete", count: statusCounts["pending-delete"] },
    { key: "available", label: "Available Now", count: statusCounts.available },
  ];

  const lengthButtons: { label: string; value: LengthFilter }[] = [
    { label: "Any", value: "any" },
    { label: "\u22643", value: "lte3" },
    { label: "4\u20135", value: "4-5" },
    { label: "6\u20138", value: "6-8" },
    { label: "9+", value: "9+" },
  ];

  const typeButtons: { label: string; value: TypeFilter }[] = [
    { label: "Any", value: "any" },
    { label: "Word", value: "word" },
    { label: "Acronym", value: "acronym" },
    { label: "Brandable", value: "brandable" },
  ];

  return (
    <div className="min-h-screen pb-16">
      <Navbar />

      {/* Live Ticker Bar */}
      <div className="border-b border-[#00FF8833] bg-[#0A1A0F] px-4 py-3">
        <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 text-sm font-bold text-[#00FF88]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00FF88] opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#00FF88]" />
              </span>
              LIVE FEED
            </span>
            <span className="text-xs text-[#888]">&mdash; Checking .ai registry in real time</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#888]">
              {liveFeed ? `${liveFeed.checkedCount} domains checked` : "Loading..."}
              {liveFeed && ` | ${liveFeed.available.length} available now`}
              {liveFeed && ` | Last updated: ${timeAgo(liveFeed.lastUpdated)}`}
            </span>
            <button
              onClick={fetchLiveFeed}
              disabled={liveFeedLoading}
              className="rounded-lg border border-[#00FF8844] px-3 py-1 text-xs font-medium text-[#00FF88] hover:bg-[#00FF8811] transition-colors disabled:opacity-50"
            >
              {liveFeedLoading ? "Checking..." : "\u21BB Refresh Now"}
            </button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <header className="border-b border-[#1F1F1F] px-4 py-10 text-center">
        <h1 className="text-3xl font-bold md:text-4xl">
          Expired &amp; Dropping <span className="text-[#00FF88]">.ai</span> Domains
        </h1>
        <p className="mt-2 text-sm text-[#888]">
          Recently deleted .ai domains available for registration. Updated daily.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <span className="rounded-full bg-[#00FF8822] border border-[#00FF8844] px-3 py-1 text-xs font-medium text-[#00FF88]">
            {expiredDomains.length} domains tracked
          </span>
          <span className="rounded-full bg-[#00D4FF22] border border-[#00D4FF44] px-3 py-1 text-xs font-medium text-[#00D4FF]">
            {statusCounts.available} available now
          </span>
          <span className="rounded-full bg-[#00FF8822] border border-[#00FF8844] px-3 py-1 text-xs font-medium text-[#00FF88]">
            &#x1F7E2; Live WHOIS verified
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4">
        {/* Explainer (collapsible) */}
        <div className="mt-8">
          <button
            onClick={() => setHowOpen(!howOpen)}
            className="flex items-center gap-2 rounded-lg border border-[#1F1F1F] bg-[#111] px-4 py-2.5 text-sm font-medium text-[#888] hover:text-[#F0F0F0] transition-colors w-full"
          >
            <span className={`transition-transform ${howOpen ? "rotate-90" : ""}`}>&#9654;</span>
            How this works
          </button>
          {howOpen && (
            <div className="mt-3 rounded-xl border border-[#1F1F1F] bg-[#111] p-5">
              <p className="text-sm text-[#888] mb-4">
                When a .ai domain expires, it goes through several stages before becoming available:
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-0 overflow-x-auto">
                {[
                  { label: "Expired", color: "#888", bg: "#88888822" },
                  { label: "Grace Period 0\u201330d", color: "#EAB308", bg: "#EAB30822" },
                  { label: "Redemption 30d", color: "#F97316", bg: "#F9731622" },
                  { label: "Pending Delete 5d", color: "#EF4444", bg: "#EF444422" },
                  { label: "Available \u2705", color: "#00FF88", bg: "#00FF8822" },
                ].map((stage, i) => (
                  <div key={stage.label} className="flex items-center">
                    <div
                      className="rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap border"
                      style={{ backgroundColor: stage.bg, color: stage.color, borderColor: `${stage.color}44` }}
                    >
                      {stage.label}
                    </div>
                    {i < 4 && (
                      <span className="text-[#555] px-1 hidden sm:inline">&rarr;</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mt-8 flex gap-2 border-b border-[#1F1F1F] pb-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-[#00FF88] text-[#00FF88]"
                  : "border-transparent text-[#888] hover:text-[#F0F0F0]"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Live Available Tab */}
        {activeTab === "live-available" && (
          <div className="mt-6">
            {liveFeedLoading && !liveFeed && (
              <div className="py-16 text-center">
                <div className="inline-flex items-center gap-3">
                  <svg className="h-5 w-5 animate-spin text-[#00FF88]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-sm text-[#888]">Checking .ai registry via RDAP...</span>
                </div>
              </div>
            )}

            {liveFeed && liveFeed.available.length === 0 && (
              <div className="py-16 text-center">
                <div className="inline-flex flex-col items-center gap-3">
                  <svg className="h-6 w-6 animate-spin text-[#00FF88]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-sm text-[#888]">No available domains in this check batch.</p>
                  <p className="text-xs text-[#555]">Checking again in 5 minutes...</p>
                </div>
              </div>
            )}

            {liveFeed && liveFeed.available.length > 0 && (
              <div className="grid gap-3 md:grid-cols-2">
                {liveFeed.available.map((d) => (
                  <LiveAvailableCard key={d.domain} domain={d} />
                ))}
              </div>
            )}

            {/* Also show pending-delete from live feed */}
            {liveFeed && liveFeed.pendingDelete.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-bold text-[#EF4444] mb-3">&#9889; Pending Delete (dropping soon)</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {liveFeed.pendingDelete.map((d) => (
                    <div key={d.domain} className="rounded-xl border border-[#EF444466] bg-[#111] p-4">
                      <p className="font-mono text-lg font-bold text-white">{d.domain}</p>
                      <span className="inline-flex items-center gap-1.5 mt-1 rounded-full bg-[#EF444422] border border-[#EF444444] px-2 py-0.5 text-xs font-medium text-[#EF4444]">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#EF4444] opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#EF4444]" />
                        </span>
                        PENDING DELETE
                      </span>
                      <p className="mt-2 text-xs text-[#888]">Verified live via RDAP &mdash; dropping soon</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expired from scrape */}
            {liveFeed && liveFeed.expired.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-bold text-[#F97316] mb-3">Recently Expired (from expireddomains.net)</h3>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {liveFeed.expired.map((d) => (
                    <div key={d.domain} className="rounded-xl border border-[#1F1F1F] bg-[#111] p-4">
                      <p className="font-mono text-sm font-bold text-white">{d.domain}</p>
                      <span className="mt-1 inline-block rounded-full bg-[#F9731622] border border-[#F9731644] px-2 py-0.5 text-[10px] font-medium text-[#F97316]">
                        EXPIRED
                      </span>
                      <div className="mt-2">
                        <a
                          href={`https://www.godaddy.com/domainsearch/find?domainToCheck=${d.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#00D4FF] hover:underline"
                        >
                          Check availability &rarr;
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filters (for non-live tabs) */}
        {activeTab !== "live-available" && (
          <>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-[#555] mr-1">Length:</span>
                {lengthButtons.map((b) => (
                  <button
                    key={b.value}
                    onClick={() => setLengthFilter(b.value)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      lengthFilter === b.value
                        ? "bg-[#00FF88] text-black"
                        : "bg-[#111] text-[#888] hover:text-[#F0F0F0] border border-[#1F1F1F]"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-[#555] mr-1">Type:</span>
                {typeButtons.map((b) => (
                  <button
                    key={b.value}
                    onClick={() => setTypeFilter(b.value)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      typeFilter === b.value
                        ? "bg-[#00FF88] text-black"
                        : "bg-[#111] text-[#888] hover:text-[#F0F0F0] border border-[#1F1F1F]"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="ml-auto rounded-lg border border-[#1F1F1F] bg-[#111] px-3 py-1.5 text-sm text-[#F0F0F0] outline-none"
              >
                <option value="newest">Newest</option>
                <option value="shortest">Shortest</option>
                <option value="az">A&ndash;Z</option>
              </select>
            </div>

            <p className="mt-3 text-xs text-[#555]">
              Showing {filtered.length} domain{filtered.length !== 1 ? "s" : ""}
            </p>

            {/* Domain Cards Grid */}
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {filtered.map((d) => (
                <DomainCard
                  key={d.domain}
                  domain={d}
                  whois={whoisData[d.domain]}
                  loading={whoisLoading.has(d.domain)}
                />
              ))}
              {filtered.length === 0 && (
                <p className="col-span-2 py-8 text-center text-[#555]">No domains match your filters.</p>
              )}
            </div>
          </>
        )}

        {/* How to Catch */}
        <section className="mt-16">
          <h2 className="text-xl font-bold text-[#F0F0F0] text-center mb-6">How to Catch Expired .ai Domains</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-[#1F1F1F] bg-[#111] p-5">
              <p className="text-sm font-bold text-[#00FF88] mb-2">1. Check Registration</p>
              <p className="text-sm text-[#888]">Try to register directly &mdash; some expired domains become available immediately.</p>
            </div>
            <div className="rounded-xl border border-[#1F1F1F] bg-[#111] p-5">
              <p className="text-sm font-bold text-[#00FF88] mb-2">2. Place a Backorder</p>
              <p className="text-sm text-[#888]">Use NameJet, SnapNames, or Dynadot to queue a backorder before it drops.</p>
            </div>
            <div className="rounded-xl border border-[#1F1F1F] bg-[#111] p-5">
              <p className="text-sm font-bold text-[#00FF88] mb-2">3. Watch GoDaddy Auctions</p>
              <p className="text-sm text-[#888]">Premium expired .ai domains often surface in GoDaddy expired auctions.</p>
            </div>
          </div>
        </section>

        {/* Watch Multiple Domains */}
        <WatchMultipleSection />

        {/* Pro tip */}
        <p className="mt-8 rounded-xl border border-[#1F1F1F] bg-[#111] p-4 text-sm text-[#888] text-center">
          &#x1F4A1; <strong className="text-[#F0F0F0]">Pro tip:</strong> Domain drop alerts are checked hourly. Dropped .ai domains can be registered within minutes of dropping &mdash; act fast when you get the alert.
        </p>
      </div>

      {/* Email Capture */}
      <EmailCapture subject="NameBuzz Subscriber — /expired" variant="bottom" />

      {/* Footer */}
      <footer className="border-t border-[#1F1F1F] px-4 py-8 text-center text-sm text-[#888]">
        <p>Data sourced from WHOIS records, zone files, and public registrar data.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          <Link href="/" className="text-[#00D4FF] hover:underline">Sales Tracker</Link>
          <Link href="/value" className="text-[#00D4FF] hover:underline">Value My Domain</Link>
          <Link href="/domains/short" className="text-[#00D4FF] hover:underline">Short Domains</Link>
          <Link href="/blog" className="text-[#00D4FF] hover:underline">Blog</Link>
        </div>
      </footer>
    </div>
  );
}

function LiveAvailableCard({ domain: d }: { domain: LiveDomain }) {
  // Check if similar domain exists in our expired data for value reference
  const baseName = d.domain.replace(".ai", "");
  const similarSale = expiredDomains.find(
    (ed) => ed.domain.replace(".ai", "") === baseName
  );

  return (
    <div className="rounded-xl border border-[#00FF8866] bg-[#0A1A0F] p-5 hover:border-[#00FF88] transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-xl font-bold text-white">{d.domain}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00FF8833] border border-[#00FF8866] px-3 py-1 text-xs font-bold text-[#00FF88]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00FF88] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00FF88]" />
              </span>
              AVAILABLE NOW
            </span>
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs text-[#00FF88]">&#x2705; Unregistered &mdash; verified live via RDAP</p>
      {d.checkedAt && (
        <p className="mt-1 text-xs text-[#555]">Checked: {timeAgo(d.checkedAt)}</p>
      )}

      {similarSale && (
        <p className="mt-2 text-xs text-[#EAB308]">
          &#x1F4B0; Similar: {similarSale.domain} previously tracked
        </p>
      )}

      <div className="mt-4">
        <a
          href={`https://www.godaddy.com/domainsearch/find?domainToCheck=${d.domain}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-[#00FF88] px-6 py-2.5 text-sm font-bold text-black hover:bg-[#00DD77] transition-colors"
        >
          &#x2705; Register Now &rarr;
        </a>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "registered") {
    return (
      <span className="rounded-full bg-[#55555522] border border-[#55555544] px-2 py-0.5 text-xs font-medium text-[#666]">
        REGISTERED
      </span>
    );
  }
  if (status === "expired") {
    return (
      <span className="rounded-full bg-[#F9731622] border border-[#F9731644] px-2 py-0.5 text-xs font-medium text-[#F97316]">
        EXPIRED
      </span>
    );
  }
  if (status === "pending-delete") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EF444422] border border-[#EF444444] px-2 py-0.5 text-xs font-medium text-[#EF4444]">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#EF4444] opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#EF4444]" />
        </span>
        PENDING DELETE
      </span>
    );
  }
  if (status === "redemption") {
    return (
      <span className="rounded-full bg-[#F9731622] border border-[#F9731644] px-2 py-0.5 text-xs font-medium text-[#F97316]">
        REDEMPTION
      </span>
    );
  }
  if (status === "available") {
    return (
      <span className="rounded-full bg-[#00FF8822] border border-[#00FF8844] px-2 py-0.5 text-xs font-medium text-[#00FF88]">
        AVAILABLE
      </span>
    );
  }
  return (
    <span className="rounded-full bg-[#88888822] border border-[#88888844] px-2 py-0.5 text-xs font-medium text-[#888]">
      {status.toUpperCase()}
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-4 w-20 animate-pulse rounded-full bg-[#1F1F1F]" />
    </div>
  );
}

function DomainCard({
  domain: d,
  whois,
  loading,
}: {
  domain: ExpiredDomain;
  whois?: WhoisResult;
  loading: boolean;
}) {
  const [watchOpen, setWatchOpen] = useState(false);
  const [watchEmail, setWatchEmail] = useState("");
  const [watchSending, setWatchSending] = useState(false);
  const [watchDone, setWatchDone] = useState(false);

  const isPending = d.status === "pending-delete";
  const liveStatus = whois?.status || d.status;
  const isRegistered = whois?.status === "registered";
  const isAvailable = whois?.available === true;
  const showWatch = !isRegistered && !loading;

  async function handleWatch() {
    if (!watchEmail) return;
    setWatchSending(true);
    try {
      await fetch("https://formsubmit.co/ajax/dclbloggerx@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: watchEmail,
          domain: d.domain,
          _subject: `NameBuzz Watchlist — ${d.domain}`,
          _captcha: "false",
          message: `User ${watchEmail} wants to be alerted when ${d.domain} becomes available to register.`,
        }),
      });
      setWatchDone(true);
      setTimeout(() => setWatchOpen(false), 3000);
    } catch {
      // silently fail
    } finally {
      setWatchSending(false);
    }
  }

  return (
    <div
      className={`relative rounded-xl border bg-[#111] p-4 transition-colors ${
        isRegistered
          ? "border-[#1F1F1F] opacity-50"
          : isPending && !isRegistered
          ? "border-[#EF444466]"
          : "border-[#1F1F1F] hover:border-[#00FF8866]"
      }`}
      style={isPending && !isRegistered ? { animation: "pulse-border 2s ease-in-out infinite" } : undefined}
    >
      {isPending && !isRegistered && (
        <span className="absolute top-2 right-2 rounded-full bg-[#EF444422] border border-[#EF444444] px-2 py-0.5 text-[10px] font-bold text-[#EF4444]">
          &#9889; Drops Soon
        </span>
      )}

      <div className="flex items-start justify-between gap-2">
        <div>
          <p className={`font-mono text-lg font-bold ${isRegistered ? "text-[#555]" : "text-white"}`}>{d.domain}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {loading ? <LoadingSkeleton /> : <StatusBadge status={liveStatus} />}
            <span className="rounded-full bg-[#1A1A1A] border border-[#1F1F1F] px-2 py-0.5 text-[10px] font-medium text-[#888]">
              {d.characters} chars
            </span>
            {d.isWord && (
              <span className="text-[10px] font-medium text-[#00D4FF]">
                &#128214; Word domain
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-0.5">
        <p className="text-xs text-[#888]">Expired {d.expiredDaysAgo} day{d.expiredDaysAgo !== 1 ? "s" : ""} ago</p>
        <p className="text-xs text-[#555]">Registered ~{d.registeredYearsAgo} year{d.registeredYearsAgo !== 1 ? "s" : ""} ago</p>
        {whois?.registrar && whois.registrar !== "Unknown" && (
          <p className="text-xs text-[#555]">Registrar: {whois.registrar}</p>
        )}
      </div>

      {/* Action buttons */}
      {isAvailable ? (
        <div className="mt-3">
          <a
            href={`https://www.godaddy.com/domainsearch/find?domainToCheck=${d.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#00FF88] px-4 py-2 text-sm font-bold text-black hover:bg-[#00DD77] transition-colors"
          >
            &#x2705; AVAILABLE NOW &mdash; Register It
          </a>
        </div>
      ) : isRegistered ? null : (
        <div className="mt-3 flex gap-2">
          <a
            href={`https://www.godaddy.com/domainsearch/find?domainToCheck=${d.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-[#1F1F1F] px-3 py-1.5 text-xs font-medium text-[#888] hover:border-[#00FF88] hover:text-[#F0F0F0] transition-colors"
          >
            Check Availability &rarr;
          </a>
          <a
            href="https://www.namejet.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-[#1F1F1F] px-3 py-1.5 text-xs font-medium text-[#888] hover:border-[#00FF88] hover:text-[#F0F0F0] transition-colors"
          >
            Backorder &rarr;
          </a>
        </div>
      )}

      {/* Watch button */}
      {showWatch && !isAvailable && (
        <button
          onClick={() => setWatchOpen(!watchOpen)}
          className="mt-2 text-xs font-medium text-[#EAB308] hover:text-[#FACC15] transition-colors"
        >
          &#x1F514; Watch This Domain
        </button>
      )}

      {/* Watch panel */}
      {watchOpen && (
        <div className="mt-3 rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] p-3">
          {watchDone ? (
            <p className="text-sm text-[#00FF88]">
              &#x2705; Alert set for {d.domain}. We will email you the moment it drops.
            </p>
          ) : (
            <>
              <p className="text-xs text-[#888] mb-2">Get an email the moment this domain drops</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={watchEmail}
                  onChange={(e) => setWatchEmail(e.target.value)}
                  className="flex-1 rounded-lg border border-[#1F1F1F] bg-[#111] px-3 py-1.5 text-sm text-[#F0F0F0] outline-none focus:border-[#00FF88]"
                />
                <button
                  onClick={handleWatch}
                  disabled={watchSending || !watchEmail}
                  className="rounded-lg bg-[#00FF88] px-4 py-1.5 text-sm font-bold text-black hover:bg-[#00DD77] transition-colors disabled:opacity-50"
                >
                  {watchSending ? "..." : "Set Alert"}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes pulse-border {
          0%, 100% { border-color: rgba(239, 68, 68, 0.4); }
          50% { border-color: rgba(239, 68, 68, 0.8); }
        }
      `}</style>
    </div>
  );
}

function WatchMultipleSection() {
  const [domains, setDomains] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState("");

  async function handleWatchAll() {
    if (!email || !domains.trim()) return;
    setSending(true);
    const domainList = domains
      .split("\n")
      .map((d) => d.trim())
      .filter(Boolean);

    try {
      for (const domain of domainList) {
        await fetch("https://formsubmit.co/ajax/dclbloggerx@gmail.com", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            email,
            domain,
            _subject: `NameBuzz Watchlist — ${domain}`,
            _captcha: "false",
            message: `User ${email} wants to be alerted when ${domain} becomes available to register.`,
          }),
        });
      }
      setResult(`Watching ${domainList.length} domain${domainList.length !== 1 ? "s" : ""}. You will be emailed the moment any of them drop.`);
    } catch {
      setResult("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mt-16 rounded-xl border border-[#1F1F1F] bg-[#111] p-6">
      <h2 className="text-lg font-bold text-[#F0F0F0] mb-1">&#x1F514; Watch Multiple Domains</h2>
      <p className="text-sm text-[#888] mb-4">Get email alerts the moment any of these domains drop and become available.</p>

      {result ? (
        <p className="text-sm text-[#00FF88]">&#x2705; {result}</p>
      ) : (
        <>
          <textarea
            placeholder="Enter .ai domains to watch, one per line&#10;example.ai&#10;another.ai"
            value={domains}
            onChange={(e) => setDomains(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] px-3 py-2 text-sm text-[#F0F0F0] outline-none focus:border-[#00FF88] font-mono"
          />
          <div className="mt-3 flex gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] px-3 py-2 text-sm text-[#F0F0F0] outline-none focus:border-[#00FF88]"
            />
            <button
              onClick={handleWatchAll}
              disabled={sending || !email || !domains.trim()}
              className="rounded-lg bg-[#00FF88] px-5 py-2 text-sm font-bold text-black hover:bg-[#00DD77] transition-colors disabled:opacity-50"
            >
              {sending ? "Sending..." : "Watch All"}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
