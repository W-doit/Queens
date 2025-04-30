"use client";

import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ArrowUp, Users, Package, ShoppingBag, DollarSign } from "lucide-react";

// Mock data
const salesData = [
  { name: "Ene", ventas: 4000 },
  { name: "Feb", ventas: 3000 },
  { name: "Mar", ventas: 2000 },
  { name: "Abr", ventas: 2780 },
  { name: "May", ventas: 1890 },
  { name: "Jun", ventas: 2390 },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-playfair">Panel de Control</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ventas Totales</p>
              <h3 className="text-2xl font-bold">€15,890</h3>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <ArrowUp className="h-4 w-4 mr-1" />
                12% más que ayer
              </p>
            </div>
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pedidos Nuevos</p>
              <h3 className="text-2xl font-bold">23</h3>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <ArrowUp className="h-4 w-4 mr-1" />
                8% más que ayer
              </p>
            </div>
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Productos</p>
              <h3 className="text-2xl font-bold">142</h3>
              <p className="text-sm text-muted-foreground mt-1">12 sin stock</p>
            </div>
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Empleados</p>
              <h3 className="text-2xl font-bold">8</h3>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <ArrowUp className="h-4 w-4 mr-1" />
                2 activos ahora
              </p>
            </div>
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Ventas Mensuales</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="ventas" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}