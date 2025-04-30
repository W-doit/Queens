"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Eye, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock data
const orders = [
  {
    id: "ORD-001",
    customer: "María García",
    date: "2024-03-20",
    total: 259.98,
    status: "pending",
    items: 2,
  },
  // Add more orders...
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-500/10 text-yellow-500";
    case "processing":
      return "bg-blue-500/10 text-blue-500";
    case "completed":
      return "bg-green-500/10 text-green-500";
    case "cancelled":
      return "bg-red-500/10 text-red-500";
    default:
      return "bg-gray-500/10 text-gray-500";
  }
};

const getStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    pending: "Pendiente",
    processing: "En Proceso",
    completed: "Completado",
    cancelled: "Cancelado",
  };
  return statusMap[status] || status;
};

export default function PedidosAdmin() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-playfair">Gestión de Pedidos</h1>
      </div>

      <Card className="p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar pedidos..."
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
                <th className="text-left py-3 px-4">Nº Pedido</th>
                <th className="text-left py-3 px-4">Cliente</th>
                <th className="text-left py-3 px-4">Fecha</th>
                <th className="text-left py-3 px-4">Total</th>
                <th className="text-left py-3 px-4">Estado</th>
                <th className="text-left py-3 px-4">Productos</th>
                <th className="text-right py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b">
                  <td className="py-3 px-4">
                    <span className="font-medium">{order.id}</span>
                  </td>
                  <td className="py-3 px-4">{order.customer}</td>
                  <td className="py-3 px-4">{order.date}</td>
                  <td className="py-3 px-4">€{order.total.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary" className={getStatusColor(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <Package className="h-4 w-4 mr-2" />
                      {order.items} productos
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
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