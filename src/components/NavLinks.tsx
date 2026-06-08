"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLink {
  name: string;
  path: string;
}

export default function NavLinks({ links }: { links: NavLink[] }) {
  const pathname = usePathname();

  return (
    <div className="flex items-center space-x-1 sm:space-x-4">
      {links.map((link) => {
        // Checks if the current path matches the link path
        const isActive = pathname === link.path;

        return (
          <Link
            key={link.name}
            href={link.path} 
            prefetch={false}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-palette-cream text-palette-maroon font-semibold'
                : 'text-palette-brown hover:text-palette-maroon hover:bg-palette-cream'
            }`}
          >
            {link.name}
          </Link>
        );
      })}
    </div>
  );
}
