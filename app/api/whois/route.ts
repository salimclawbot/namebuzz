import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get("domain");
  if (!domain) return NextResponse.json({ error: "No domain" }, { status: 400 });

  try {
    const res = await fetch(`https://rdap.org/domain/${domain}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });

    if (res.status === 404) {
      return NextResponse.json({ domain, available: true, status: "available" }, {
        headers: { "Cache-Control": "s-maxage=3600" }
      });
    }

    const data = await res.json();
    const statuses: string[] = data.status || [];

    let status = "registered";
    if (statuses.some((s: string) => s.includes("pendingDelete"))) status = "pending-delete";
    else if (statuses.some((s: string) => s.includes("redemption"))) status = "redemption";

    const expiry = data.events?.find((e: { eventAction: string }) => e.eventAction === "expiration")?.eventDate || null;
    const registrar = data.entities?.[0]?.vcardArray?.[1]?.find((v: string[]) => v[0] === "fn")?.[3] || "Unknown";

    return NextResponse.json({ domain, available: false, status, expiry, registrar }, {
      headers: { "Cache-Control": "s-maxage=3600" }
    });
  } catch {
    return NextResponse.json({ domain, available: false, status: "unknown" }, {
      headers: { "Cache-Control": "s-maxage=300" }
    });
  }
}
