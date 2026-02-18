import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ContributingClient } from "@/components/contributing/contributing-client";

export async function generateMetadata() {
  const t = await getTranslations("contributing.meta");

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: "/contributing",
    },
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

export default function ContributingPage() {
  return <ContributingClient />;
}
