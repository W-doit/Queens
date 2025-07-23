"use client";

import HeroSection from '@/components/home/hero-section';
import VirtualFittingCta from '@/components/home/virtual-fitting-cta';
import Testimonials from '@/components/home/testimonials';
import Newsletter from '@/components/home/newsletter';
import { useEffect } from 'react';

function scrollToVestidorWithRetry(retries = 10) {
  if (window.location.hash === '#vestidor-virtual-section') {
    const section = document.getElementById('vestidor-virtual-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    } else if (retries > 0) {
      setTimeout(() => scrollToVestidorWithRetry(retries - 1), 100);
    }
  }
}

export default function Home() {
  useEffect(() => {
    scrollToVestidorWithRetry();
    const onHashChange = () => scrollToVestidorWithRetry();
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return (
    <>
      <HeroSection />
      <VirtualFittingCta />
      {/* <Testimonials />
      <Newsletter /> */}
    </>
  );
}