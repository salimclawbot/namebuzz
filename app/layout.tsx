import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://namebuzz.co"),
  title: ".ai Domain Sales Tracker | NameBuzz",
  description:
    "Track 500+ verified .ai domain sales. Bot.ai $1.2M • Lotus.ai $400K • Speed.ai $165K. Real data from DN Journal, Sedo, Afternic.",
  openGraph: {
    title: ".ai Domain Sales Tracker | NameBuzz",
    description: "500+ verified .ai domain sales. Bot.ai $1.2M • Lotus.ai $400K • Speed.ai $165K. Real data, updated regularly.",
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
    description: "500+ verified .ai domain sales. Bot.ai $1.2M • Lotus.ai $400K and more.",
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
      {/* MATTY: Google Ads Global Site Tag — Replace AW-PLACEHOLDER with your Google Ads Conversion ID */}
      {/* Get it from: Google Ads > Tools & Settings > Conversions > create conversion > install tag */}
      <Script src="https://www.googletagmanager.com/gtag/js?id=AW-PLACEHOLDER" strategy="afterInteractive" />
      <Script id="google-ads-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag("js", new Date());
        gtag("config", "AW-PLACEHOLDER");
      `}</Script>
      {/* MATTY: OneSignal Web Push — Replace ONESIGNAL-APP-ID-PLACEHOLDER with your App ID */}
      {/* Free account: onesignal.com > Create App > Web Push > get App ID */}
      <Script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer />
      <Script id="onesignal-init" strategy="afterInteractive">{`
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        OneSignalDeferred.push(async function(OneSignal) {
          await OneSignal.init({
            appId: "ONESIGNAL-APP-ID-PLACEHOLDER",
            notifyButton: { enable: false },
          });
          // Show prompt after 30 seconds
          setTimeout(() => { OneSignal.Slidedown.promptPush(); }, 30000);
        });
      `}</Script>
      </body>
    </html>
  );
}
