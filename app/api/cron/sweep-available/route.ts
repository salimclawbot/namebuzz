import { NextResponse } from "next/server";

export async function GET() {
  // Check 50 domains per hourly sweep
  const words = ["flux","nova","apex","iris","echo","luma","koda","riva","zeta","onyx",
    "vega","luna","aria","dusk","mira","cera","demi","lyra","nora","remi",
    "sora","tara","vera","wren","xena","yara","zara","aero","algo","allo",
    "alto","ambi","amio","anki","arco","argo","arki","arko","arma","armo",
    "arna","arni","arno","arnu","aroa","arob","aroc","arod","aroe","arof"];

  const results = await Promise.allSettled(
    words.map(async (w) => {
      const domain = `${w}.ai`;
      const res = await fetch(`https://rdap.org/domain/${domain}`, {
        signal: AbortSignal.timeout(3000)
      });
      return { domain, available: res.status === 404 };
    })
  );

  const available = results
    .filter((r): r is PromiseFulfilledResult<{domain: string, available: boolean}> =>
      r.status === "fulfilled" && r.value.available)
    .map(r => r.value.domain);

  if (available.length > 0) {
    // Email Matty the available domains
    await fetch("https://formsubmit.co/ajax/dclbloggerx@gmail.com", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: `🚨 NameBuzz Sweep — ${available.length} .ai domains available now`,
        message: `Available .ai domains found in this sweep:\n\n${available.join("\n")}\n\nCheck them at: https://namebuzz.co/expired`,
        _captcha: "false"
      })
    });
  }

  return NextResponse.json({ checked: words.length, available, timestamp: new Date().toISOString() });
}
