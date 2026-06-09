import { client } from "@/sanity/lib/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import ImageGallerySlider from "@/components/ImageGallerySlider";
import ProductActionControls from "@/components/ProductActionControls";
import WishlistButton from "@/components/WishlistButton";
import { Metadata } from "next";
import ReviewForm from "@/components/ReviewForm";
import { SITE_NAME, SITE_URL, createSeoMetadata, truncateMeta } from "@/lib/seo";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

interface MongoReview {
  _id: string;
  userId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

async function getProductData(slug: string) {
  const query = `{
    "product": *[_type == "product" && slug.current == $slug][0] {
      _id,
      title,
      "slug": slug.current,
      "gallery": gallery[]{
        "assetId": asset->_id,
        "url": asset->url
      },
      price,
      category,
      shortdescription,
      description,
      furnitureSpecs
    },
    "business": *[_type == "details"] | order(_createdAt desc)[0] {
      whatsapp,
      phone
    }
  }`;
  
  const sanityData = await client.fetch(query, { slug });

  let reviews: MongoReview[] = [];
  try {
    const isDev = process.env.NODE_ENV === "development";
    const baseUrl = isDev ? "http://localhost:3000" : (process.env.NEXT_PUBLIC_SITE_URL || "https://custommadefurniture.com");
    
    const res = await fetch(`${baseUrl}/api/reviews?productId=${slug}`, {
      next: { revalidate: 0 } 
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        reviews = json.data;
      }
    }
  } catch (error) {
    console.error("Failed to load reviews from API endpoint:", error);
  }

  return {
    product: sanityData.product,
    business: sanityData.business,
    reviews: reviews
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductData(slug);

  if (!data.product) return {};

  const { product } = data;
  const hasImage = product.gallery && product.gallery.length > 0;
  const imageUrl = hasImage ? product.gallery[0].url : undefined;

  return createSeoMetadata({
    title: product.title,
    description: product.shortdescription || product.description,
    path: `/products/${product.slug}`,
    image: imageUrl,
    type: "article",
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const data = await getProductData(slug);
  
  if (!data.product) {
    notFound();
  }

  const { product, business, reviews } = data;
  const whatsappNumber = business?.whatsapp || "";
  const phoneNumber = business?.phone || "";
  
  // Clean fallback mapping for gallery array loops
  const productImages = product.gallery && product.gallery.length > 0 
    ? product.gallery.map((img: { url: string }) => img.url)
    : [`${SITE_URL}/fallback-product.jpg`];

  // Calculate precision average rating safely
  const aggregateRatingValue = reviews.length
    ? (reviews.reduce((total, review) => total + review.rating, 0) / reviews.length).toFixed(1)
    : null;

  // 2. Production Ready Product Schema Payload
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "image": productImages,
    "description": truncateMeta(product.shortdescription || product.description),
    "category": product.category,
    "sku": `CMF-${product._id.substring(0, 6).toUpperCase()}`, // Added safe fallback SKU string to fix merchant listing warnings
    "brand": {
      "@type": "Brand",
      "name": SITE_NAME,
    },
    "offers": {
      "@type": "Offer",
      "url": `${SITE_URL}/products/${product.slug}`,
      "price": product.price || "0",
      "priceCurrency": "INR", // Changed from USD to INR to cleanly align with Chennai local map listings
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org",
      "priceValidUntil": "2027-12-31"
    },
    // Conditionally load MongoDB ratings loop array only if live reviews exist
    ...(aggregateRatingValue ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": aggregateRatingValue,
        "reviewCount": reviews.length,
        "bestRating": "5",
        "worstRating": "1"
      },
      "review": reviews.slice(0, 5).map((rev) => ({
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": rev.reviewerName || "Verified Buyer"
        },
        "datePublished": rev.createdAt ? new Date(rev.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        "reviewBody": rev.comment || "",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": rev.rating.toString(),
          "bestRating": "5",
          "worstRating": "1"
        }
      }))
    } : {})
  };

  return (
    <main className="min-h-screen bg-[#F3E5D8] text-[#4C1A17] py-12 px-4 sm:px-6 lg:px-8">
      {/* 3. Injected Structured Script Data Elements */}
      <script
        id={`product-schema-${product._id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <div className="max-w-6xl mx-auto">
        
        {/* BREADCRUMB */}
        <nav className="mb-8 text-sm font-medium tracking-wide">
          <Link href="/products" className="text-[#700635] hover:underline">
            Collection
          </Link>
          <span className="mx-2 text-[#D4BEA9]">/</span>
          <span className="text-[#4C1A17] opacity-80 capitalize">{product.category}</span>
          <span className="mx-2 text-[#D4BEA9]">/</span>
          <span className="text-[#4C1A17] font-semibold">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-8">
            <ImageGallerySlider gallery={product.gallery} title={product.title} />
            
            {/* REVIEWS RENDERING COMPONENT */}
            <div className="mt-4 border-t border-[#D4BEA9] pt-6">
              <h3 className="text-xl font-serif font-bold text-[#4C1A17] mb-4">
                Customer Reviews ({reviews.length})
              </h3>
              
              {reviews.length > 0 ? (
                <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2">
                  {reviews.map((review) => (
                    <div key={review._id} className="bg-white/40 border border-[#D4BEA9]/60 rounded-xl p-4 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-sm text-[#4C1A17]">
                          {review.reviewerName || "Anonymous"}
                        </span>
                        <span className="text-yellow-600 font-bold text-sm" aria-label={`${review.rating} out of 5 stars`}>
                          {"★".repeat(review.rating)}{"☆".repeat(Math.max(0, 5 - review.rating))}
                        </span>
                      </div>
                      <p className="text-sm text-[#4C1A17]/90 leading-relaxed italic">
                        &ldquo;{review.comment}&rdquo;
                      </p>
                      {review.createdAt && (
                        <span className="text-[10px] text-[#4C1A17]/50 block mt-2">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm italic text-[#4C1A17]/60 mb-6">
                  No reviews yet. Be the first to share your thoughts!
                </p>
              )}
            </div>

            <ReviewForm productId={slug}/>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <span className="inline-block bg-[#700635] text-[#F3E5D8] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  {product.category}
                </span>
                <WishlistButton itemType="product" slug={product.slug} />
              </div>

              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#4C1A17] mb-2">
                {product.title}
              </h1>

              <p className="text-2xl font-bold text-emerald-900 mb-6">
                ${product.price.toLocaleString()}
              </p>

              <div className="border-t border-[#D4BEA9] pt-6 mb-6">
                <h2 className="text-sm uppercase tracking-wider font-bold text-[#4C1A17]/80 mb-2">
                  Overview
                </h2>
                <p className="text-base leading-relaxed text-[#4C1A17] font-medium opacity-90 mb-4">
                  {product.shortdescription}
                </p>
                <p className="text-sm leading-relaxed text-[#4C1A17]/80 whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {/* TECHNICAL FURNITURE SPECIFICATIONS MATRIX */}
              {product.furnitureSpecs && (
                <div className="bg-[#D4BEA9]/20 border border-[#D4BEA9] rounded-xl p-6 mt-6">
                  <h3 className="text-xs uppercase tracking-widest font-black text-[#700635] mb-4">
                    Technical Specifications
                  </h3>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    {Object.entries(product.furnitureSpecs).map(([key, value]) => (
                      <div key={key} className="border-b border-[#D4BEA9]/40 pb-2">
                        <dt className="text-xs font-bold text-[#4C1A17]/60 capitalize">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </dt>
                        <dd className="mt-0.5 text-[#4C1A17] font-semibold break-words">
                          {value as React.ReactNode}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>

            {/* INTERACTIVE ACTION ELEMENTS */}
            <ProductActionControls 
              product={product} 
              whatsappNumber={whatsappNumber} 
              phoneNumber={phoneNumber} 
            />

          </div>
        </div>
      </div>
    </main>
  );
}
