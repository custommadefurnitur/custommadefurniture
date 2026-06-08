import Image from "next/image";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { createSeoMetadata } from "@/lib/seo";
import type { SanityImageSource } from "@sanity/image-url";


// GROQ query combining both business details and worker products arrays
const ABOUT_DATA_QUERY = `{
  "details": *[_type == "details"]|order(_createdAt asc)[0]{
    businessname,
    businesslogo,
    mission,
    about,
    address,
    phone,
    email,
    whatsapp,
    timing
  },
  "team": *[_type == "team"]|order(_createdAt asc){
    name,
    role,
    image
  }
}`;

interface BusinessDetails {
  businessname: string;
  businesslogo: string;
  mission: string;
  about: string;
  address: string;
  phone: number[];
  email: string;
  whatsapp: number;
  timing: string[];
}

interface TeamMember {
  name: string;
  role: string;
  image: SanityImageSource;
}

interface SanityPayload {
  details: BusinessDetails;
  team: TeamMember[];
}

export const metadata = createSeoMetadata({
  title: "About Custom Made Furniture",
  description:
    "Learn about Custom Made Furniture, our design studio, craftsmanship, team, showroom details, and mission for made-to-measure furniture.",
  path: "/about",
});

export default async function AboutPage() {
  const { details, team }: SanityPayload = await client.fetch(ABOUT_DATA_QUERY, {}, { next: { revalidate: 60 } });

  if (!details) {
    return (
      <div className="text-center py-20 text-[#4C1A17] bg-[#F3E5D8] min-h-screen">
        No business profile content published yet.
      </div>
    );
  }

  return (
    <div className="bg-[#F3E5D8] text-[#4C1A17] min-h-screen py-12 px-4 md:px-8 mt-10">
      <div className="max-w-4xl mx-auto flex flex-col gap-16">
        
        {/* Page Main Header */}
        <h1 className="text-center text-3xl font-bold tracking-tight text-[#4C1A17]">About</h1>

        {/* SECTION 1: HERO BLOCK (Logo & Philosophy Mapping) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#D4BEA9]/30 p-6 rounded-lg border border-[#D4BEA9]">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-[#700635]">{details.businessname}</h2>
            <p className="text-sm font-medium italic leading-relaxed text-[#4C1A17]/90">
              &ldquo;{details.mission}&rdquo;
            </p>
          </div>
          <div className="relative aspect-[4/3] w-full border-4 border-[#4C1A17] bg-[#D4BEA9] rounded overflow-hidden">
            {details.businesslogo && (
              <Image 
                src={urlFor(details.businesslogo).url()} 
                width={200} 
                height={200}
                alt={`${details.businessname} Logo`} 
                className="object-cover w-full h-auto "
                unoptimized
                
                rel="noreferrer noopener"
              />
            )}
          </div>
        </section>


        {/* SECTION 2: WIDE BANNER PANEL (Main Business Story Block) */}
        <section className="w-full bg-[#700635] text-[#F3E5D8] p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-3 border-b border-[#D4BEA9] pb-2">Who we are? </h2>
          <p className="text-sm leading-relaxed text-[#F3E5D8]/90 whitespace-pre-line">{details.about}</p>
        </section>


        {/* SECTION 3: TEAM / WORKER CARDS ROW (Iterates Product Entries) */}
        <section className="flex flex-col items-center gap-6">
          <div className="bg-[#4C1A17] text-[#F3E5D8] px-6 py-2 rounded font-semibold text-sm tracking-wide uppercase">
            Meet Our Team
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            {team && team.slice(0, 3).map((member, idx) => (
              <div key={idx} className="bg-[#D4BEA9] p-4 rounded-lg border border-[#F3E5D8] flex flex-col items-center gap-3 shadow-sm text-center">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#4C1A17] bg-[#F3E5D8]">
                  {member.image && (
                    <Image
                      src={urlFor(member.image).url()}
                      width={200} 
                      height={200}
                      alt={member.name}
                      unoptimized
                      className="object-cover w-full h-auto"
                    />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-[#700635] text-base">{member.name}</h3>
                  <p className="text-xs text-[#4C1A17]/80 font-medium">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* SECTION 4: SPLIT GRID BLOCK (Logo Left, Address Summary Right) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Location */}
          <div className="md:col-span-1 border-2 border-[#4C1A17] rounded-lg overflow-hidden bg-[#D4BEA9] flex flex-col">
            <div className="relative aspect-3/4 w-full bg-[#F3E5D8]">
              <div className="max-w-7xl  mx-auto my-4">
                <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1943.2487051524326!2d80.2164038!3d13.0676314!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a52616a744502b5%3A0x1e84faf419f38c6b!2sCustom%20Made%20Furniture%20-%20C%20M%20F!5e0!3m2!1sen!2sin!4v1780063124583!5m2!1sen!2sin" width="400" height="350"  loading="lazy" className="w-full rounded-lg border-palette-cream border-2"></iframe>
              </div>
            </div>
            <div className="p-3 text-center bg-[#4C1A17] text-[#F3E5D8] font-semibold text-xs tracking-wider uppercase">
              We are here
            </div>
          </div>
          {/* Location Content Block */}
          <div className="md:col-span-2 bg-[#D4BEA9]/50 p-6 rounded-lg border border-[#D4BEA9] h-full flex flex-col justify-center">
            <h3 className="text-xl font-bold text-[#700635] mb-4">Location & Headquarters</h3>
            <p className="text-sm leading-relaxed text-[#4C1A17]/90 whitespace-pre-line bg-[#F3E5D8] p-4 rounded border border-[#D4BEA9]">
              {details.address}
            </p>
          </div>
        </section>


        {/* SECTION 5: CONTACT & OPERATIONAL HOURS SUMMARY */}
        <section className="bg-[#4C1A17] text-[#F3E5D8] p-6 rounded-lg flex flex-col gap-4 shadow-inner">
          <div className="inline-block bg-[#700635] text-[#F3E5D8] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded self-start">
            Business Registry & Hours
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Channel: Phone, WhatsApp and Email endpoints */}
            <div className="flex flex-col gap-2">
              <div className="bg-[#F3E5D8] text-[#4C1A17] px-4 py-2 rounded text-xs">
                <span className="font-bold block text-[#700635] mb-0.5">Email Channels:</span>
                {details.email}
              </div>
              <div className="bg-[#F3E5D8] text-[#4C1A17] px-4 py-2 rounded text-xs">
                <span className="font-bold block text-[#700635] mb-0.5">Primary WhatsApp:</span>
                +91{details.whatsapp}
              </div>
              {details.phone && details.phone.length > 0 && (
                <div className="bg-[#F3E5D8] text-[#4C1A17] px-4 py-2 rounded text-xs">
                  <span className="font-bold block text-[#700635] mb-0.5">Direct Helplines:</span>
                  +91{details.phone.join(" / ")}
                </div>
              )}
            </div>

            {/* Right Channel: Timings Array Row Block */}
            <div className="flex flex-col gap-2">
              {details.timing && details.timing.map((timeRow, idx) => (
                <div key={idx} className="bg-[#F3E5D8] text-[#4C1A17] px-4 py-2.5 rounded font-mono text-xs border-l-4 border-[#700635] shadow-xs">
                  {timeRow}
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
