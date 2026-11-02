import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HydraLearn — AI-Powered Personalized Learning",
  description: "HydraLearn creates personalized lesson plans and learning materials for every student, powered by AI.",
  keywords: ["HydraLearn", "lesson plans", "personalized learning", "AI tutor", "education"],
  authors: [{ name: "HydraLearn" }],
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "HydraLearn",
    description: "AI-powered personalized learning for every student",
    siteName: "HydraLearn",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HydraLearn",
    description: "AI-powered personalized learning for every student",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
