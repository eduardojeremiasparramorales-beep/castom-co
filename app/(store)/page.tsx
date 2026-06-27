import { HeroSection } from "@/components/home/hero-section";
import { FeaturedProducts } from "@/components/home/featured-products";
import { CategoriesSection } from "@/components/home/categories-section";
import { WholesaleSection } from "@/components/home/wholesale-section";

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <FeaturedProducts />
      <CategoriesSection />
      <WholesaleSection />
    </div>
  );
}
