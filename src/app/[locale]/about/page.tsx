import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import AboutContent from "./about-content";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about");
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: await localeAlternates("/about"),
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

export default function AboutPage() {
  return <AboutContent />;
}
