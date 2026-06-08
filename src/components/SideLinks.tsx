'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SideLink {
    name: string;
    path: string;
}

const SideLinks = ({ links }: { links: SideLink[] }) => {
    const pathname = usePathname();
    
    return (
    <div className="flex w-full flex-col items-start my-4 space-y-2">
      {links.map((link) => {
        // Checks if the current path matches the link path
        const isActive = pathname === link.path;

        return (
          <Link
            prefetch={false}
            key={link.name}
            href={link.path}
            className={`px-3 py-2.5 w-full rounded-lg text-base font-semibold transition-all duration-200 block ${
              isActive
                ? 'bg-palette-maroon text-palette-cream shadow-sm scale-[1.02]'
                : 'bg-palette-cream text-palette-brown hover:text-palette-maroon hover:bg-palette-cream/80'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span>{link.name}</span>
              {/* Optional clean visual anchor for active links */}
              {isActive && <span className="text-xs">➔</span>}
            </div>
          </Link>
        );
      })}
    </div>
    );
}

export default SideLinks;
