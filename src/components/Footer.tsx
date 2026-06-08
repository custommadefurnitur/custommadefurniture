import { client } from '@/sanity/lib/client';
import Link from 'next/link';

// Fixed GROQ syntax error on phone field
const Details_Query = `*[_type == "details"] | order(_createdAt desc)[0] {
  businessname,
  mission,
  phone,
  whatsapp,
  address
}`;

const Link_Query = `*[_type == "navlinks"] | order(order asc) {
  name,
  path
}`;

const Social_Query = `*[_type == "sociallinks"] | order(order asc) {
  name,
  url,
  icon
}`;

interface NavLink {
  name: string;
  path: string;
}

interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

interface BusinessDetails {
  businessname: string;
  mission: string;
  phone: string;
  whatsapp: string;
  address: string;
}

export const Footer = async () => {
  // Fetch data with proper fallback formatting
  const details: BusinessDetails = await client.fetch(Details_Query) || {};
  const links: NavLink[] = await client.fetch(Link_Query) || [];
  const social: SocialLink[] = await client.fetch(Social_Query) || [];

  return (
    <footer className="bg-palette-beige p-6 md:p-12 w-full">
      {/* Top Section */}
      <div className="mb-8">
        <h2 className="text-2xl text-palette-brown font-black">{details.businessname}</h2>
        <p className="text-sm text-slate-900/40 font-semibold">All Copyrights are claimed</p>
      </div>

      {/* Grid Layout Fix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full border-t border-palette-brown/20 pt-6">
        {/* Contact info span 2 columns on desktop */}
        <div className="flex flex-col gap-2 md:col-span-2">
          <h3 className="text-palette-brown font-semibold italic">"{details.mission}"</h3>
          <h4 className="text-sm">
            Call me:{' '}
            <Link href={`tel:+91${details.phone}`} className="hover:underline font-medium">
              {details.phone}
            </Link>
          </h4>
          <h4 className="text-sm">
            Text me:{' '}
            <Link href={`https://wa.me/91${details.whatsapp}`} className="hover:underline font-medium" target="_blank" rel="noopener noreferrer">
              +91{details.whatsapp}
            </Link>
          </h4>
          <h5 className="text-sm font-bold mt-2">Address:</h5>
          <p className="text-sm text-slate-700 whitespace-pre-line">+91{details.address}</p>
        </div>

        {/* Social Links */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xl text-palette-maroon font-bold tracking-tight mb-2">Social Links</h2>
          <div className="flex flex-col gap-1">
            {social.map((link: SocialLink, index: number) => (
              <Link key={index} href={link.url} className="text-base text-slate-700 font-semibold hover:underline" target="_blank" rel="noopener noreferrer">
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xl text-palette-maroon font-bold tracking-tight mb-2">Navigation Links</h2>
          <div className="flex flex-col gap-1">
            {links.map((link: NavLink, index: number) => (
              <Link key={index} href={link.path} className="text-base text-slate-700 font-semibold hover:underline">
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Creator Info Fix */}
      <div className="mt-8 pt-4 border-t border-palette-brown/10 text-center text-xs text-gray-500">
        <p>
          This is created by ritish :{' '}
          <Link href="https://ritish-fortiscerebrox.vercel.app/" className="text-blue-700 font-semibold hover:underline" aria-label="Visit developer portfolio of Ritish">
            Visit Portfolio
          </Link>
        </p>
      </div>
    </footer>
  );
};
