"use client";

// import ProductList from '@/components/productos/product-list';
// import ProductFilters from '@/components/productos/product-filters';
import OdooShopIframe from "@/components/productos/OdooShopIframe";
import { useState } from "react";
import { Loader2 } from "lucide-react";

// import { fetchProductosApi } from "@/lib/odoo";
// import { ProductoOdoo } from "@/lib/odoo";

export default function ProductosPage() {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      {!iframeLoaded && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "rgba(255,255,255,0.7)",
            zIndex: 20,
          }}
        >
          <Loader2 className="animate-spin h-12 w-12 text-primary" />
        </div>
      )}
      <OdooShopIframe onLoad={() => setIframeLoaded(true)} />
    </div>
  );
}