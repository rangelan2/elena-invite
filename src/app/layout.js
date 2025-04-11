import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#4A5D4F',
};

export const metadata = {
  metadataBase: new URL('https://party.elenaandanthony.com'),
  title: "You're invited! Elena and Anthony's engagement party 🥂",
  description: "Join us for a summertime patio celebration.",
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: "You're invited! Elena and Anthony's engagement party 🥂",
    description: "Saturday, June 14, 2025 · Saturn Road · Brooklyn, NY",
    type: "website",
    images: [
      {
        url: "/images/social-preview.png",
        width: 1200,
        height: 630,
        alt: "Two champagne flutes toasting over an elegant cheese board - Join us in celebrating Elena and Anthony's engagement",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "You're invited! Elena and Anthony's engagement party 🥂",
    description: "Saturday, June 14, 2025 · Saturn Road · Brooklyn, NY",
    images: ["/images/social-preview.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="theme-color" content="#4A5D4F" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
