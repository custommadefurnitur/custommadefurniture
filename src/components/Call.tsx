import {client} from "@/sanity/lib/client";
import Link from 'next/link'; 
import { IoMdCall } from "react-icons/io";
const Details_Query = `*[_type == "details"] | order(_createdAt desc)[0] {
  phone
}`;
const Call = async() => { 
  const phoneNumber =await client.fetch(Details_Query).then((detail)=>detail.phone || "");
  
  return ( 
    <div className="fixed bottom-37 right-8 z-9999 block lg:hidden"> 
      {/* Injecting the local CSS animation block */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes custom-whatsapp-pulse {
          0% { box-shadow: 0 0 0 0 rgba(13, 71, 161, 0.7); }
          70% { box-shadow: 0 0 0 12px rgba(13, 71, 161, 0); }
          100% { box-shadow: 0 0 0 0 rgba(13, 71, 161, 0); }
        }
        .wa-pulse-effect {
          animation: custom-whatsapp-pulse 2s infinite;
        }
      `}} />

      <Link 
        href={`tel:+91${phoneNumber}`}
        target="_blank"
        prefetch={false}
        rel="noopener noreferrer"
        className="wa-pulse-effect flex items-center justify-center w-12 h-12 bg-[#0D47A1] text-white rounded-full shadow-lg transition-transform duration-300 hover:scale-110 hover:bg-[#128C7E]"
        aria-label="Call us directly"
      > 
        <IoMdCall className="text-3xl" />
      </Link> 
    </div> 
  ); 
};

export default Call;
