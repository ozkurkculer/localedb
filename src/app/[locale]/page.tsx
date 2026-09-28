import { Hero } from "@/components/home/hero";
import { FeatureCards } from "@/components/home/feature-cards";
import { localeAlternates } from "@/lib/seo";

// Each page sets its own canonical; the layout sets none, so no page inherits the home page's.
export async function generateMetadata() {
  return { alternates: await localeAlternates("") };
}

export default async function Home() {
  return (
    <>
      <Hero />
      <div className="container relative">
        <FeatureCards />
      </div>
    </>
  );
}
