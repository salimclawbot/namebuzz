import { NextResponse } from "next/server";

// Daily NamePros scraper — fires at 9am AEDT (23:00 UTC)
// Path: /api/cron/namepros-daily
export async function GET() {
  try {
    const { spawn } = await import("child_process");
    const path = "/Users/openclaw/.agents/skills/namepros-sales-scraper/scripts/scrape.py";
    await new Promise((resolve, reject) => {
      const child = spawn("python3", [path], { timeout: 120000 });
      child.on("close", (code) => code === 0 ? resolve(code) : reject(new Error(`exit ${code}`)));
    });
    return NextResponse.json({ ok: true, job: "namepros-daily" });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
