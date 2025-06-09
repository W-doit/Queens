import { fetchProductoById } from "@/lib/odoo";
import ProductDetailClient from "./ProductDetailClient";

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await fetchProductoById(params.id);

  if (!product) {
    return <div className="p-8 text-center">Producto no encontrado</div>;
  }

  return <ProductDetailClient product={product} />;
}