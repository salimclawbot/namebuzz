"use client";

import { useState } from "react";

interface EmailCaptureProps {
  subject: string;
  variant: "sticky" | "bottom";
}

export default function EmailCapture({ subject, variant }: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("https://formsubmit.co/ajax/dclbloggerx@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, _subject: subject, _captcha: false }),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (variant === "sticky") {
    return (
      <div className="border-b border-[#00FF88]/30 bg-[#111]">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-4 py-3 sm:flex-row sm:justify-center">
          <p className="text-sm font-semibold text-[#F0F0F0]">Get weekly .ai domain sales in your inbox</p>
          {status === "success" ? (
            <span className="text-sm text-[#00FF88]">✅ You&apos;re in! Check your inbox.</span>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] px-3 py-1.5 text-sm text-[#F0F0F0] placeholder-[#555] outline-none focus:border-[#00FF88]/50"
              />
              <button
                type="submit"
                disabled={status === "sending"}
                className="rounded-lg bg-[#00FF88] px-4 py-1.5 text-sm font-bold text-black hover:bg-[#00DD77] transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {status === "sending" ? "..." : "Subscribe Free"}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // bottom variant
  return (
    <section className="mt-16 border-t border-[#00FF88]/30 bg-[#111] px-4 py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold text-[#F0F0F0]">The .ai Domain Market, Weekly.</h2>
        <p className="mt-2 text-sm text-[#888]">Join investors and founders tracking the market.</p>
        {status === "success" ? (
          <p className="mt-6 text-[#00FF88]">✅ You&apos;re in! Check your inbox.</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full max-w-xs rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] px-4 py-2.5 text-sm text-[#F0F0F0] placeholder-[#555] outline-none focus:border-[#00FF88]/50"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="rounded-lg bg-[#00FF88] px-6 py-2.5 text-sm font-bold text-black hover:bg-[#00DD77] transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {status === "sending" ? "Subscribing..." : "Subscribe Free"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
