"use client";

// import ProductList from '@/components/productos/product-list';
// import ProductFilters from '@/components/productos/product-filters';
import OdooShopIframe from "@/components/productos/OdooShopIframe";
import { useState, useEffect } from "react";
import { fetchProductosApi } from "@/lib/odoo";
import { ProductoOdoo } from "@/lib/odoo";


export default function ProductosPage() {
//   const [products, setProducts] = useState<ProductoOdoo[]>([]);
//   const [filteredProducts, setFilteredProducts] = useState<ProductoOdoo[]>([]);
//   const [sort, setSort] = useState("relevancia");

//   const [filters, setFilters] = useState({
//     categories: [] as string[],
//     sizes: [] as string[],
//     colors: [] as string[],
//     priceRange: [0, 300] as [number, number],
//   });

// useEffect(() => {
//   fetchProductosApi().then((data) => {
//     setProducts(data);
//     setFilteredProducts(data);
//   });
// }, []);

  // useEffect(() => {
  //   let filtered = products.filter((product) => {
      //category filter
//  const matchesCategory =
//   filters.categories.length === 0 ||
//   (
//     Array.isArray(product.categ_id) &&
//     filters.categories.includes(product.categ_id[1].toLowerCase())
//   );
      //price filter
      // const matchesPrice =
      //   product.list_price >= filters.priceRange[0] &&
      //   product.list_price <= filters.priceRange[1];
  //size filter
      // const matchesSize =
      //   filters.sizes.length === 0 ||
      //   (product.size && filters.sizes.includes(product.size.toLowerCase()));
//color filter
// const matchesColor =
//   filters.colors.length === 0 ||
//   (product.colors &&
//     product.colors.some((color) =>
//       filters.colors.includes(color.name.toLowerCase())
//     ));

  //     return matchesCategory && matchesPrice && matchesSize && matchesColor;
  //   });

  //   switch (sort) {
  //     case "precio-menor-mayor":
  //       filtered = [...filtered].sort((a, b) => a.list_price - b.list_price);
  //       break;
  //     case "precio-mayor-menor":
  //       filtered = [...filtered].sort((a, b) => b.list_price - a.list_price);
  //       break;
  //     case "recientes":
  //       filtered = [...filtered].sort((a, b) => b.id - a.id);
  //     default:
  //       // relevance?
  //       break;
  //   }

  //   setFilteredProducts(filtered);
  // }, [filters, products, sort]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 font-playfair">
          Nuestra Colección
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Descubre nuestras prendas exclusivas diseñadas para realzar tu estilo
          personal
        </p>
      </div>
    
      
      {/* <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/4">
          <ProductFilters filters={filters} setFilters={setFilters} />
        </div>
        <div className="md:w-3/4">
          <ProductList
            products={filteredProducts}
            sort={sort}
            setSort={setSort}
          />
        </div>
      </div> */}
      <OdooShopIframe />
    </div>
  );
}
