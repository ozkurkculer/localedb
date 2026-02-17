import { Geist, Geist_Mono } from "next/font/google";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: true,
});

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}>) {
  // Get locale from params (from [locale] segment)
  const resolvedParams = await params;
  const locale = resolvedParams.locale || routing.defaultLocale;

  // Validate locale
  if (resolvedParams.locale && !routing.locales.includes(locale as any)) {
    notFound();
  }

  // Determine text direction based on locale
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/flag-icons@7.3.2/css/flag-icons.min.css"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
