// src/app/contact/page.tsx
import {client} from '@/sanity/lib/client';
import ContactForm from "@/components/ContactForm";
import Link from 'next/link';
import { createSeoMetadata } from '@/lib/seo';

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
  address
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
  return (
    <main className="w-full min-h-screen bg-[#F3E5D8]/30 pb-20 pt-10 font-[Poppins] mt-12">
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
                    <Link href={`tel:+91${details.phone}`} className="hover:underline font-medium">{details.phone}</Link>
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
                    <Link key={index} href={link.url} className="text-base text-palette-brown hover:underline" target="_blank" rel="noopener noreferrer">
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
