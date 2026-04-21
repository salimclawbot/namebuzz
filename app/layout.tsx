import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://namebuzz.co"),
  title: ".ai Domain Sales Tracker | NameBuzz",
  description:
    "Track 3,900+ verified .ai domain sales. AI.com $70M • X.ai $5M • Data.ai $1.8M. Real data from NameBio, DN Journal, Sedo, Afternic.",
  openGraph: {
    title: ".ai Domain Sales Tracker | NameBuzz",
    description: "3,900+ verified .ai domain sales. AI.com $70M • X.ai $5M • Data.ai $1.8M. Real data, updated weekly.",
    url: "https://namebuzz.co",
    siteName: "NameBuzz",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: ".ai Domain Sales Tracker — NameBuzz",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: ".ai Domain Sales Tracker | NameBuzz",
    description: "3,900+ verified .ai domain sales. AI.com $70M • X.ai $5M and more.",
    images: ["/og-image.png"],
  },
  verification: {
    google: "QveKxoYgtrlb91tdzPwPSUbUL4ZhflTwNolW55k67nk",
  },
  alternates: {
    canonical: "https://namebuzz.co",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0A0A0A] text-[#F0F0F0] antialiased`}>
        {children}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-4KFFC0KMMX"
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-4KFFC0KMMX');
        `}
      </Script>
      </body>
    </html>
  );
}
