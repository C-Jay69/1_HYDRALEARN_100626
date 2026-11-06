import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { I18nProvider } from "@/components/i18n-provider";
import { defaultLocale, isLocale, LOCALE_COOKIE } from "@/lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HydraLearn - AI-Powered Educational Platform",
  description: "HydraLearn is an AI-powered educational platform under the Lifejacket AI brand. Generate pedagogically sound lesson plans, assessments, and learning materials for students, teachers, and administrators.",
  keywords: ["HydraLearn", "Lifejacket AI", "Education", "AI", "Lesson Plans", "Assessment", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "Genkit", "Prisma"],
  authors: [{ name: "Lifejacket AI" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "HydraLearn - AI-Powered Education",
    description: "Generate lesson plans, assessments, and learning materials powered by AI pedagogical theory.",
    url: "https://hydralearn.com",
    siteName: "HydraLearn",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HydraLearn - AI-Powered Education",
    description: "Generate lesson plans, assessments, and learning materials powered by AI pedagogical theory.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <I18nProvider initialLocale={locale}>
          {children}
          <Toaster />
        </I18nProvider>
      </body>
    </html>
  );
}
