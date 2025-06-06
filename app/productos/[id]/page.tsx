import { fetchProductosMock, ProductoOdoo } from "@/lib/odoo";
import ProductDetailClient from "./ProductDetailClient";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> })  {
  const resolvedParams = await params;
  const products = await fetchProductosMock();
  const product = products.find((p) => p.id === Number(resolvedParams.id)) || null;

  if (!product) {
    return <div className="p-8 text-center">Producto no encontrado</div>;
  }

  return <ProductDetailClient product={product} />;
}

export async function generateStaticParams() {
  const products = await fetchProductosMock();
  return products.map((product) => ({
    id: product.id.toString(),
  }));
}