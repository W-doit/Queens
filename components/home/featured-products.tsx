"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart, Heart } from "lucide-react";
import { fetchProductosApi, ProductoOdoo } from "@/lib/odoo";
import WhatsAppButton from "@/components/productos/whatsapp-button";
import ComingSoon from "./comingsoon";


export default function FeaturedProducts() {
  const [visibleProducts, setVisibleProducts] = useState<number[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductoOdoo[]>([]);

useEffect(() => {
  fetchProductosApi().then((data) => {
    console.log("PRODUCTOS DESTACADOS:", data);
    setFeaturedProducts(data);
  });
}, []);

  useEffect(() => {
    if (featuredProducts.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = Number(entry.target.getAttribute("data-id"));
            setVisibleProducts((prev) => [...prev, id]);
          }
        });
      },
      { threshold: 0.1 }
    );

  const elements = document.querySelectorAll(".product-card");
  elements.forEach((el) => observer.observe(el));

  return () => {
    elements.forEach((el) => observer.unobserve(el));
  };
}, [featuredProducts]);

  return (
    <section className="bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-playfair">
            Productos Destacados
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Descubre nuestras piezas más exclusivas cuidadosamente seleccionadas para ti
          </p>
          <ComingSoon />
          
        </div>
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 4).map((product) => (
            <Card
              key={product.id}
              className={`product-card group queens-card bg-card ${
                visibleProducts.includes(product.id) ? "animate-fade-in" : "opacity-0"
              }`}
              data-id={product.id}
            >
<div className="relative overflow-hidden aspect-[3/4] flex items-center justify-center bg-gray-200">
  <span className="text-gray-400 text-6xl">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
      <path d="M8 17l4-4 4 4" strokeWidth="2" />
      <circle cx="9" cy="9" r="2" strokeWidth="2" />
    </svg>
  </span>
          <Image
            src={product.image_1920 || "/placeholder.jpg"}
            alt={product.name}
            fill
            className="object-cover"
          /> */}
                {/* <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex space-x-2">
                    <Button size="icon" className="rounded-full bg-white text-black hover:bg-primary">
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                     <WhatsAppButton productName={product.name} />
                    <Button size="icon" variant="outline" className="rounded-full border-white text-black hover:bg-white/20">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="absolute top-2 left-2">
                <span className="bg-primary text-xs text-black px-2 py-1 rounded-sm">
  {Array.isArray(product.categ_id) && product.categ_id.length > 1
    ? product.categ_id[1]
    : "Sin categoría"}
</span>
                </div>
              </div>
              <div className="p-4">
                <Link href={`/productos/${product.id}`}>
                  <h3 className="font-medium hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <p className="font-bold text-lg mt-1">€{product.list_price.toFixed(2)}</p>
              </div>
            </Card>
          ))}
        </div> */}

        {/* <div className="text-center mt-12">
          <Button asChild size="lg" className="btn-gold">
            <Link href="/productos">Ver Todos los Productos</Link>
          </Button>
        </div> */}
      </div>
    </section>
  );
}