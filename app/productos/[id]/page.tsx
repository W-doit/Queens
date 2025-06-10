import { fetchProductoById, mockProductos } from "@/lib/odoo";
import ProductDetailClient from "./ProductDetailClient";

export async function generateStaticParams() {
  return mockProductos.map(product => ({
    id: product.id.toString(),
  }));
}

export default async function ProductDetailPage(props: { params: { id: string } }) {
  const { params } = props;
  const product = await fetchProductoById(params.id);

  if (!product) {
    return <div className="p-8 text-center">Producto no encontrado</div>;
  }

  return <ProductDetailClient product={product} />;
}