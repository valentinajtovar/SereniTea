import type { Metadata } from "next";
import { Inter, Lexend, Dancing_Script } from "next/font/google";
import "./globals.css";

import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const lexend = Lexend({ subsets: ["latin"], variable: "--font-headline" });
const dancingScript = Dancing_Script({ subsets: ["latin"], variable: "--font-cursive", weight: "400" });

export const metadata: Metadata = {
  title: "SereniTea",
  description: "AI-powered mental wellness platform",
  icons: {
    icon: "/favicon.ico",
  },
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
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
