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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Event",
              "name": "Elena and Anthony's Engagement Party",
              "startDate": "2025-06-14T19:00-04:00",
              "endDate": "2025-06-14T23:00-04:00",
              "eventStatus": "https://schema.org/EventScheduled",
              "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
              "location": {
                "@type": "Place",
                "name": "Saturn Road",
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": "276 Court St",
                  "addressLocality": "Brooklyn",
                  "addressRegion": "NY",
                  "postalCode": "",
                  "addressCountry": "US"
                }
              },
              "image": [
                "https://party.elenaandanthony.com/images/social-preview.png"
              ],
              "description": "Join us for a summertime patio celebration to celebrate Elena and Anthony's engagement!",
              "offers": {
                "@type": "Offer",
                "url": "https://party.elenaandanthony.com",
                "price": "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/LimitedAvailability",
                "validFrom": "2024-01-01T00:00:00-05:00"
              },
              "organizer": {
                "@type": "Person",
                "name": "Elena and Anthony"
              }
            })
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <noscript>
          <div style={{ 
            padding: '20px', 
            background: '#f8f9fa', 
            textAlign: 'center',
            margin: '40px auto',
            maxWidth: '600px',
            border: '1px solid #ddd',
            borderRadius: '8px'
          }}>
            <h1 style={{ color: '#4A5D4F', marginBottom: '20px' }}>JavaScript Required</h1>
            <p style={{ marginBottom: '15px' }}>
              This website requires JavaScript to provide you with the best experience.
              Please enable JavaScript in your browser settings to continue.
            </p>
            <p style={{ color: '#4A5D4F' }}>
              Elena and Anthony's Engagement Party - Saturday, June 14, 2025
            </p>
          </div>
        </noscript>
        {children}
      </body>
    </html>
  );
}
