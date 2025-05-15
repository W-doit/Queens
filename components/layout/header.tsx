"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Search,
  Bell,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

const navItems = [
  { name: "Inicio", href: "/" },
  { name: "Productos", href: "/productos" },
  { name: "Categorías", href: "/categorias" },
  { name: "Vestidor Virtual", href: "/vestidor-virtual" },
  { name: "Sobre Nosotros", href: "/sobre-nosotros" },
  { name: "Contacto", href: "/contacto" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Check if user is admin in localStorage, this is a mockup
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    setIsAdmin(isAdmin);

    //Mockup admin name
    if (isAdmin) {
      setAdminName("Nombre Apellido");
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mockup logout function
  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    window.location.href = "/login";
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? "shadow-md py-2" : "py-4"
      }`}
      style={{
        background:
          "linear-gradient(45deg, #000, rgba(0,0,0,0.95) 60%, hsl(41, 60%, 30%) 100%)",
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Admin-header*/}
              {/* logo */}
              <div className="flex items-center"></div>
              {/* Admin Name and photo */}
              {isAdmin ? (
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden border border-white">
                  <User className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                </div>
                  <h1 className="text-base md:text-lg font-light text-white whitespace-nowrap">
                  Bienvenido/a, {adminName}
                </h1>

                {/* Notification Button */}
                <button className="p-2 rounded-full bg-primary/10 hover:bg-primary/20">
                  <Bell className="h-5 w-5 text-primary" />
                </button>

                {/* Logout Button */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleLogout}
                        className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/20"
                      >
                        <LogOut className="h-5 w-5 text-white" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Log out</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
          ) : (
            <>
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      pathname === item.href ? "text-primary" : "text-white"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Search, Cart, User - Desktop */}
              <div className="hidden md:flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-black"
                >
                  <Search className="h-5 w-5" />
                </Button>
                <Link href="/carrito">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:text-black"
                  >
                    <ShoppingCart className="h-5 w-5" />
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:text-black"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Link href="/login" className="w-full">
                        Iniciar Sesión
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/registro" className="w-full">
                        Registrarse
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
          </div>

          {/* Mobile Menu Button */}
          {!isAdmin && (
          <div className="flex md:hidden items-center space-x-4">
            <Link href="/carrito">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-black"
              >
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-black"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
            )}
        {/* Mobile Menu */}
        {!isAdmin && isMenuOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium px-2 py-1 rounded transition-colors ${
                    pathname === item.href
                      ? "text-primary bg-white/10"
                      : "text-white hover:text-primary hover:bg-white/5"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-white/20 pt-4 flex flex-col space-y-2">
                <Link
                  href="/login"
                  className="text-sm font-medium text-white hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/registro"
                  className="text-sm font-medium text-white hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Registrarse
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
