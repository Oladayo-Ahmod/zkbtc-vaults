// app/layout.tsx
import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";
import Navbar from "@/components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "zkBTCVault",
  description: "Unlock Bitcoin with Zero Knowledge",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] text-white", inter.className)}>
        <Providers>
          <Navbar />
          <main className="px-4 md:px-10 pt-24 pb-16 max-w-6xl mx-auto">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
