import { client } from "@/sanity/lib/client";

const Customisables_Query = `*[_type == "customisables"]|order(_createdAt desc){name,description}`;

export const Custommade = async () => {
  const lists = await client.fetch(Customisables_Query);
  // Duplicate the list array once so the layout loops flawlessly without blank space
  const infiniteLists = [...lists, ...lists];

  return (
    <>
      {/* Responsive Section Heading Layout */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
        <h2 className="text-palette-brown text-2xl sm:text-3xl font-bold my-6 sm:my-8 text-left">
          Just Customise everything you need
        </h2>
      </div>
      
      <hr className="border-t-palette-beige" />
      
      {/* Marquee Wrapper with Tailwind Fade Effects */}
      <div className="relative w-full overflow-hidden bg-white/20 py-4 sm:py-6">
        
        {/* Left Edge Overlay (Fades out text dynamically) */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 md:w-32 bg-gradient-to-r from-[#FFF5EB] to-transparent z-10 pointer-events-none" />
        
        {/* Right Edge Overlay (Fades out text dynamically) */}
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 md:w-32 bg-gradient-to-l from-[#FFF5EB] to-transparent z-10 pointer-events-none" />

        <div className="slider-container">
          {/* 1. Scoped CSS for the infinite loop animation */}
          <style>{`
            .slider-container {
              overflow: hidden;
              width: 100%;  
              display: flex;
            }
            .slider {
              display: flex;
              gap: 2.5rem;
            }
            @media (min-width: 640px) {
              .slider {
                gap: 5rem;
              }
            }
            /* Double track animation logic to prevent empty space breaks */
            .slider-track {
              display: flex;
              gap: 2.5rem;
              animation: loop-scroll 30s linear infinite;
            }
            @media (min-width: 640px) {
              .slider-track {
                gap: 5rem;
                animation-duration: 25s;
              }
            }
            .slider-item {
              flex-shrink: 0;
            }
            @keyframes loop-scroll {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-100%);
              }
            }
            .slider-container:hover .slider-track {    
              cursor: pointer;
              animation-play-state: paused;
            }
          `}</style>

          {/* 2. Double Track Architecture to ensure flawless seamless scrolling */}
          <div className="slider">
            {/* Track 1 */}
            <div className="slider-track">
              {lists.map((list: { name: string }, index: number) => (
                <div key={`track1-${index}`} className="slider-item">
                  <p className="font-black font-[Story-Script] text-2xl sm:text-4xl md:text-5xl text-palette-brown/70 whitespace-nowrap">
                    {list.name}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Track 2 */}
            <div className="slider-track" aria-hidden="true">
              {lists.map((list: { name: string }, index: number) => (
                <div key={`track2-${index}`} className="slider-item">
                  <p className="font-black font-[Story-Script] text-2xl sm:text-4xl md:text-5xl text-palette-brown/70 whitespace-nowrap">
                    {list.name}
                  </p>
                </div>
              ))}
            </div> 
          </div> 
        </div>
      </div>
      
      <hr className="border-t-palette-beige" />
    </>
  );
};
