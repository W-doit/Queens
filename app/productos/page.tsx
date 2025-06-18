import ProductList from '@/components/productos/product-list';
import ProductFilters from '@/components/productos/product-filters';
import OdooShopIframe from "@/components/productos/OdooShopIframe";
import Footer from '@/components/layout/footer';

export default function ProductosPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 font-playfair">Nuestra Colección</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Descubre nuestras prendas exclusivas diseñadas para realzar tu estilo personal
        </p>
      </div>
    
      
      {/* <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/4">
          <ProductFilters />
        </div>
        <div className="md:w-3/4">
          <ProductList />
        </div>
      </div> */}
      <OdooShopIframe />
    </div>
  );
}