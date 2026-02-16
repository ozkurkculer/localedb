import { Hero } from "@/components/home/hero";
import { FeatureCards } from "@/components/home/feature-cards";

export default async function Home() {
  return (
    <div className="container relative">
      <Hero />
      <FeatureCards />
    </div>
  );
}
