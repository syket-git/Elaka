import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "এলাকা - Elaka | আপনার এলাকা সম্পর্কে জানুন",
  description: "চট্টগ্রামের এলাকা সম্পর্কে জানুন - নিরাপত্তা, অবকাঠামো, বসবাসযোগ্যতা এবং আরও অনেক কিছু",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "এলাকা",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "bn_BD",
    url: "https://elaka.app",
    title: "এলাকা - Elaka",
    description: "আপনার এলাকা সম্পর্কে জানুন",
    siteName: "এলাকা",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f172a",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
