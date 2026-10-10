import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContributingClient } from "@/components/contributing/contributing-client";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contributing.meta" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: localeAlternates(locale, "/contributing"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: "/contributing",
      siteName: "LocaleDB",
      images: [
        {
          url: "/og_image.png",
          width: 1200,
          height: 630,
          alt: t("title"),
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/og_image.png"],
    },
  };
}

export default async function ContributingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ContributingClient />;
}
