import { NextResponse } from "next/server";
import { seedSales, type Sale } from "@/lib/seed-sales";

export async function GET() {
  const all = Array.from(seedSales).sort((a, b) => b.price - a.price);

  return NextResponse.json(all, {
    headers: {
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
