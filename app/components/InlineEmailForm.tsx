"use client";

import { useState } from "react";

export default function InlineEmailForm() {
  const [email, setEmail] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!email) return;
        fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }).then(() => setEmail(""));
      }}
      className="flex w-full items-center gap-2 sm:w-auto"
    >
      <input
        type="email"
        placeholder="you@example.com"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="min-w-0 flex-1 rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] px-3 py-1.5 text-xs text-[#F0F0F0] placeholder-[#555] outline-none sm:w-48"
      />
      <button
        type="submit"
        className="rounded-lg bg-[#00FF88] px-3 py-1.5 text-xs font-bold text-black hover:brightness-110"
      >
        Subscribe
      </button>
    </form>
  );
}
