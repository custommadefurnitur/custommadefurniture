export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Clean wrapper that isolates auth pages from website-wide styles
    <div className="min-h-screen bg-slate-50 font-sans">
      {children}
    </div>
  );
}
