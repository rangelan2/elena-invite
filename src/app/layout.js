import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
