import { createSeoMetadata } from "@/lib/seo";

export const metadata = createSeoMetadata({
  title: "Custom Furniture FAQs",
  description:
    "Find answers about custom furniture orders, materials, dimensions, delivery, consultations, and made-to-measure design requests.",
  path: "/faq",
});

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
