import { Metadata } from "next";
import { RoadmapClient } from "@/components/roadmap/roadmap-client";

import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "roadmap.meta" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: "/roadmap",
    },
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: "/roadmap",
      siteName: "LocaleDB",
      images: [
        {
          url: "/og_image.png",
          width: 1200,
          height: 630,
          alt: t("ogAlt"),
        },
      ],
      locale: locale,
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

export default function RoadmapPage() {
  return <RoadmapClient />;
}
