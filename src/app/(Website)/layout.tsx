import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function WebsiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      {/* Your public-facing styling remains contained only within the website group */}
      <main className="font-[Poppins]">
        {children}
      </main>
      <Footer />
    </>
  );
}
