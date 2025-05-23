"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data - in a real app, this would come from an API
const products = [
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
  {
    id: 5,
    name: "Vestido Negro Formal",
    price: 119.99,
    image: "https://images.pexels.com/photos/13627461/pexels-photo-13627461.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Vestidos",
  },
  {
    id: 6,
    name: "Falda Corta Elegante",
    price: 69.99,
    image: "https://images.pexels.com/photos/5709664/pexels-photo-5709664.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Faldas",
  },
  {
    id: 7,
    name: "Blusa Dorada de Fiesta",
    price: 89.99,
    image: "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Blusas",
  },
  {
    id: 8,
    name: "Chaqueta Negra Elegante",
    price: 159.99,
    image: "https://images.pexels.com/photos/5480696/pexels-photo-5480696.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Chaquetas",
  }
];

export default function ProductList() {
  const [visibleProducts, setVisibleProducts] = useState<number[]>([]);
  const { toast } = useToast();

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

  const handleAddToCart = (id: number, name: string) => {
    toast({
      title: "Producto añadido",
      description: `${name} ha sido añadido a tu carrito.`,
    });
  };

  const handleAddToWishlist = (id: number, name: string) => {
    toast({
      title: "Añadido a favoritos",
      description: `${name} ha sido añadido a tu lista de deseos.`,
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">Mostrando {products.length} productos</p>
        <div className="flex items-center space-x-2">
          <label htmlFor="sort" className="text-sm">Ordenar por:</label>
          <select id="sort" className="text-sm border rounded p-1">
            <option>Relevancia</option>
            <option>Precio: menor a mayor</option>
            <option>Precio: mayor a menor</option>
            <option>Más recientes</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card
            key={product.id}
            className={`product-card group queens-card bg-card ${
              visibleProducts.includes(product.id) ? "animate-fade-in" : "opacity-0"
            }`}
            style={{ transitionDelay: `${(product.id % 4) * 100}ms` }}
            data-id={product.id}
          >
            <div className="relative overflow-hidden aspect-[3/4] flex items-center justify-center bg-gray-200">
              {/* Placeholder for image */}
            {/* <div className="relative overflow-hidden aspect-[3/4]"> */}
              {/* <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              /> */}
                <span className="text-gray-400 text-6xl">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
      <path d="M8 17l4-4 4 4" strokeWidth="2" />
      <circle cx="9" cy="9" r="2" strokeWidth="2" />
    </svg>
  </span>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="flex space-x-2">
                  <Button 
                    size="icon" 
                    className="rounded-full bg-white text-black hover:bg-primary"
                    onClick={() => handleAddToCart(product.id, product.name)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="rounded-full border-white text-black hover:bg-white/20"
                    onClick={() => handleAddToWishlist(product.id, product.name)}
                  >
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

      <div className="mt-8 flex justify-center">
        <Button variant="outline" className="mr-2">Anterior</Button>
        <Button variant="outline" className="bg-primary text-black">1</Button>
        <Button variant="outline" className="mx-1">2</Button>
        <Button variant="outline" className="mx-1">3</Button>
        <Button variant="outline" className="ml-2">Siguiente</Button>
      </div>
    </div>
  );
}