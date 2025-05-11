"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingCart, User, Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

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

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? "shadow-md py-2" 
          : "py-4"
      }`}
      style={{
        background: "linear-gradient(45deg, #000 50%, rgba(0,0,0,0.95) 60%, hsl(41, 60%, 30%) 100%)"
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo is now in hero-section*/}
          {/* <Link href="/" className="flex items-center">
            <Image
              src="/queens-logo.png"
              alt="Queens Logo"
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link> */}

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
            <Button variant="ghost" size="icon" className="text-white hover:text-black">
              <Search className="h-5 w-5" />
            </Button>
            <Link href="/carrito">
              <Button variant="ghost" size="icon" className="text-white hover:text-black">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:text-black">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link href="/login" className="w-full">Iniciar Sesión</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/registro" className="w-full">Registrarse</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-4">
            <Link href="/carrito">
              <Button variant="ghost" size="icon" className="text-white hover:text-black">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:text-black"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
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