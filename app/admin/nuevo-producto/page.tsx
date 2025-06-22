// import ProductForm from "@/components/productos/product-form"; No need for the moment, we use odoo iframe
import OdooIframe from "@/components/productos/odoo-Iframe";

export default function NuevoProducto() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-playfair">Crear nuevo producto</h1>
      <OdooIframe />
    </div>
  );
}
