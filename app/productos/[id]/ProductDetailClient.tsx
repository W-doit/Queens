"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { ProductoOdoo } from "@/lib/odoo";
import WhatsAppButton from "@/components/productos/whatsapp-button";
import { Heart } from "lucide-react";

export default function ProductDetailClient({
  product,
}: {
  product: ProductoOdoo;
}) {

  // const { addToCart } = useCart();
  // const { toast } = useToast();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          <div className="w-full aspect-[3/2] bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            <img
              src={product.image_1920 || product.image_url}
              alt={product.name}
              className="w-full h-full object-contain"
              style={{ maxHeight: 250 }}
            />
          </div>
        </div>
        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <div className="mb-2">
            <span className="font-semibold">Precio: </span>€
            {product.list_price?.toFixed(2)}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Descripción: </span>
            {/* product description */}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Stock: </span>
            {/* product qty available */}
          </div>
          <div className="mb-4">
            <span className="font-semibold">Talla: </span>
            {product.size || "Única"}
          </div>
          {/* <Button
            onClick={() => {
              addToCart(product);
              toast({
                title: "Producto añadido",
                description: `${product.name} ha sido añadido a tu carrito.`,
              });
            }}
          >
            Añadir al carrito
          </Button> */}
        <WhatsAppButton productName={product.name} />
           <Button size="icon" variant="outline" className="rounded-full border-white text-black hover:bg-white/20">
                      Añadir a favoritos
                    </Button><Heart className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
