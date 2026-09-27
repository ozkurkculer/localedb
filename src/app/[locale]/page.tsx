import { Hero } from "@/components/home/hero";
import { FeatureCards } from "@/components/home/feature-cards";

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
