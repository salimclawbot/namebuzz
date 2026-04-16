"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/sales", label: "Recent Sales" },
  { href: "/charts", label: "Charts" },
  { href: "/value", label: "Value My Domain" },
  { href: "/expired", label: "Expired" },
  { href: "/blog", label: "Blog" },
  { href: "/newsletter", label: "Newsletter" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className="border-b border-[#1F1F1F] bg-[#0A0A0A]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/" className="text-lg font-bold">
            <span className="text-[#00FF88]">.ai</span>{" "}
            <span className="text-[#F0F0F0]">NameBuzz.co</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-[#00FF88]"
                    : "text-[#888] hover:text-[#F0F0F0]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Hamburger button — mobile only */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden flex flex-col justify-center items-center w-11 h-11 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Open menu"
          >
            <div className="flex flex-col gap-1.5 w-5">
              <div className="h-0.5 w-full bg-[#F0F0F0] rounded-full" />
              <div className="h-0.5 w-full bg-[#F0F0F0] rounded-full" />
              <div className="h-0.5 w-3/4 bg-[#F0F0F0] rounded-full" />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[100] flex"
          onClick={() => setMobileOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Menu panel */}
          <div
            className="relative ml-auto h-full w-72 max-w-[85vw] bg-[#0F0F0F] border-l border-[#1F1F1F] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button + Logo */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1F1F1F]">
              <Link
                href="/"
                className="text-lg font-bold"
                onClick={() => setMobileOpen(false)}
              >
                <span className="text-[#00FF88]">.ai</span>{" "}
                <span className="text-[#F0F0F0]">NameBuzz.co</span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center w-11 h-11 rounded-lg hover:bg-white/5 transition-colors"
                aria-label="Close menu"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  stroke="#888"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="2" y1="2" x2="16" y2="16" />
                  <line x1="16" y1="2" x2="2" y2="16" />
                </svg>
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center px-5 py-4 text-base font-medium transition-colors border-b border-[#1A1A1A] ${
                    isActive(link.href)
                      ? "text-[#00FF88] bg-[#00FF88]/5"
                      : "text-[#999] hover:text-[#F0F0F0] hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Footer note */}
            <div className="px-5 py-4 border-t border-[#1F1F1F]">
              <p className="text-xs text-[#555]">
                Curated domain intelligence
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
