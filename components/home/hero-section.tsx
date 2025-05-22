"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="hero-gradient text-white min-h-[90vh] flex justify-start relative overflow-hidden">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="container mx-auto px-4 py-12 z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Logo */}
          <Link
            href="/"
            className={`flex items-center justify-center mb-2 ${
              isVisible ? "animate-fade-in" : "opacity-0"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <Image
              src="/queens-logo.png"
              alt="Queens Logo"
              width={300}
              height={100}
              className="h-56 w-auto"
              priority
            />
          </Link>
          <h1
            className={`text-4xl md:text-6xl lg:text-7xl font-bold mb-6 font-playfair 
              ${isVisible ? "animate-fade-in" : "opacity-0"}`}
            style={{ transitionDelay: "200ms" }}
          >
            <span className="gold-text">Corona tu estilo </span>
          </h1>

          <p
            className={`text-lg md:text-xl mb-8 max-w-2xl mx-auto text-gray-300
              ${isVisible ? "animate-fade-in" : "opacity-0"}`}
            style={{ transitionDelay: "400ms" }}
          >
            Descubre la elegancia que mereces con nuestra exclusiva colección de
            moda para la mujer moderna
          </p>

          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center
              ${isVisible ? "animate-fade-in" : "opacity-0"}`}
            style={{ transitionDelay: "600ms" }}
          >
            <Button
              asChild
              size="lg"
              className="bg-primary text-black hover:bg-primary/90"
            >
              <Link href="/productos">Explorar Colección</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-primary text-primary hover:bg-primary/10 hover:text-white"
            >
              <Link
                href="/vestidor-virtual"
                className="inline-flex items-center"
              >
                Vestidor Virtual <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Gold Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 gold-gradient"></div>
    </section>
  );
}
