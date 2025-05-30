"use client";

import { useState, useEffect } from "react";
import ProductList from '@/components/productos/product-list';
import ProductFilters from '@/components/productos/product-filters';
import { fetchProductosMock, ProductoOdoo } from '@/lib/odoo';



export default function ProductosPage() {
  const [products, setProducts] = useState<ProductoOdoo[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductoOdoo[]>([]);

   const [filters, setFilters] = useState({
    categories: [] as string[],
    sizes: [] as string[],
    colors: [] as string[],
    priceRange: [0, 300] as [number, number],
  });

   useEffect(() => {
    fetchProductosMock().then((data) => {
      setProducts(data);
      setFilteredProducts(data);
    });
  }, []);

    useEffect(() => {
    const filtered = products.filter((product) => {
      const matchesCategory =
        filters.categories.length === 0 ||
        filters.categories.includes(product.categ_id[1].toLowerCase());

 const matchesPrice =
        product.list_price >= filters.priceRange[0] &&
        product.list_price <= filters.priceRange[1];
        
        const matchesSize = true;
      const matchesColor = true;


      return matchesCategory && matchesPrice && matchesSize && matchesColor;
    });

    setFilteredProducts(filtered);
  }, [filters, products]);
        


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 font-playfair">Nuestra Colección</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Descubre nuestras prendas exclusivas diseñadas para realzar tu estilo personal
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/4">
          <ProductFilters filters={filters} setFilters={setFilters} />
        </div>
        <div className="md:w-3/4">
          <ProductList products={filteredProducts}/>
        </div>
      </div>
    </div>
  );
}