import {client} from '@/sanity/lib/client';
import ContactForm from "@/components/ContactForm";
import Link from 'next/link';
import { SITE_NAME, SITE_URL, createSeoMetadata } from '@/lib/seo';

export const metadata = createSeoMetadata({
  title: "Contact Custom Made Furniture",
  description:
    "Contact Custom Made Furniture to discuss custom furniture dimensions, materials, finishes, showroom visits, and design consultations.",
  path: "/contact",
});

const Details_Query = `*[_type == "details"] | order(_createdAt desc)[0] {
  businessname,
  mission,
  phone,
  whatsapp,
  address,
  timing
}`;

const Social_Query = `*[_type == "sociallinks"] | order(order asc) {
  name,
  url,
  icon
}`;

interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

export default async function ContactPage() {
  const details = await client.fetch(Details_Query);
  const social: SocialLink[] = await client.fetch(Social_Query) || [];

  // Fallback structural parsing parameters 
  const businessPhones = details?.phone && details.phone.length > 0 
    ? details.phone.map((p: number) => `+91-${p}`) 
    : ["+91-98404-28881"];

  // 2. Generate unified ContactPage schema graph payload
  const contactPageJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": `${SITE_URL}/contact/#webpage`,
        "url": `${SITE_URL}/contact`,
        "name": `Contact Support & Showroom | ${details?.businessname || SITE_NAME}`,
        "description": "Contact our Chennai design studio to discuss custom furniture dimensions, materials, finishes, and showroom visits."
      },
      {
        "@type": "FurnitureStore",
        "@id": `${SITE_URL}/#organization`, // Links directly back to your global organization graph 
        "name": details?.businessname || SITE_NAME,
        "url": SITE_URL,
        "telephone": businessPhones[0],
        "sameAs": social.map((link) => link.url), // Injects live Sanity social profile array links to build trust
        "address": {
          "@type": "PostalAddress",
          "streetAddress": details?.address || "94, Jai Nagar 3rd St, Kamarajar Nagar, Gill Nagar",
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
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": businessPhones[0],
          "contactType": "customer service",
          "areaServed": "IN",
          "availableLanguage": ["en", "ta"]
        },
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "opens": "09:00",
            "closes": "20:00"
          }
        ]
      }
    ]
  };

  return (
    <main className="w-full min-h-screen bg-[#F3E5D8]/30 pb-20 pt-10 font-[Poppins] mt-12">
      <script
        id="contact-page-graph-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageJsonLd) }}
      />
      <div className="w-full max-w-[1140px] mx-auto px-4 sm:px-6">
        
        {/* Page Top Header Node */}
        <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs uppercase tracking-widest font-black text-[#700635] bg-[#F3E5D8] px-3 py-1 rounded-md">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#4C1A17] tracking-tight mt-3">
            Contact Our Design Studio
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-[Inter] mt-2">
            Have custom furniture dimensions or structural layouts to configure? Connect with our master craftsman directly.
          </p>
        </div>

        {/* Responsive Layout Grid Core Container */}
        {/* grid-cols-1 on mobile collapses views, lg:grid-cols-12 spreads components out onto side-by-side cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUMN 1: Studio Info Details & Social Medias */}
          <div className="lg:col-span-5 flex flex-col gap-6 w-full">
            
            {/* Box: Structural Studio Data Metrics */}
            <div className="bg-white border border-[#D4BEA9] p-6 rounded-2xl shadow-sm flex flex-col gap-5">
              <h3 className="text-lg font-bold text-[#4C1A17] border-b border-[#F3E5D8] pb-2">
                Studio Details
              </h3>
              
              {/* Address detail layout row */}
              <div className="flex gap-3 items-start">
                <span className="text-xl bg-[#F3E5D8] p-2 rounded-xl text-[#700635] leading-none">📍</span>
                <div>
                  <h4 className="text-xs font-bold text-[#4C1A17] uppercase tracking-wider">Showroom Workspace</h4>
                  <p className="text-xs sm:text-sm text-gray-600 font-[Inter] mt-0.5">{details.address}</p>
                </div>
              </div>

              {/* Phone detail layout row */}
              <div className="flex gap-3 items-start">
                <span className="text-xl bg-[#F3E5D8] p-2 rounded-xl text-[#700635] leading-none">📞</span>
                <div>
                  <h4 className="text-xs font-bold text-[#4C1A17] uppercase tracking-wider">Direct Hotline</h4>
                  <p className="text-xs sm:text-sm text-gray-600 font-[Inter] mt-0.5">Call me:{' '}
                    <Link href={`tel:+91${details.phone}`} className="hover:underline font-medium" aria-label='Call to Action'>{details.phone}</Link>
                  </p>
                </div>
              </div>

              {/* Working hours detail layout row */}
              <div className="flex gap-3 items-start">
                <span className="text-xl bg-[#F3E5D8] p-2 rounded-xl text-[#700635] leading-none">⏳</span>
                <div>
                  <h4 className="text-xs font-bold text-[#4C1A17] uppercase tracking-wider">Studio Office Hours</h4>
                  <p className="text-xs sm:text-sm text-gray-600 font-[Inter] mt-0.5">Monday – Friday: 09:00 AM – 06:00 PM</p>
                </div>
              </div>
            </div>

            {/* Box: Integrated Media Reach Channels */}
            <div className="bg-white border border-[#D4BEA9] p-6 rounded-2xl shadow-sm">
              <h3 className="text-base font-bold text-[#4C1A17] mb-4">Connect on Social Channels</h3>
              
              {/* Flexbox layout wraps beautifully across compact handheld viewports */}
              <div className="flex flex-wrap gap-3 font-[Inter] text-xs font-semibold">
                <div className="flex flex-col gap-1">
                  {social.map((link: SocialLink, index: number) => (
                    <Link key={index} href={link.url} className="text-base text-palette-brown hover:underline" target="_blank" rel="noopener noreferrer" aria-label={`Visit our ${link.name} page`}>
                    {link.name}
                    </Link>
              ))}
          </div>
              </div>
            </div>

          </div>

          {/* COLUMN 2: The Reusable Contact Form Anchor Block Component */}
          <div className="grid lg:col-span-7 w-full">
            <ContactForm />
          </div>

        </div>

      </div>
    </main>
  );
}
