// app/products/page.tsx (Server Component)
import { client } from "@/sanity/lib/client";
import ProductGridClient from "@/components/ProductGridClient";
import { createSeoMetadata } from "@/lib/seo";

export const metadata = createSeoMetadata({
  title: "Custom Furniture Collection",
  description:
    "Explore custom sofas, wardrobes, beds, dining tables, office chairs, and storage furniture made for your exact dimensions and finish.",
  path: "/products",
});

// Define strict types matching your schema
export interface ProductGalleryItem {
  url: string;
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
  // Fetch all required data in a single clean query
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
}
`;

  
  return await client.fetch(query);
}

export default async function ProductsPage() {
  const products = await getAllProducts();

  return (
    <main className="bg-palette-cream min-h-screen text-white p-8 mt-12">
      <h1 className="text-2xl font-bold mb-6 text-center text-palette-brown">Our Collection</h1>
      
      {/* Pass the server-fetched data straight into your UI Engine */}
      <ProductGridClient initialProducts={products} />
    </main>
  );
}
