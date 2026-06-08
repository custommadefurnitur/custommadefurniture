import type { Metadata } from "next";
import "./globals.css";
import { Viewport } from "next";
import Navbar from "@/components/Navbar";
import { Inter, Poppins } from 'next/font/google';
import { Footer } from "@/components/Footer";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, createSeoMetadata } from "@/lib/seo";

const inter = Inter({
  subsets:['latin'],
  display:"swap",
  variable: "--font-inter",
})

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  ...createSeoMetadata({
    title: SITE_NAME,
    description:
      "Custom Made Furniture creates luxury made-to-measure furniture for homes, offices, restaurants, and interiors.",
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
export const viewport:Viewport= {
  width:'device-width',
  initialScale:1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en"> 
      <body className={`${inter.variable} ${poppins.variable}`}>
        <Navbar />
        <main className="font-[Poppins] ">
          {children}
        </main>
        <Footer/>
      </body>
    </html>
  );
}
