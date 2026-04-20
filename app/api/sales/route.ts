import { NextResponse } from "next/server";
import { seedSales } from "@/lib/seed-sales";

export async function GET() {
  const all = Array.from(seedSales).sort((a, b) => b.price - a.price);

  return NextResponse.json(all, {
    headers: {
      "Cache-Control": "no-store, must-revalidate",
      "Pragma": "no-cache",
    },
  });
}
