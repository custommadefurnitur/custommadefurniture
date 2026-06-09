import type { Metadata } from "next";
import "./globals.css";
import { Viewport } from "next";
import { Inter, Poppins } from 'next/font/google';
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, createSeoMetadata } from "@/lib/seo";


const inter = Inter({
  subsets: ['latin'],
  display: "swap",
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  ...createSeoMetadata({
    title: SITE_NAME,
    description: "Custom Made Furniture creates luxury made-to-measure furniture.",
    path: "/",
    image: DEFAULT_OG_IMAGE,
  }),
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FurnitureStore",
    "name": "CMF - Custom Made Furnz",
    "image": `${SITE_URL}${DEFAULT_OG_IMAGE}`, 
    "telephone": "+91-98404-28881",
    "url": SITE_URL, 
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "94, Jai Nagar 3rd St, Kamarajar Nagar, Gill Nagar",
      "addressLocality": "Choolaimedu, Chennai",
      "addressRegion": "Tamil Nadu",
      "postalCode": "600094",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "13.064158",
      "longitude": "80.223561"
    },
    "priceRange": "₹₹",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "09:00",
        "closes": "20:00"
      }
    ]
  };

  return (
    <html lang="en"> 
      {/* Both font variables are safely injected globally at the HTML root */}
      <body className={`${inter.variable} ${poppins.variable}`}>
        {children}

        <script
        id="furniture-store-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      </body>
    </html>
  );
}
