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
    image: "https://images.pexels.com/photos/7319464/pexels-photo-7319464.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  },
  // Add more products...
];


export default function ProductosAdmin() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-playfair">Gestión de Productos</h1>
    <Button className="btn-gold" onClick={() => router.push("/admin/nuevo-producto")}>
      <Plus className="mr-2 h-4 w-4" />
      Nuevo Producto
    </Button>
      </div>

      <Card className="p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar productos..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Button variant="outline">Filtros</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Producto</th>
                <th className="text-left py-3 px-4">Categoría</th>
                <th className="text-left py-3 px-4">Precio</th>
                <th className="text-left py-3 px-4">Stock</th>
                <th className="text-right py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative h-12 w-12 rounded-md overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
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
                      <Button variant="ghost" size="icon" className="text-destructive">
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