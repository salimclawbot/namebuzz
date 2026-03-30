import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Expired .ai Domains — Recently Dropped & Pending Delete | NameBuzz",
  description:
    "Browse recently expired and pending delete .ai domains. Find dropped .ai domains available for registration or backorder.",
  openGraph: {
    title: "Expired .ai Domains — Recently Dropped & Pending Delete | NameBuzz",
    description:
      "Browse recently expired and pending delete .ai domains. Find dropped .ai domains available for registration or backorder.",
    url: "https://namebuzz.co/expired",
  },
  alternates: {
    canonical: "https://namebuzz.co/expired",
  },
};

export default function ExpiredLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
