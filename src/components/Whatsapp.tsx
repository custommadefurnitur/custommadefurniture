import Link from 'next/link'; 
import {client} from '@/sanity/lib/client'
import { ImWhatsapp } from 'react-icons/im'; 

const Details_Query = `*[_type == "details"] | order(_createdAt desc)[0] {
  whatsapp
}`;
const Whatsapp =async () => { 
  const phoneNumber =await client.fetch(Details_Query).then((details) => details?.whatsapp || '');
  const message = "Hey, I'm interested to make furniture, shall we talk about that."; 
  
  return ( 
    <div className="fixed bottom-18 right-8 z-9999"> 
      {/* Injecting the local CSS animation block */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes custom-whatsapp-pulse {
          0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7); }
          70% { box-shadow: 0 0 0 12px rgba(37, 211, 102, 0); }
          100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
        }
        .wa-pulse-effect {
          animation: custom-whatsapp-pulse 2s infinite;
        }
      `}} />

      <Link 
      prefetch={false}
        href={`https://wa.me/91${phoneNumber}?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="wa-pulse-effect flex items-center justify-center w-12 h-12 bg-[#25D366] text-white rounded-full shadow-lg transition-transform duration-300 hover:scale-110 hover:bg-[#128C7E]"
      > 
        <ImWhatsapp className="text-3xl" />
      </Link> 
    </div> 
  ); 
};

export default Whatsapp;
