import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, appendFileSync, existsSync } from "fs";
import { join } from "path";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body?.email?.trim();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    const entry = JSON.stringify({ email, subscribedAt: new Date().toISOString() }) + "\n";
    
    // For now, append to a log file (can be swapped for email service later)
    const logPath = "/tmp/namebuzz-signups.log";
    try {
      appendFileSync(logPath, entry);
    } catch {
      // Silently fail on Vercel serverless (ephemeral filesystem)
    }

    console.log(`Newsletter signup: ${email}`);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
