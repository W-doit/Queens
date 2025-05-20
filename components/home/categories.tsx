"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";

// Mock data
const categories = [
  {
    id: 1,
    name: "Vestidos",
    image:"https://images.pexels.com/photos/32074735/pexels-photo-32074735.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    count: 42,
  },
  {
    id: 2,
    name: "Blusas",
    image: "https://images.pexels.com/photos/1844132/pexels-photo-1844132.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    count: 38,
  },
  {
    id: 3,
    name: "Faldas",
    image: "https://images.pexels.com/photos/7691384/pexels-photo-7691384.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    count: 24,
  },
  {
    id: 4,
    name: "Accesorios",
    image: "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    count: 56,
  },
];

export default function Categories() {
  const [visibleCategories, setVisibleCategories] = useState<number[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = Number(entry.target.getAttribute("data-id"));
            setVisibleCategories((prev) => [...prev, id]);
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".category-card");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <section id="categories" className="bg-black text-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-playfair">
            Categorías
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto mb-4"></div>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Explora nuestra colección por categorías y encuentra tu estilo perfecto
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link href={`/categoria/${category.id}`} key={category.id}>
              <Card 
                className={`category-card group bg-transparent border-none overflow-hidden shadow-lg ${
                  visibleCategories.includes(category.id) 
                    ? category.id % 2 === 0 ? "animate-slide-in-right" : "animate-slide-in-left" 
                    : "opacity-0"
                }`}
                data-id={category.id}
              >
                <div className="relative h-80 w-full overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                    <div>
                      <h3 className="text-xl font-bold font-playfair text-white group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-300">{category.count} productos</p>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}