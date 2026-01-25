import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/sections/footer";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import type { Metadata } from "next";
import { Asap } from "next/font/google";
import { Toaster as Sonner } from "sonner";
import "./globals.css";

const asap = Asap({
  variable: "--font-asap",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CIBN Digital Library - Excellence in Banking Education",
  description: "Comprehensive digital platform for the Chartered Institute of Bankers of Nigeria offering premium banking resources, courses, and educational materials.",
  keywords: ["CIBN", "Banking Education", "Digital Library", "Financial Courses", "Professional Development"],
  authors: [{ name: "CIBN" }],
  openGraph: {
    title: "CIBN Digital Library",
    description: "Excellence in Banking Education - Premium Digital Resources",
    url: "https://cibng.org",
    siteName: "CIBN Digital Library",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CIBN Digital Library",
    description: "Excellence in Banking Education",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${asap.variable} font-asap antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          <Navbar />
          {children}
          <Toaster />
          <Sonner position="top-right" richColors duration={2000} />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
