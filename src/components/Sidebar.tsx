import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import Image from 'next/image';
import SideLinks from './SideLinks'; // Fixed typo in import path filename
import Link from 'next/link';
import { auth } from '@/auth'; // Imported your NextAuth setup instance

interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

interface NavLink {
  name: string;
  path: string;
}

const Web_Query = `*[_type == "details"]|order(_createdAt asc)[0]{businessname,businesslogo}`;
const Link_Query = `*[_type == "navlinks"]|order(order asc){name,path}`;
const Social_Query = `*[_type == "sociallinks"]|order(order asc){name,url,icon}`;

export default async function Sidebar() {
  // 1. Resolve auth session state completely server-side
  const session = await auth();
  const user = session?.user;

  // 2. Fetch standard layout data maps from Sanity CMS
  const sanityLinks: NavLink[] = await client.fetch(Link_Query);
  const web = await client.fetch(Web_Query);
  const social = await client.fetch(Social_Query);

  // 3. Mutable duplicate container to inject auth route exceptions dynamically
  const combinedLinks = [...sanityLinks];

  if (user) {
    // Append your custom client-facing user workspace layout link
    combinedLinks.push({ name: 'Account', path: '/dashboard' });

    // Restrict Admin Console link block strictly to administrative authorization roles
    if (user.role === 'admin') {
      combinedLinks.push({ name: 'Admin Hub', path: '/admin' });
    }
  }

  const iconurl = (source: string) => {
    return source ? urlFor(source).height(30).width(30).auto('format').dpr(2).url() : '/loading.gif';
  };

  const homeicon = web?.businesslogo ? urlFor(web.businesslogo)?.width(100).height(100).auto('format').auto('format').quality(75).dpr(2).url() : null;

  return (
    <nav className="h-dvh min-w-[250px] w-[40vw] snap-start fixed top-0 left-0 px-4 z-999 bg-palette-beige border-palette-cream border-2 shadow-lg shadow-palette-beige">
      <div className='flex flex-col justify-center items-center'>
        {homeicon && (
          <Image 
            src={homeicon} 
            height={100} 
            width={100} 
            alt={`${web.businessname} Logo`} 
            unoptimized 
            loading="eager" 
            className='rounded-full m-4 mb-0'
          />
        )}
        <span className='text-nowrap max-[470]:hidden font-bold text-lg'>{web.businessname}</span>
      </div>
      
      {/* Target dynamic navigation mapping links inside your mobile client rows */}
      <nav className="flex items-center">
        <SideLinks links={combinedLinks} />
      </nav>

      <div className='flex justify-between mt-auto'> {/* Optional mt-auto pushes social block clean to bottom */}
        {social.map((link: SocialLink) => (
          <div key={link.name} className='flex flex-col items-center p-1 bg-palette-cream rounded '>
            <Link prefetch={false} href={link.url} aria-label={`Visit our ${link.name} page`}>
              <Image 
                src={iconurl(link.icon)} 
                width={30}  
                height={30} 
                alt={link.name} 
                className='rounded-full' 
                unoptimized
              />
            </Link>
          </div>
        ))}
      </div>
    </nav>
  );
}
