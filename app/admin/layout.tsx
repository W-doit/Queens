"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Layout, Menu, Store, Package, Users, Clock, BarChart, X, Bell, LogOut, Settings, ShoppingBag } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // In a real app, verify admin status here
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    if (!isAdmin) {
      router.push("/login");
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  if (!isAuthorized) {
    return null;
  }
  
  return (
    <div className="flex min-h-screen bg-background">
      {/* sidebar button */}
<button
  className="md:hidden p-2 fixed top-4 left-4 z-50 bg-card rounded-md"
  onClick={() => setIsMenuOpen(!isMenuOpen)}
>
  {isMenuOpen ? <X size={20} className="text-black" /> : <Menu size={20} />}
</button>
      {/* Sidebar */}
          <aside
        className={`fixed inset-y-0 left-0 w-64 bg-card border-r border-border transform ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform md:translate-x-0 z-40 mt-16`}
      >
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold font-playfair">Queens Admin</h1>
        </div>
        <nav className="p-4">
            <div className="space-y-2">
              <a
                href="/admin"
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  pathname === "/admin"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <BarChart size={20} />
                <span>Dashboard</span>
              </a>

              <a
                href="/admin/pos"
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  pathname === "/admin/pos"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
             <Store size={20} />
                <span>Punto de venta</span>
              </a>

              <a
                href="/admin/productos"
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  pathname === "/admin/productos"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <Package size={20} />
                <span>Productos</span>
              </a>
              <a
                href="/admin/pedidos"
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  pathname === "/admin/pedidos"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <ShoppingBag size={20} />
                <span>Pedidos</span>
              </a>
              <a
                href="/admin/empleados"
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  pathname === "/admin/empleados"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <Users size={20} />
                <span>Empleados</span>
              </a>
              <a
                href="/admin/horarios"
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  pathname === "/admin/horarios"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <Clock size={20} />
                <span>Control Horario</span>
              </a>

                {/* settings */}
                    <a
                href="/admin/ajustes"
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  pathname === "/admin/ajustes"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <Settings size={20} />
                <span>Ajustes</span>
              </a>
            </div>
          
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 ml-0 md:ml-64">
        {children}
      </main>
    </div>
  );
}