import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/config/site";
import Script from "next/script";
import { fontClassName } from "../fonts";

// Pages are prerendered, so this is read once at build time. The Cloudflare build gets the Web
// Analytics token from its build environment (never committed).
const cfBeaconToken = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  // Map locale codes to OpenGraph locale format
  const ogLocaleMap: Record<string, string> = {
    en: "en_US",
    tr: "tr_TR",
    zh: "zh_CN",
    hi: "hi_IN",
    es: "es_ES",
    fr: "fr_FR",
    ar: "ar_SA",
    bn: "bn_BD",
    pt: "pt_PT",
    ru: "ru_RU",
    ja: "ja_JP",
  };

  return {
    title: {
      default: siteConfig.title,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    authors: [
      {
        name: siteConfig.creator.name,
        url: siteConfig.creator.url,
      },
    ],
    creator: siteConfig.creator.name,
    metadataBase: new URL(siteConfig.url),
    openGraph: {
      type: "website",
      locale: ogLocaleMap[locale] || "en_US",
      url: siteConfig.url,
      title: siteConfig.title,
      description: siteConfig.description,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.title,
      description: siteConfig.description,
      images: [siteConfig.ogImage],
      creator: "@localedb",
    },
    icons: {
      icon: "/favicon.ico",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Lets next-intl read the locale from here instead of request headers, so pages render statically.
  setRequestLocale(locale);

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/flag-icons@7.3.2/css/flag-icons.min.css"
        />
      </head>
      <body className={fontClassName}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
            {cfBeaconToken && (
              <Script
                src="https://static.cloudflareinsights.com/beacon.min.js"
                data-cf-beacon={JSON.stringify({ token: cfBeaconToken })}
                strategy="afterInteractive"
              />
            )}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
