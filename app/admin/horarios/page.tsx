"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Clock, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock data
const shifts = [
  {
    id: 1,
    employee: "Ana Martínez",
    date: "2024-03-20",
    startTime: "09:00",
    endTime: "17:00",
    status: "completed",
    totalHours: 8,
  },
  // Add more shifts...
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-500/10 text-green-500";
    case "completed":
      return "bg-blue-500/10 text-blue-500";
    case "late":
      return "bg-yellow-500/10 text-yellow-500";
    default:
      return "bg-gray-500/10 text-gray-500";
  }
};

const getStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    active: "En Turno",
    completed: "Completado",
    late: "Retraso",
  };
  return statusMap[status] || status;
};

export default function HorariosAdmin() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-playfair">Control de Horarios</h1>
        <Button className="btn-gold">
          <Download className="mr-2 h-4 w-4" />
          Exportar Informe
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
                <th className="text-left py-3 px-4">Fecha</th>
                <th className="text-left py-3 px-4">Entrada</th>
                <th className="text-left py-3 px-4">Salida</th>
                <th className="text-left py-3 px-4">Total Horas</th>
                <th className="text-left py-3 px-4">Estado</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift) => (
                <tr key={shift.id} className="border-b">
                  <td className="py-3 px-4">
                    <span className="font-medium">{shift.employee}</span>
                  </td>
                  <td className="py-3 px-4">{shift.date}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {shift.startTime}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {shift.endTime}
                    </div>
                  </td>
                  <td className="py-3 px-4">{shift.totalHours}h</td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary" className={getStatusColor(shift.status)}>
                      {getStatusText(shift.status)}
                    </Badge>
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