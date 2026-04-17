import { NextResponse } from "next/server";

// Weekly full audit — fires Sunday 6pm AEDT (08:00 UTC)
// Path: /api/cron/weekly-audit
export async function GET() {
  try {
    const { spawn } = await import("child_process");
    const path = "/Users/openclaw/.agents/skills/namebuzz-deployment-guardrails/scripts/weekly-audit.py";
    await new Promise((resolve, reject) => {
      const child = spawn("python3", [path], { timeout: 180000 });
      child.on("close", (code) => code === 0 ? resolve(code) : reject(new Error(`exit ${code}`)));
    });
    return NextResponse.json({ ok: true, job: "weekly-audit" });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
