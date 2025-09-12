import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "sonner";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Assumption: site is hosted at this URL. Change if different.
const SITE_URL = "https://naija-admin.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Naija Admin - Healthcare Dashboard",
    template: "%s | Naija Admin",
  },
  description:
    "Admin dashboard for managing hospitals, HMOs and insurance plans across your healthcare network.",
  keywords: [
    "healthcare",
    "admin",
    "dashboard",
    "hospitals",
    "insurance",
    "HMO",
    "naija",
  ],
  authors: [{ name: "Naija Admin", url: SITE_URL }],
  creator: "Naija Admin",
  openGraph: {
    title: "Naija Admin - Healthcare Dashboard",
    description:
      "Admin dashboard for managing hospitals, HMOs and insurance plans across your healthcare network.",
    url: SITE_URL,
    siteName: "Naija Admin",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Naija Admin - Healthcare Dashboard",
    description:
      "Admin dashboard for managing hospitals, HMOs and insurance plans across your healthcare network.",
    images: [`${SITE_URL}/og-image.png`],
    // Update to your official twitter handle if available
    site: "@naija_admin",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {" "}
          <Toaster />
          {/* Structured data (JSON-LD) for better SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "Naija Admin",
                url: SITE_URL,
                description:
                  "Admin dashboard for managing hospitals, HMOs and insurance plans across your healthcare network.",
              }),
            }}
          />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
