import { Hero } from "@/components/home/hero";
import { FeatureCards } from "@/components/home/feature-cards";
import { PackagesSection } from "@/components/home/packages-section";
import { setRequestLocale } from "next-intl/server";
import { localeAlternates } from "@/lib/seo";

// Each page sets its own canonical; the layout sets none, so no page inherits the home page's.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return { alternates: localeAlternates(locale, "") };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <div className="container relative">
        <FeatureCards />
        <PackagesSection />
      </div>
    </>
  );
}
