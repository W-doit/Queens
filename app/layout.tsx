import './globals.css';
import type { Metadata } from 'next';
import { Playfair_Display, Raleway } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { CartProvider } from "@/context/CartContext";
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';


const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const raleway = Raleway({
  subsets: ['latin'],
  variable: '--font-raleway',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Queens | Corona tu estilo',
  description: 'Tienda de moda elegante para la mujer moderna',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isHomePage = typeof window !== 'undefined' && window.location.pathname === '/';
  
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${playfair.variable} ${raleway.variable} font-sans min-h-screen flex flex-col ${isHomePage ? 'home-page' : ''}`}>
        <CartProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
        >
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer/>
          <Toaster />
        </ThemeProvider>
        </CartProvider>
      </body>
    </html>
  );
}