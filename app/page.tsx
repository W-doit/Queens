import HeroSection from '@/components/home/hero-section';
import FeaturedProducts from '@/components/home/featured-products';
import Categories from '@/components/home/categories';
import VirtualFittingCta from '@/components/home/virtual-fitting-cta';
import Testimonials from '@/components/home/testimonials';
import Newsletter from '@/components/home/newsletter';

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedProducts />
      <Categories />
      <VirtualFittingCta />
      <Testimonials />
      <Newsletter />
    </>
  );
}