import { NextResponse } from "next/server";
import { seedSales, type Sale } from "@/lib/seed-sales";

function fmt(price: number): string {
  return "$" + price.toLocaleString("en-US");
}

async function scrapeDNJournal(): Promise<Sale[]> {
  const html = await fetch("https://dnjournal.com/domainsales.htm", {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; DomainTracker/1.0)" },
    next: { revalidate: 86400 },
  })
    .then((r) => r.text())
    .catch(() => "");

  const sales: Sale[] = [];
  const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gs;
  const stripTags = (s: string) => s.replace(/<[^>]+>/g, "").trim();

  let rowMatch;
  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const row = rowMatch[1];
    if (!row.toLowerCase().includes(".ai")) continue;

    const cells: string[] = [];
    const cellRe = /<td[^>]*>(.*?)<\/td>/gs;
    let cellMatch;
    while ((cellMatch = cellRe.exec(row)) !== null) {
      cells.push(stripTags(cellMatch[1]).slice(0, 80));
    }

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      if (/^[\w-]+\.ai$/i.test(cell)) {
        const price =
          cells
            .slice(Math.max(0, i - 2), i + 4)
            .find((c) => /^\$[\d,]+$/.test(c)) ?? "";
        const venue =
          cells
            .slice(Math.max(0, i - 2), i + 4)
            .find((c) =>
              /sedo|godaddy|afternic|private|uniregistry|flippa|dan\.com/i.test(c)
            ) ?? "Reported";
        if (price) {
          const numPrice = parseInt(price.replace(/[$,]/g, ""));
          sales.push({
            domain: cell,
            price: numPrice,
            priceFormatted: fmt(numPrice),
            venue,
            date: new Date().toISOString().split("T")[0],
            source: "DN Journal",
            sourceUrl: "https://dnjournal.com",
            buyer: "Undisclosed",
            seller: "Undisclosed",
          });
        }
      }
    }
  }
  return sales;
}

export async function GET() {
  const scraped = await scrapeDNJournal();

  const byDomain = new Map<string, Sale>();
  for (const sale of seedSales) {
    byDomain.set(sale.domain.toLowerCase(), sale);
  }
  for (const sale of scraped) {
    byDomain.set(sale.domain.toLowerCase(), sale);
  }

  const all = Array.from(byDomain.values())
    .sort((a, b) => {
      const dateDiff = b.date.localeCompare(a.date);
      if (dateDiff !== 0) return dateDiff;
      return b.price - a.price;
    })
    .slice(0, 1000);

  return NextResponse.json(all, {
    headers: {
      "Cache-Control": "s-maxage=86400, stale-while-revalidate=172800",
    },
  });
}
