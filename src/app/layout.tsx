import type { Metadata } from "next";
import { Inter, Lexend, Dancing_Script } from "next/font/google";
import "./globals.css";

import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const lexend = Lexend({ subsets: ["latin"], variable: "--font-headline" });
const dancingScript = Dancing_Script({ subsets: ["latin"], variable: "--font-cursive", weight: "400" });

export const metadata: Metadata = {
  title: "SereniTea",
  description: "AI-powered mental wellness platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          inter.variable,
          lexend.variable,
          dancingScript.variable,
          "font-sans antialiased"
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
