"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import Image from "next/image";

// Mock data
const products = [
  {
    id: 1,
    name: "Vestido Dorado Elegante",
    price: 129.99,
    stock: 15,
    category: "Vestidos",
    image:
      "https://images.pexels.com/photos/7319464/pexels-photo-7319464.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  },
  // Add more products...
];

export default function ProductosAdmin() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-playfair">
          Gestión de Productos
        </h1>
        <Button
          className="btn-gold"
          onClick={() => router.push("/admin/nuevo-producto")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      <Card className="p-6 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar productos..."
                className="pl-10 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Button variant="outline" className="w-full sm:w-auto">
            Filtros
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2">Producto</th>
                <th className="text-left py-2 px-2">Categoría</th>
                <th className="text-left py-2 px-2">Precio</th>
                <th className="text-left py-2 px-2">Stock</th>
                <th className="text-right py-2 px-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b">
                  <td className="py-2 px-2">
                    <div className="flex items-center space-x-2">
                      <div className="relative h-10 w-10 rounded-md overflow-hidden">
                        {/* <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        /> */}
                        <span className="text-gray-400 text-6xl">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-10 h-10 mx-auto"
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
                      </div>
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">{product.category}</td>
                  <td className="py-3 px-4">€{product.price.toFixed(2)}</td>
                  <td className="py-3 px-4">{product.stock}</td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
