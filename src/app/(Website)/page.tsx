import { client } from "@/sanity/lib/client";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { FaStar } from "react-icons/fa6";
import Button from '@/components/Button';
import Whatsapp from "@/components/Whatsapp";
import Call from "@/components/Call";
import { Custommade } from "@/components/Custommade";
import Link from 'next/link';
import { SlBadge } from "react-icons/sl";
import { MdVerified } from "react-icons/md";
import { ProductItem } from "@/app/(Website)/products/page";

import ProductGridClient from "@/components/ProductGridClient";
import CountdownTimer from "@/components/CountdownTimer";
import FAQPage from "@/components/Faq";
import { SITE_NAME, SITE_URL, createSeoMetadata,} from "@/lib/seo";
import sitemap from "../sitemap";

export const metadata = createSeoMetadata({
  title: "Custom Made Furniture",
  description:
    "Design custom sofas, wardrobes, dining tables, beds, chairs, and modular furniture built to match your room, style, and comfort.",
  path: "/",
});

const Offer_Query = `*[_type == "offer" && validity][0]{heading,percent,image,deadline}`
const Web_Query = `*[_type == "details"]|order(_createdAt asc)[0]{businessname,businesslogo}`
const Post_Query = `*[_type == "post"]|order(_createdAt desc)[0...4]{mainImage,category,}`
const Hero_Query = `*[_type == "hero"]|order(_createdAt asc)[0]{
  heroimage,
  ctaDesc,
  ctaname,
  ctawidth,
  ctaheight,
  "ctacolor": ctacolor.hex,
  "ctabgcolor": ctabgcolor.hex,
  prodDesc,
  prodname,
  prodwidth,
  prodheight,
  "prodcolor": prodcolor.hex,
  "prodbgcolor": prodbgcolor.hex
}`
const Review_Query = `*[_type == "review"]|order(_updatedAt desc){image,name}`

export async function getAllProducts(): Promise<ProductItem[]> {
  const query = `*[_type == "product"] {
    _id,
    title,
    "slug": slug.current,
    "gallery": gallery[]{
      "assetId": asset->_id,
      "url": asset->url,
      crop,
      hotspot
    },
    price,
    category,
    shortdescription,
    description,
    furnitureSpecs
  }`;
  return await client.fetch(query);
}

export const revalidate = 0; 

export default async function IndexPage() {
  const web = await client.fetch(Web_Query);
  const hero = await client.fetch(Hero_Query);
  const heroImage = hero?.heroimage ? urlFor(hero.heroimage).width(1920).height(1080).auto('format').quality(75).dpr(2).url() : null;
  const post = await client.fetch(Post_Query);
  const offer = await client.fetch(Offer_Query);
  const review = await client.fetch(Review_Query);
  const products = await getAllProducts();

  return (
    <main className="w-full overflow-x-hidden mt-10">
      
      <script
        id="home-graph-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ 
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                "@id": SITE_URL + "/#website",
                "url": SITE_URL,
                "name": web?.businessname || SITE_NAME,
                "description": "Design custom sofas, wardrobes, dining tables, beds, and modular furniture built to match your room style.",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": `${SITE_URL}/search?q={search_term_string}`
                  },
                  "query-input": "required name=search_term_string"
                }
              },
              {
                "@type": "ItemList",
                "@id": `${SITE_URL}#featured-catalog`,
                "name": "Featured Luxury Custom Furniture Collection",
                "url": SITE_URL,
                "numberOfItems": Math.min(products.length, 6),
                "itemListElement": products.slice(0, 6).map((product, index) => {
                  const primaryImage = product.gallery && product.gallery.length > 0 && product.gallery[0]?.url
                    ? product.gallery[0].url 
                    : "https://vercel.appfallback-product.jpg";

                  return {
                    "@type": "ListItem",
                    "position": index + 1,
                    "item": {
                      "@type": "Product",
                      "name": product.title,
                      "description": product.shortdescription || product.description,
                      "url": `${SITE_URL}/products/${product.slug}`,
                      "image": [primaryImage],
                      "sku": `CMF-FEAT-${product._id.substring(0, 6).toUpperCase()}`,
                      "brand": {
                        "@type": "Brand",
                        "name": SITE_NAME
                      },
                      "offers": {
                        "@type": "Offer",
                        "url": `${SITE_URL}/products/${product.slug}`,
                        "priceCurrency": "INR",
                        "price": product.price || 0,
                        // Placed explicitly with fixed trailing paths:
                        "availability": "https://schema.org",
                        "itemCondition": "https://schema.org"
                      }
                    }
                  };
                })
              }
            ]
          }) 
        }}
      />
      {/* Hero Section */}
      <section className="relative w-screen h-[90vh] sm:h-screen  overflow-hidden bg-zinc-100">
        {heroImage && (
          <Image
            src={heroImage}
            width={1920}
            height={1080}
            unoptimized
            alt={web?.businessname || "Hero Banner"}
            className="w-full h-full object-cover object-top "
            loading='eager'
            fetchPriority="high"
          />
        )}
        
        {/* Star Rating Badge */}
        <div className="absolute top-7 left-4 sm:top-8 sm:left-10 md:left-20">
          <h1 className="flex items-center bg-white/40 backdrop-blur-md rounded-xl border-palette-beige border-2 text-palette-brown p-2 sm:p-4 text-xl sm:text-3xl font-black font-[Poppins] tracking-tighter">
            4.8+<FaStar className="text-yellow-400 text-2xl sm:text-4xl ml-1" aria-label="Star rating" />
          </h1>
        </div>
        
        {/* Dynamic CTA Cards Container */}
        <div className="absolute inset-x-0 bottom-6 sm:bottom-12 max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-end justify-between pointer-events-none">
          {/* Card 1 */}
          <div className="w-full sm:max-w-sm md:w-90 bg-white/60 backdrop-blur-md rounded-xl border-palette-beige border-2 p-4 flex flex-col justify-between gap-4 pointer-events-auto shadow-md">
            <h2 className="text-palette-brown text-base sm:text-lg font-semibold font-[Poppins]">{hero?.ctaDesc}</h2>
            <div className="self-end">
              <Button name={hero?.ctaname} width={hero?.ctawidth} height={hero?.ctaheight} color={hero?.ctacolor} bgcolor={hero?.ctabgcolor} link='/contact' />
            </div>
          </div>

          {/* Card 2 */}
          <div className="w-full sm:max-w-sm md:w-80 bg-white/60 backdrop-blur-md rounded-xl border-palette-beige border-2 p-4 flex flex-col justify-between gap-4 md:justify-self-end pointer-events-auto shadow-md">
            <h2 className="text-palette-brown font-bold text-base sm:text-lg font-[Poppins]">{hero?.prodDesc}</h2>
            <div className="self-end">
              <Button name={hero?.prodname} width={hero?.prodwidth} height={hero?.prodheight} color={hero?.prodcolor} bgcolor={hero?.prodbgcolor} link='/products' />
            </div>
          </div>
        </div>
      </section>

      {/* Custom Made Sliding */}
      <section className="w-full">
        <Custommade/>
      </section>

      {/* Posts Section */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 sm:py-12">
        <h2 className="text-palette-brown text-2xl sm:text-3xl font-bold mb-6">Visit our Posts</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {post?.map((post: { mainImage: string; category: string }, index: number) => (
            <div 
              key={post.category || index} 
              className="rounded-lg w-full border-2 p-2 sm:p-3 border-palette-beige hover:border-palette-brown flex flex-col items-center gap-3 transition-colors duration-300 bg-white"
            >
              <Link className="w-full aspect-square block relative overflow-hidden rounded-md" href="/blog" aria-label={`Read our latest blog post in category ${post.category}`}>
                <Image 
                  src={post?.mainImage ? urlFor(post.mainImage).auto('format').quality(50).url() : '/loading.gif'} 
                  unoptimized 
                  alt={post.category || "Post thumbnail"} 
                  width={200}
                  height={200}
                  className="object-cover transition-transform duration-300 hover:scale-105 w-full h-full"
                />
              </Link>
              <p className="font-semibold text-palette-brown text-center text-sm sm:text-base line-clamp-1">{post.category}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Offers and Products Base Wrapper */}
      <section className="bg-[#F3E5D8] py-8 sm:py-12 w-full">
        {/* Banner Section */}
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="text-palette-brown text-2xl sm:text-3xl font-bold mb-6 flex gap-2 justify-center items-center">
            <MdVerified className="text-green-700 shrink-0" aria-label="Verified badge"/>
            <span className="text-center">{offer?.heading}</span>
          </h2>
          
          <div className="relative w-full rounded-xl overflow-hidden shadow-md bg-zinc-200">
            <Image 
              src={offer?.image ? urlFor(offer.image).auto('format').quality(75).url() : '/loading.gif'} 
              alt={offer?.heading || "Special Offer"} 
              width={1920} 
              height={540} 
              unoptimized 
              className="w-full h-auto object-cover min-h-[200px]"
            />
            {/* Discount Badge */}
            <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 flex justify-center items-center">
              <SlBadge className="text-6xl sm:text-8xl fill-black drop-shadow-sm z-1" aria-label="Discount badge"/>
              <p className="text-2xl sm:text-4xl font-[Story-script] relative -top-2 -left-12 sm:-top-4 sm:-left-19 text-black font-black bg-green-500 rounded-full px-1.5 py-0.5 sm:p-2.5 shadow-inner z-0">
                {offer?.percent}
              </p>           
            </div>

            <div className="absolute top-53 left-0 w-full">
            <CountdownTimer deadline={offer?.deadline} />
          </div>
          </div>
        
        </div>

        {/* Dynamic Products Showcase Integration */}
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 mt-10 sm:mt-14">
          <h2 className="text-palette-brown text-2xl sm:text-3xl font-bold mb-6">See What we made</h2>
          <ProductGridClient initialProducts={products} />
        </div>
      </section>

      {/* Reviews Section */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-8 py-10 sm:py-14">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h2 className="text-palette-brown text-2xl sm:text-3xl font-bold">Customer thoughts</h2>
          <div>
            <Button name={'Review us'} width={120} height={35} color={'#4C1A17'} bgcolor={'#D4BEA9'} link='/contact' />
          </div>
        </div>
        
        {/* Responsive Scrolling Reviews Row */}
        <div className="flex w-full overflow-x-auto pb-4 scrollbar-none gap-4 scroll-smooth snap-x snap-mandatory">
          {review?.map((item: { image: string; name: string }, index: number) => (
            <div 
              className="w-[80vw] sm:w-[calc((100%-1rem)/2)] md:w-[calc((100%-2rem)/3)] shrink-0 snap-start" 
              key={item.name || index}
            >
              <div className="overflow-hidden rounded-xl border-2 border-palette-cream shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
                <div className="relative w-full aspect-square">
                  <Image 
                    src={item?.image ? urlFor(item.image).auto('format').dpr(2).quality(75).url() : '/loading.gif'} 
                    alt={item.name || "Customer review illustration"} 
                    width={200}
                    height={200}
                    className=" w-full h-fullobject-cover object-left transform hover:scale-105 transition-transform duration-300" 
                    loading="eager" 
                    unoptimized
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* Faqs */}
      <section>
        <FAQPage />
      </section>
      {/* Gmap */}
      <section >
        <h2 className="text-md sm:text-2xl text-palette-brown max-w-7xl mx-auto my-4 font-bold">Locate us</h2>
        <div className="max-w-7xl  mx-auto my-4">
        <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1943.2487051524326!2d80.2164038!3d13.0676314!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a52616a744502b5%3A0x1e84faf419f38c6b!2sCustom%20Made%20Furniture%20-%20C%20M%20F!5e0!3m2!1sen!2sin!4v1780063124583!5m2!1sen!2sin" rel="preconnect" width="600" height="450"  loading="lazy" className="w-full rounded-lg border-palette-cream border-2" title="Location of Custom Made Furniture Choolamedu"></iframe>
        </div>
      </section>
      {/* Dynamic Persistent Utilities Component Calls  */}
      <Whatsapp/>
      <Call/>
    </main>
  );
}
