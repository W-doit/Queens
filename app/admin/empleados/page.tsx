"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Plus, Edit, Trash2, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

// Mock data
const employees = [
  {
    id: 1,
    name: "Ana Martínez",
    role: "Vendedor",
    email: "ana.martinez@queens.com",
    phone: "+34 612 345 678",
    status: "active",
    image: "https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  },
  // Add more employees...
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-500/10 text-green-500";
    case "inactive":
      return "bg-gray-500/10 text-gray-500";
    default:
      return "bg-gray-500/10 text-gray-500";
  }
};

const getStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    active: "Activo",
    inactive: "Inactivo",
  };
  return statusMap[status] || status;
};

export default function EmpleadosAdmin() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-playfair">Gestión de Empleados</h1>
        <Button className="btn-gold">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Empleado
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar empleados..."
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
                <th className="text-left py-3 px-4">Empleado</th>
                <th className="text-left py-3 px-4">Cargo</th>
                <th className="text-left py-3 px-4">Contacto</th>
                <th className="text-left py-3 px-4">Estado</th>
                <th className="text-right py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className="border-b">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden">
                        <Image
                          src={employee.image}
                          alt={employee.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="font-medium">{employee.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">{employee.role}</td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-2" />
                        {employee.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 mr-2" />
                        {employee.phone}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary" className={getStatusColor(employee.status)}>
                      {getStatusText(employee.status)}
                    </Badge>
                  </td>
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