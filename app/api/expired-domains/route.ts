import { NextResponse } from "next/server";

// 200 high-value .ai domain patterns to rotate through checking
const VALUABLE_PATTERNS = [
  // 3-letter combos (sample — include 50)
  "ace","act","add","age","aid","aim","air","all","app","arc",
  "ark","arm","art","ask","awe","axe","bay","bid","bit","bot",
  "box","buy","cap","car","cat","cod","cop","cry","cut","dab",
  "dad","dam","day","dex","did","dig","dim","dip","doc","dot",
  "duo","ear","eat","elf","elk","end","era","eve","ewe","eye",
  // 4-letter words (sample — include 50)
  "able","acid","aged","also","area","army","auto","baby","back","ball",
  "band","base","bath","bear","beat","been","bell","best","bird","blow",
  "blue","bold","bolt","bond","bone","book","boom","boot","bore","born",
  "both","bulk","burn","busy","byte","cafe","cage","cake","call","calm",
  "camp","cape","card","care","cart","case","cash","cast","cave","cell",
  // AI/tech words
  "flux","grok","hive","jade","kite","lens","loop","mint","node","nova",
  "omni","peak","pier","pine","pipe","plug","poll","pond","pool","port",
  "pore","post","pour","prey","prod","puck","pure","push","rack","raid",
  "rain","rake","ramp","rank","rave","rays","read","real","reed","reef",
  "reel","rein","rely","rent","rest","ride","rift","rime","ring","riot"
].map(w => `${w}.ai`);

async function checkRDAP(domain: string): Promise<{domain: string, available: boolean, status: string}> {
  try {
    const res = await fetch(`https://rdap.org/domain/${domain}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(3000),
    });
    if (res.status === 404) return { domain, available: true, status: "available" };
    const data = await res.json();
    const statuses: string[] = data.status || [];
    let status = "registered";
    if (statuses.some((s: string) => s.toLowerCase().includes("pendingdelete"))) status = "pending-delete";
    else if (statuses.some((s: string) => s.toLowerCase().includes("redemption"))) status = "redemption";
    return { domain, available: false, status };
  } catch {
    return { domain, available: false, status: "unknown" };
  }
}

export async function GET() {
  // Check a random batch of 20 valuable patterns
  const shuffled = [...VALUABLE_PATTERNS].sort(() => Math.random() - 0.5).slice(0, 20);
  const rdapResults = await Promise.allSettled(shuffled.map(checkRDAP));

  const available = rdapResults
    .filter((r): r is PromiseFulfilledResult<{domain: string, available: boolean, status: string}> =>
      r.status === "fulfilled" && r.value.available)
    .map(r => ({
      domain: r.value.domain,
      status: "available" as const,
      source: "rdap-live",
      checkedAt: new Date().toISOString()
    }));

  const pendingDelete = rdapResults
    .filter((r): r is PromiseFulfilledResult<{domain: string, available: boolean, status: string}> =>
      r.status === "fulfilled" && r.value.status === "pending-delete")
    .map(r => ({ domain: r.value.domain, status: "pending-delete" as const, source: "rdap-live" }));

  // Try scraping expireddomains.net
  let expired: Array<{domain: string, status: string, source: string}> = [];
  try {
    const scrapeRes = await fetch(
      "https://www.expireddomains.net/deleted-domains/?ftlds[]=ai&fwhois=22",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          "Accept": "text/html",
        },
        signal: AbortSignal.timeout(8000),
        next: { revalidate: 3600 }
      }
    );
    if (scrapeRes.ok) {
      const html = await scrapeRes.text();
      // Parse domain names from the table - they appear as links like /go/domain/example.ai
      const matches = html.match(/\/go\/domain\/([a-z0-9-]+\.ai)/g) || [];
      expired = matches.slice(0, 30).map(m => ({
        domain: m.replace("/go/domain/", ""),
        status: "expired",
        source: "expireddomains.net"
      }));
    }
  } catch {
    // Scrape failed — use empty array
  }

  return NextResponse.json({
    available,
    pendingDelete,
    expired,
    checkedCount: shuffled.length,
    lastUpdated: new Date().toISOString(),
    source: "rdap-live + expireddomains.net"
  }, {
    headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" }
  });
}
