"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, HeartOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProductoOdoo } from "@/lib/odoo";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavContext";
import WhatsAppButton from "./whatsapp-button";


type ProductListProps = {
  products: ProductoOdoo[];
  sort: string;
  setSort: (value: string) => void;
};

export default function ProductList({
  products,
  sort,
  setSort,
}: ProductListProps) {
  const [visibleProducts, setVisibleProducts] = useState<number[]>([]);
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  useEffect(() => {
    if (products.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = Number(entry.target.getAttribute("data-id"));
            setVisibleProducts((prev) =>
              prev.includes(id) ? prev : [...prev, id]
            );
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
  }, [products]);

  const handleAddToCart = (id: number, name: string) => {
    const product = products.find((p) => p.id === id);
    if (product) {
      addToCart(product);
      toast({
        title: "Producto añadido",
        description: `${name} ha sido añadido a tu carrito.`,
      });
    }
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
        <p className="text-muted-foreground">
          Mostrando {products.length} productos
        </p>
        <div className="flex items-center space-x-2">
          <label htmlFor="sort" className="text-sm">
            Ordenar por:
          </label>
          <select
            id="sort"
            className="text-sm border rounded p-1"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="relevancia">Relevancia</option>
            <option value="precio-menor-mayor">Precio: menor a mayor</option>
            <option value="precio-mayor-menor">Precio: mayor a menor</option>
            <option value="recientes">Más recientes</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card
            key={product.id}
            className={`product-card group queens-card bg-card ${
              visibleProducts.includes(product.id)
                ? "animate-fade-in"
                : "opacity-0"
            }`}
            style={{ transitionDelay: `${(product.id % 4) * 100}ms` }}
            data-id={product.id}
          >
            <div className="relative overflow-hidden aspect-[3/4] flex items-center justify-center bg-gray-200">
              <span className="text-gray-400 text-6xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-20 h-20 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="2"
                    strokeWidth="2"
                  />
                  <path d="M8 17l4-4 4 4" strokeWidth="2" />
                  <circle cx="9" cy="9" r="2" strokeWidth="2" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="flex space-x-2">
                  <WhatsAppButton productName={product.name} />
                  {/* <Button
                    size="icon"
                    className="rounded-full bg-white text-black hover:bg-primary"
                    onClick={() => handleAddToCart(product.id, product.name)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button> */}
              <Button
    size="icon"
   variant="outline"
  className={`rounded-full border-white text-black hover:bg-white/20 ${isFavorite(product.id) ? "bg-red-100 text-red-500 border-red-200" : ""}`}    onClick={() =>
      isFavorite(product.id)
        ? removeFromFavorites(product.id)
        : addToFavorites(product)
    }
    aria-label={isFavorite(product.id) ? "Quitar de favoritos" : "Añadir a favoritos"}
  >
    <Heart className="h-4 w-4" fill={isFavorite(product.id) ? "#ef4444" : "none"} />
  </Button>
                </div>
              </div>
              <div className="absolute top-2 left-2">
                <span className="bg-primary text-xs text-black px-2 py-1 rounded-sm">
                  {Array.isArray(product.categ_id) &&
                  product.categ_id.length > 1
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
              <p className="font-bold text-lg mt-1">
                €{product.list_price.toFixed(2)}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Button variant="outline" className="mr-2">
          Anterior
        </Button>
        <Button variant="outline" className="bg-primary text-black">
          1
        </Button>
        <Button variant="outline" className="mx-1">
          2
        </Button>
        <Button variant="outline" className="mx-1">
          3
        </Button>
        <Button variant="outline" className="ml-2">
          Siguiente
        </Button>
      </div>
    </div>
  );
}
