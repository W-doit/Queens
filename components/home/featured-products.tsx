"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart, Heart } from "lucide-react";

// Mock data - in a real app this would come from an API
const featuredProducts = [
  {
    id: 1,
    name: "Vestido Dorado Elegante",
    price: 129.99,
    image: "https://images.pexels.com/photos/7319464/pexels-photo-7319464.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Vestidos",
  },
  {
    id: 2,
    name: "Blusa Negra Satinada",
    price: 59.99,
    image: "https://images.pexels.com/photos/9464654/pexels-photo-9464654.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Blusas",
  },
  {
    id: 3,
    name: "Falda Plisada Elegante",
    price: 79.99,
    image: "https://images.pexels.com/photos/1385472/pexels-photo-1385472.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Faldas",
  },
  {
    id: 4,
    name: "Conjunto Formal Dorado",
    price: 149.99,
    image: "https://images.pexels.com/photos/8386668/pexels-photo-8386668.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Conjuntos",
  },
];

export default function FeaturedProducts() {
  const [visibleProducts, setVisibleProducts] = useState<number[]>([]);

  useEffect(() => {
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
  }, []);

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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <Card
              key={product.id}
              className={`product-card group queens-card bg-card ${
                visibleProducts.includes(product.id) ? "animate-fade-in" : "opacity-0"
              }`}
              data-id={product.id}
            >
              <div className="relative overflow-hidden aspect-[3/4]">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex space-x-2">
                    <Button size="icon" className="rounded-full bg-white text-black hover:bg-primary">
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="rounded-full border-white text-black hover:bg-white/20">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="absolute top-2 left-2">
                  <span className="bg-primary text-xs text-black px-2 py-1 rounded-sm">
                    {product.category}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <Link href={`/producto/${product.id}`}>
                  <h3 className="font-medium hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <p className="font-bold text-lg mt-1">€{product.price.toFixed(2)}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild size="lg" className="btn-gold">
            <Link href="/productos">Ver Todos los Productos</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}