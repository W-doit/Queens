// import { fetchProductoById, mockProductos } from "@/lib/odoo";
// import ProductDetailClient from "./ProductDetailClient";

// export async function generateStaticParams() {
//   return mockProductos.map(product => ({
//     id: product.id.toString(),
//   }));
// }

// export default async function Page({ params }: { params: { id: string } }) {
//   const product = await fetchProductoById(params.id);
//
//   if (!product) {
//     return <div className="p-8 text-center">Producto no encontrado</div>;
//   }
//
//   return <ProductDetailClient product={product} />;
// }

// Minimal placeholder to satisfy Next.js dynamic route requirements
export default function ProductPage() {
  return null;
}