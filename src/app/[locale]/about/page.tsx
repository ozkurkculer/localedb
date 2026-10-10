import { getTranslations, setRequestLocale } from "next-intl/server";
import { Metadata } from "next";
import AboutContent from "./about-content";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: localeAlternates(locale, "/about"),
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
      url: "/about",
      siteName: "LocaleDB",
      images: [
        {
          url: "/og_image.png",
          width: 1200,
          height: 630,
          alt: t("meta.title"),
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("meta.title"),
      description: t("meta.description"),
      images: ["/og_image.png"],
    },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AboutContent />;
}
