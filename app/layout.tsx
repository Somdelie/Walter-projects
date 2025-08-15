import type React from "react";
import type { Metadata } from "next";
import { Rethink_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Script from "next/script";

const inter = Rethink_Sans({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default:
      "WalterProjects - Premium Aluminum Supplier & Manufacturing Solutions",
    template: "%s | WalterProjects",
  },
  description:
    "Leading aluminum supplier specializing in high-quality raw materials, custom extrusions, sheets, and fabricated components. Serving industries with precision aluminum solutions since establishment.",
  keywords: [
    "aluminum supplier",
    "aluminum extrusions",
    "aluminum sheets",
    "aluminum fabrication",
    "custom aluminum products",
    "industrial aluminum",
    "aluminum raw materials",
    "aluminum manufacturing",
    "metal supplier",
    "aluminum components",
    "construction aluminum",
    "aerospace aluminum",
    "automotive aluminum",
  ],
  authors: [{ name: "Cautious Ndlovu" }],
  creator: "Cautious Ndlovu",
  publisher: "Cautious Ndlovu",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "http://walterprojects.co.za",
  },
  openGraph: {
    title:
      "WalterProjects - Premium Aluminum Supplier & Manufacturing Solutions",
    description:
      "Leading aluminum supplier specializing in high-quality raw materials, custom extrusions, sheets, and fabricated components.",
    url: "http://walterprojects.co.za",
    siteName: "WalterProjects",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "http://walterprojects.co.za/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "WalterProjects - Premium Aluminum Supplier",
      },
      {
        url: "http://walterprojects.co.za/og-image-square.jpg",
        width: 1200,
        height: 1200,
        alt: "WalterProjects - Aluminum Manufacturing Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WalterProjects - Premium Aluminum Supplier",
    description:
      "Leading aluminum supplier specializing in high-quality raw materials, custom extrusions, and fabricated components.",
    creator: "@walterprojects",
    images: ["http://walterprojects.co.za/twitter-image.jpg"],
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  category: "Manufacturing",
  classification: "Business",
  other: {
    "msapplication-TileColor": "#2563eb",
    "theme-color": "#ffffff",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "format-detection": "telephone=no",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "WalterProjects",
              description:
                "Leading aluminum supplier specializing in high-quality raw materials, custom extrusions, sheets, and fabricated components.",
              url: "http://walterprojects.co.za",
              logo: "http://walterprojects.co.za/logo.png",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+27-11-262-0677",
                contactType: "Customer Service",
                availableLanguage: "English",
              },
              sameAs: [
                "https://www.linkedin.com/company/walterprojects",
                "https://twitter.com/walterprojects",
              ],
              address: {
                "@type": "PostalAddress",
                streetAddress: "54 5th Street Marlboro",
                addressLocality: "Johannesburg",
                addressRegion: "Gauteng",
                postalCode: "2090",
                addressCountry: "SA",
              },
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        {/* Google Ads Global site tag */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=AW-17483333566"
        />
        <Script id="google-ads" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17483333566');
          `}
        </Script>

        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
