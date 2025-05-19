"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, X, ShoppingBag, CreditCard, ArrowRight } from "lucide-react";
import CheckoutForm from "./checkout-form";

// Mock cart data
const initialCartItems = [
  {
    id: 1,
    name: "Vestido Dorado Elegante",
    price: 129.99,
    quantity: 1,
    image: "http://www.w3.org/2000/svg",
    size: "M",
  },
  {
    id: 3,
    name: "Falda Plisada Elegante",
    price: 79.99,
    quantity: 1,
    image: "https://images.pexels.com/photos/1385472/pexels-photo-1385472.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    size: "S",
  },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [couponCode, setCouponCode] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { toast } = useToast();

  const handleQuantityChange = (id: number, change: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const handleRemoveItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
    toast({
      title: "Producto eliminado",
      description: "El producto ha sido eliminado del carrito.",
    });
  };

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      toast({
        title: "Cupón inválido",
        description: "El código de cupón ingresado no es válido o ha expirado.",
        variant: "destructive",
      });
      setCouponCode("");
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 0 ? 4.99 : 0;
  const total = subtotal + shipping;

  if (cartItems.length === 0 && !isCheckingOut) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-lg mx-auto">
          <div className="rounded-full bg-primary/10 p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-4 font-playfair">Tu Carrito está Vacío</h1>
          <p className="text-muted-foreground mb-8">
            Parece que aún no has añadido ningún producto a tu carrito.
          </p>
          <Button asChild className="btn-gold">
            <Link href="/productos">Explorar Productos</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 font-playfair">
        {isCheckingOut ? "Finalizar Compra" : "Tu Carrito"}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items or Checkout Form */}
        <div className="lg:col-span-2">
          {!isCheckingOut ? (
            <Card className="p-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row gap-4 py-4 border-b last:border-0">
                  {/* <div className="relative w-full sm:w-24 h-32 bg-gray-100 overflow-hidden rounded-md">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div> */}
                  
  <span className="text-gray-400 text-6xl">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
      <path d="M8 17l4-4 4 4" strokeWidth="2" />
      <circle cx="9" cy="9" r="2" strokeWidth="2" />
    </svg>
  </span>
                  
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{item.name}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-2">Talla: {item.size}</p>
                    <p className="font-semibold">€{item.price.toFixed(2)}</p>
                    
                    <div className="flex items-center mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-r-none"
                        onClick={() => handleQuantityChange(item.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <div className="h-8 w-12 flex items-center justify-center border-y border-input">
                        {item.quantity}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-l-none"
                        onClick={() => handleQuantityChange(item.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-4 flex justify-between">
                <Link href="/productos">
                  <Button variant="link" className="text-primary">
                    &larr; Continuar Comprando
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <CheckoutForm />
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 font-playfair">Resumen del Pedido</h3>
            
            {!isCheckingOut && (
              <>
                <div className="flex flex-col space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Envío</span>
                    <span>€{shipping.toFixed(2)}</span>
                  </div>
                </div>

                <Separator className="my-4" />
                
                <div className="flex justify-between font-semibold text-lg mb-6">
                  <span>Total</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
                
                <div className="flex items-center space-x-2 mb-6">
                  <Input
                    placeholder="Código de cupón"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <Button variant="outline" onClick={handleApplyCoupon}>
                    Aplicar
                  </Button>
                </div>
              </>
            )}
            
            {isCheckingOut ? (
              <div className="space-y-4">
                <div className="p-4 bg-primary/10 rounded-md">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Subtotal:</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Envío:</span>
                    <span>€{shipping.toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                </div>
                
                <Button
                  className="w-full btn-gold"
                  size="lg"
                  onClick={() => {
                    toast({
                      title: "Procesando pago",
                      description: "Redirigiendo a la pasarela de pago seguro...",
                    });
                  }}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pagar Ahora
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsCheckingOut(false)}
                >
                  Volver al Carrito
                </Button>
              </div>
            ) : (
              <Button
                className="w-full btn-gold"
                size="lg"
                onClick={() => setIsCheckingOut(true)}
              >
                Realizar Pedido
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}