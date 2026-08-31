import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KargoSetu | Executive Command Center",
  description: "Predictive Maritime Logistics for Indian PSUs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#080E1E] text-white font-sans antialiased">
        <main className="min-h-screen p-8">
          {children}
        </main>
      </body>
    </html>
  );
}