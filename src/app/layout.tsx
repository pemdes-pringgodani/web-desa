import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "API Backend - Web Desa Pringgodani",
  description: "Layanan REST API backend Website Resmi Pemerintah Desa Pringgodani.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased font-sans">
      <body className="min-h-full flex flex-col bg-[#f9f9ff] text-[#151c27] font-sans">
        {children}
      </body>
    </html>
  );
}
