import Link from "next/link";
import type { Metadata } from "next";
import SalesTableClient from "../components/SalesTableClient";
import Navbar from "../components/Navbar";

export const metadata: Metadata = {
  title: ".ai Domain Sales — NameBuzz",
  description:
    "Browse all recent .ai domain name sales. See what AI domains are selling for across NamePros, DN Journal, Sedo, Afternic and more.",
  alternates: {
    canonical: "https://namebuzz.co/sales",
  },
  openGraph: {
    title: ".ai Domain Sales — NameBuzz",
    description: "Browse all recent .ai domain name sales. See what AI domains are selling for across NamePros, DN Journal, Sedo, Afternic and more.",
    url: "https://namebuzz.co/sales",
    siteName: "NameBuzz",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: ".ai Domain Sales — NameBuzz",
    description: "Browse all recent .ai domain name sales. See what AI domains are selling for across NamePros, DN Journal, Sedo, Afternic and more.",
  },
};

export default function SalesPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0]">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            <span className="text-[#00FF88]">.ai</span> Domain Sales
          </h1>
          <p className="text-[#888]">
            Real data from NamePros, DN Journal, Sedo, Afternic & more
          </p>
        </div>

        {/* Sales table - loads from API */}
        <SalesTableClient />

        {/* CTA */}
        <div className="mt-10 rounded-xl border border-[#00FF88]/20 bg-[#111] p-6 text-center">
          <h3 className="mb-2 text-lg font-bold">
            Want to know what your .ai domain is worth?
          </h3>
          <p className="mb-4 text-sm text-[#888]">
            Get an instant estimate based on real sales data.
          </p>
          <Link
            href="/value"
            className="inline-block rounded-lg bg-[#00FF88] px-6 py-2.5 text-sm font-semibold text-[#0A0A0A] hover:bg-[#00CC6A]"
          >
            Estimate My Domain Value
          </Link>
        </div>
      </div>
    </div>
  );
}
