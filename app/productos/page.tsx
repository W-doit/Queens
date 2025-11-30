"use client";

import { useEffect } from "react";

export default function ShopPage() {
  useEffect(() => {
    // Redirect to SumUp store
    window.location.href = "https://queensfashion.sumupstore.com/";
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Redirigiendo a nuestra tienda...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  );
}