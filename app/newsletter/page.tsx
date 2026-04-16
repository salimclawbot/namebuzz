import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Domain Sales Alerts | NameBuzz Newsletter",
  description:
    "Get the week's biggest domain sales delivered to your inbox. Free weekly alerts on .ai, .com and .io domain sales plus undervalued opportunities.",
};

export default function NewsletterPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0]">
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div>
            <p className="text-sm font-medium text-[#00FF88] mb-4 tracking-wide uppercase">
              Free Weekly Newsletter
            </p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-6">
              The .ai Goldrush Is Real.{" "}
              <span className="text-[#00FF88]">Here's What's Actually Selling.</span>
            </h1>
            <p className="text-[#888] text-base mb-8 leading-relaxed">
              Get the week's biggest domain sales delivered to your inbox — plus
              undervalued .ai and .com domains worth watching. One email a week.
              No fluff, no hype — just the deals that matter.
            </p>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <span className="text-[#00FF88] mt-1">✓</span>
                <span className="text-sm text-[#ccc]">
                  <strong className="text-[#F0F0F0]">Weekly alerts on domain sales that actually moved</strong> — not gossip. Actual closing prices on .ai, .com and .io domains.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00FF88] mt-1">✓</span>
                <span className="text-sm text-[#ccc]">
                  <strong className="text-[#F0F0F0]">Spot undervalued domains before the market catches on</strong> — names with real traffic, decent EMDs, aged domains at stupid prices.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00FF88] mt-1">✓</span>
                <span className="text-sm text-[#ccc]">
                  <strong className="text-[#F0F0F0]">No minimum portfolio required</strong> — we cover spots that fit budgets from $500 to $50,000+.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00FF88] mt-1">✓</span>
                <span className="text-sm text-[#ccc]">
                  <strong className="text-[#F0F0F0]">Handpicked, not spray-and-pray</strong> — every alert is reviewed. If it ain't worth your time, we don't send it.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00FF88] mt-1">✓</span>
                <span className="text-sm text-[#ccc]">
                  <strong className="text-[#F0F0F0]">One email a week, every Tuesday morning</strong> — fits in your commute. No daily spam.
                </span>
              </li>
            </ul>

            <p className="text-xs text-[#555]">
              Join <span className="text-[#888] font-medium">2,400+</span> Australian domain investors getting weekly alerts on the sales that count.
            </p>
          </div>

          {/* Right: Signup Form */}
          <div className="bg-[#111] border border-[#1F1F1F] rounded-2xl p-8">
            <NewsletterForm />
          </div>
        </div>
      </div>
    </div>
  );
}

function NewsletterForm() {
  "use client";
  return (
    <form
      action="/api/newsletter"
      method="POST"
      className="space-y-5"
      id="newsletter-form"
    >
      <div>
        <h2 className="text-xl font-bold mb-2">
          Get the Weekly Domain Sales Alert
        </h2>
        <p className="text-sm text-[#888] mb-6">
          One email, every Tuesday. Unsubscribe anytime.
        </p>
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-[#ccc] mb-2"
        >
          Your email address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          placeholder="you@example.com"
          className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-[#F0F0F0] placeholder-[#555] text-sm focus:outline-none focus:border-[#00FF88] transition-colors"
        />
      </div>

      <button
        type="submit"
        form="newsletter-form"
        className="w-full bg-[#00FF88] hover:bg-[#00dd77] text-[#0A0A0A] font-bold py-3 px-6 rounded-lg transition-colors text-sm tracking-wide"
      >
        Send Me the Weekly Alerts →
      </button>

      <p className="text-xs text-[#555] text-center">
        No spam. Unsubscribe any time with one click.
      </p>
    </form>
  );
}
