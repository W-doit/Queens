import Link from "next/link";
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin, 
  Crown 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center">
                 <Image
                            src="/queens-logo.png"
                            alt="Queens Logo"
                            width={120}
                            height={40}
                            className="h-20 w-auto"
                            priority
                          />
              {/* <Crown className="h-8 w-8 text-primary" /> */}
              {/* <span className="ml-2 text-2xl font-bold font-playfair">Queens</span> */}
            </div>
            <p className="text-sm text-gray-400">
              Corona tu estilo con nuestra exclusiva colección de moda para la mujer moderna.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-white hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:text-primary">
                <Youtube className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Menu 1 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 font-playfair">Explorar</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/productos" className="text-sm text-gray-400 hover:text-primary">
                  Tienda
                </Link>
              </li>
              <li>
                <Link href="/categorias" className="text-sm text-gray-400 hover:text-primary">
                  Categorías
                </Link>
              </li>
              <li>
                <Link href="/vestidor-virtual" className="text-sm text-gray-400 hover:text-primary">
                  Vestidor Virtual
                </Link>
              </li>
              <li>
                <Link href="/ofertas" className="text-sm text-gray-400 hover:text-primary">
                  Ofertas Especiales
                </Link>
              </li>
              <li>
                <Link href="/nuevos" className="text-sm text-gray-400 hover:text-primary">
                  Nuevos Lanzamientos
                </Link>
              </li>
            </ul>
          </div>

          {/* Menu 2 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 font-playfair">Ayuda</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/sobre-nosotros" className="text-sm text-gray-400 hover:text-primary">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-sm text-gray-400 hover:text-primary">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/politica-de-envios" className="text-sm text-gray-400 hover:text-primary">
                  Envíos y Devoluciones
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-gray-400 hover:text-primary">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="text-sm text-gray-400 hover:text-primary">
                  Política de Privacidad
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 font-playfair">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span className="text-sm text-gray-400">
                  Av. Diagonal 123, 08021 Barcelona, España
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-primary mr-2" />
                <span className="text-sm text-gray-400">+34 93 123 45 67</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-primary mr-2" />
                <span className="text-sm text-gray-400">info@queensmoda.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Queens Moda. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}