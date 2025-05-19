"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

// Mock up products
const products = [
  { id: 1, name: "Vestido Dorado", price: 129.99, sizes: ["XS", "S", "M", "L", "XL"] },
  { id: 2, name: "Blusa Negra", price: 59.99, sizes: ["XS", "S", "M", "L", "XL"] },
  { id: 3, name: "Falda Plisada", price: 79.99, sizes: ["XS", "S", "M", "L", "XL"] },
];

export default function POSPage() {
  const [cart, setCart] = useState<
    { id: number; name: string; price: number; qty: number; size: string; discount: number }[]
  >([]);
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>(""); // Para cantidad
  const [discount, setDiscount] = useState<string>(""); // Para descuento
  const [amountGiven, setAmountGiven] = useState<string>("");
  const [change, setChange] = useState<number | null>(null);

  // Calculadora para cantidad
  const handleNumberClick = (num: string) => {
    setInputValue((prev) => (prev === "0" ? num : prev + num));
  };
  const handleClear = () => setInputValue("");
  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => setDiscount(e.target.value);

  // Añadir al carrito
  const handleAddToCart = () => {
    if (!selectedProduct || !selectedSize || !inputValue) return;
    const qty = parseInt(inputValue, 10);
    const disc = parseFloat(discount) || 0;
    if (isNaN(qty) || qty <= 0) return;
    setCart((prev) => {
      const exists = prev.find(
        (item) =>
          item.id === selectedProduct.id &&
          item.size === selectedSize &&
          item.discount === disc
      );
      if (exists) {
        return prev.map((item) =>
          item.id === selectedProduct.id &&
          item.size === selectedSize &&
          item.discount === disc
            ? { ...item, qty: item.qty + qty }
            : item
        );
      }
      return [
        ...prev,
        {
          ...selectedProduct,
          qty,
          size: selectedSize,
          discount: disc,
        },
      ];
    });
    setInputValue("");
    setDiscount("");
    setSelectedProduct(null);
    setSelectedSize("");
  };

  // remove from cart
  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  // Discount
  const total = cart.reduce(
    (sum, item) =>
      sum +
      item.qty * (item.price - (item.price * item.discount) / 100),
    0
  );

  // Payment
  const handleAmountClick = (num: string) => {
    setAmountGiven((prev) => (prev === "0" ? num : prev + num));
  };
  const handleAmountClear = () => {
    setAmountGiven("");
    setChange(null);
  };
  const handleCalculateChange = () => {
    const given = parseFloat(amountGiven.replace(",", "."));
    if (!isNaN(given)) {
      setChange(given - total);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Productos */}
      <div className="md:col-span-2">
        <h1 className="text-3xl font-bold font-playfair mb-6">Punto de Venta</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <Card
              key={product.id}
              className={`flex flex-col items-center p-4 cursor-pointer ${
                selectedProduct?.id === product.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => {
                setSelectedProduct(product);
                setSelectedSize("");
              }}
            >
              <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center mb-2">
                <ShoppingCart className="w-10 h-10 text-gray-400" />
              </div>
              <div className="font-medium">{product.name}</div>
              <div className="text-primary font-bold mb-2">€{product.price.toFixed(2)}</div>
            </Card>
          ))}
        </div>

        {/* Sección de tallas, cantidad y descuento */}
        {selectedProduct && (
          <Card className="mt-6 p-4">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div>
        <div>
  <label className="block text-sm mb-1">Talla</label>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" className="w-24 justify-between">
        {selectedSize ? selectedSize : "Talla"}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      {selectedProduct.sizes.map((size) => (
        <DropdownMenuItem
          key={size}
          onSelect={() => setSelectedSize(size)}
        >
          {size}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
</div>
              </div>
              <div>
                <label className="block text-sm mb-1">Cantidad</label>
                <div className="flex">
                  <input
                    type="text"
                    className="border rounded px-2 py-1 text-sm w-10 text-right font-mono"
                    value={inputValue}
                    readOnly
                    placeholder="0"
                  />
             <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Qty</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    {[...Array(20)].map((_, i) => (
      <DropdownMenuItem key={i + 1} onSelect={() => setInputValue((i + 1).toString())}>
        {i + 1}
      </DropdownMenuItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Descuento (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="border rounded px-2 py-1 text-sm w-20 text-right font-mono"
                  value={discount}
                  onChange={handleDiscountChange}
                  placeholder="0"
                />
              </div>
              <Button
                className="mt-4 md:mt-0"
                disabled={!selectedSize || !inputValue}
                onClick={handleAddToCart}
              >
                Añadir
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Ticket/Carrito y calculadora de pago */}
      <div>
        <Card className="p-6 sticky top-24">
          <h2 className="text-xl font-bold mb-4">Ticket</h2>
          {cart.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">
              El carrito está vacío
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item, idx) => (
                <div key={item.id + item.size + item.discount} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Talla: {item.size} | x{item.qty}
                      {item.discount > 0 && (
                        <span className="ml-2 text-primary">
                          -{item.discount}% desc.
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold">
                      €
                      {(
                        item.qty *
                        (item.price - (item.price * item.discount) / 100)
                      ).toFixed(2)}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => removeFromCart(idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>€{total.toFixed(2)}</span>
              </div>
              <Button className="w-full mt-4 btn-gold">Cobrar</Button>
            </div>
          )}

          {/* Calculadora de pago */}
          {/* <div className="mt-8">
            <h3 className="font-semibold mb-2">Pago</h3>
            <div className="flex mb-2">
              <input
                type="text"
                className="border rounded px-2 py-1 w-full text-right font-mono"
                value={amountGiven}
                readOnly
                placeholder="Cantidad entregada"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[1,2,3,4,5,6,7,8,9,0].map((n) => (
                <Button
                  key={n}
                  variant="outline"
                  onClick={() => handleAmountClick(n.toString())}
                  className="font-bold"
                >
                  {n}
                </Button>
              ))}
              <Button variant="outline" onClick={() => handleAmountClick(".")}>.</Button>
              <Button variant="outline" onClick={handleAmountClear}>C</Button>
            </div>
            <Button className="w-full mb-2" onClick={handleCalculateChange}>
              Calcular cambio
            </Button>
            {change !== null && (
              <div className={`text-lg font-bold ${change < 0 ? "text-red-500" : "text-green-600"}`}>
                {change < 0
                  ? `Faltan €${Math.abs(change).toFixed(2)}`
                  : `Cambio: €${change.toFixed(2)}`}
              </div>
            )}
          </div> */}
        </Card>
      </div>
    </div>
  );
}