import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Poppins } from "next/font/google";
import type { Metadata } from "next";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://blog.naturaleatinghub.online"),
  title: {
    default: "Natural Eating Hub Blog",
    template: "%s | Natural Eating Hub",
  },
  description:
    "Trusted insights on weight loss, slimming teas, and natural wellness. Evidence-based guides to help you achieve lasting results safely.",
  keywords: [
    "green tea weight loss",
    "slimming tea",
    "natural weight loss",
    "wellness",
    "fat burning",
    "matcha benefits",
  ],
  authors: [{ name: "Natural Eating Hub Team" }],
  openGraph: {
    type: "website",
    url: "https://blog.naturaleatinghub.online",
    title: "Natural Eating Hub Blog",
    description:
      "Science-backed tips on slimming teas, weight loss strategies, and natural health for a better lifestyle.",
    siteName: "Natural Eating Hub",
    images: [
      {
        url: "/images/slimming-tea-og.webp",
        width: 1200,
        height: 630,
        alt: "Natural Eating Hub Blog - Wellness & Weight Loss",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@LeanLivingTips",
    creator: "@LeanLivingTips",
    images: ["/images/slimming-tea-og.webp"],
  },
  
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${poppins.className}`}>
      <body className="flex min-h-screen flex-col bg-background font-sans text-text-dark antialiased">
        <Header />
        <main className="container-readable flex-grow py-8 md:py-12">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}