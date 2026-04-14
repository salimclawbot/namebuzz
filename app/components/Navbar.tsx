"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-[#1F1F1F] bg-[#0A0A0A]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold">
          <span className="text-[#00FF88]">.ai</span>{" "}
          <span className="text-[#F0F0F0]">NameBuzz</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${
              pathname === "/" ? "text-[#00FF88]" : "text-[#888] hover:text-[#F0F0F0]"
            }`}
          >
            Sales Tracker
          </Link>
          <Link
            href="/value"
            className={`text-sm font-medium transition-colors ${
              pathname === "/value" ? "text-[#00FF88]" : "text-[#888] hover:text-[#F0F0F0]"
            }`}
          >
            Value My Domain
          </Link>
          <Link
            href="/expired"
            className={`text-sm font-medium transition-colors ${
              pathname === "/expired" ? "text-[#00FF88]" : "text-[#888] hover:text-[#F0F0F0]"
            }`}
          >
            Expired
          </Link>
          <Link
            href="/blog"
            className={`text-sm font-medium transition-colors ${
              pathname.startsWith("/blog") ? "text-[#00FF88]" : "text-[#888] hover:text-[#F0F0F0]"
            }`}
          >
            Blog
          </Link>
        </div>
      </div>
    </nav>
  );
}
