import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import Image from 'next/image';
import { auth } from '@/auth'; // Imported your NextAuth instance

import NavLinks from './NavLinks'; 
import NavContainer from './NavContainer'; 
import Menu from './Menu';
import Sidebar from './Sidebar';

interface NavLink {
  name: string;
  path: string;
}

export default async function Navbar() {
  // 1. Resolve auth session server-side safely before layout compilation
  const session = await auth();
  const user = session?.user;

  const Web_Query = `*[_type == "details"]|order(_createdAt asc)[0]{businessname,businesslogo}`;
  const Link_query = `*[_type == "navlinks"]|order(order asc){name,path}`;
  
  // 2. Resolve CMS database queries
  const sanityLinks: NavLink[] = await client.fetch(Link_query);
  const navbar = await client.fetch(Web_Query);
  
  // Create a mutable duplicate array to insert our conditional authentication routes
  const combinedLinks = [...sanityLinks];

  // 3. Conditional Injection: Check session authorization flags
  if (user) {
    // A. Append unique user workspace path block
    combinedLinks.push({ name: 'Account', path: '/dashboard' });

    // B. Append admin panel block ONLY if permission equals "admin"
    if (user.role === 'admin') {
      combinedLinks.push({ name: 'Admin Hub', path: '/admin' });
    }
  }
 if(!user){
  combinedLinks.push({name:'Login', path:'/login'})
 }
  const logoUrl = navbar?.businesslogo 
    ? urlFor(navbar.businesslogo)?.width(32).height(32).dpr(2).url() 
    : null;

  return (
    <NavContainer>
      {/* Brand Logo & Name Area */}
      <div className="flex items-center space-x-1 xs:space-x-3">
        {logoUrl && (
          <Image
            src={logoUrl}
            alt="logo"
            width={32}
            height={32}
            className="rounded-full w-35px h-35px sm:w-32px sm:h-32px"
            unoptimized
          />
        )}
        <h1 className="text-[clamp(1.2rem,5vw,1.5rem)] font-bold tracking-tight 2xs:tracking-tighter text-nowrap max-w-fit text-palette-brown sm:text-2xl">
          {navbar?.businessname}
        </h1>
      </div>

      {/* Navigation Links Area (Desktop) */}
      <nav className="hidden [@media(min-width:950px)]:flex items-center">
        <NavLinks links={combinedLinks} />
      </nav>

      {/* Mobile Sidebar Navigation Area */}
      <div className="flex [@media(min-width:950px)]:hidden">
         <Menu>
          {/* Note: Pass links parameter down to Sidebar if your mobile drawer iterates it */}
          <Sidebar />
        </Menu>
      </div>
    </NavContainer>
  );
}
