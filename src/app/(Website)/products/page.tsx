import { client } from "@/sanity/lib/client";
import ProductGridClient from "@/components/ProductGridClient";
import { SITE_NAME, SITE_URL, createSeoMetadata } from "@/lib/seo";

export const metadata = createSeoMetadata({
  title: "Custom Furniture Collection",
  description:
    "Explore custom sofas, wardrobes, beds, dining tables, office chairs, and storage furniture made for your exact dimensions and finish.",
  path: "/products",
});

// Define strict types matching your schema
export interface ProductGalleryItem {
  url: string;
  assetId?: string;
}

export interface FurnitureSpecs {
  upholstery: string;
  cushioning: string;
  dimensions: string;
  legs: string;
  stitching: string;
  frame: string;
  hardware: string;
  finish: string;
  shape: string;
}

export interface ProductItem {
  _id: string;
  title: string;
  slug: string;
  gallery: ProductGalleryItem[];
  price: number;
  category: string;
  shortdescription: string;
  description: string;
  furnitureSpecs: FurnitureSpecs;
}

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

export default async function ProductsPage() {
  const products = await getAllProducts();

  // 2. Generate structured data representing your catalog architecture
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/products/#collection`,
        "url": `${SITE_URL}/products`,
        "name": `Custom Furniture Catalog | ${SITE_NAME}`,
        "description": "Explore custom sofas, wardrobes, beds, dining tables, office chairs, and storage furniture made to your exact dimensions.",
        "publisher": {
          "@type": "Organization",
          "name": SITE_NAME,
          "url": SITE_URL
        }
      },
      {
        "@type": "ItemList",
        "name": "Custom Made Furniture Collection",
        "url": `${SITE_URL}/products`,
        "numberOfItems": products.length,
        "itemListElement": products.map((product, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Product",
            "name": product.title,
            "description": product.shortdescription || product.description,
            "url": `${SITE_URL}/products/${product.slug}`,
            "image": product.gallery && product.gallery[0]?.url ? product.gallery[0].url : undefined,
            "offers": {
              "@type": "Offer",
              "priceCurrency": "INR",
              "price": product.price || "0",
              "availability": "https://schema.org"
            }
          }
        }))
      }
    ]
  };

  return (
    <main className="bg-palette-cream min-h-screen text-white p-8 mt-12">
      {/* 3. Inject the catalog schema right inside the layout markup context */}
      <script
        id="products-collection-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      <h1 className="text-2xl font-bold mb-6 text-center text-palette-brown">Our Collection</h1>
      
      {/* Pass the server-fetched data straight into your UI Engine */}
      <ProductGridClient initialProducts={products} />
    </main>
  );
}
