"use client";   

import { createContext, useContext, useState } from "react";
import { ProductoOdoo } from "@/lib/odoo";

type FavoritesContextType = {
  favorites: ProductoOdoo[];
  addToFavorites: (product: ProductoOdoo) => void;
  removeFromFavorites: (id: number) => void;
  isFavorite: (id: number) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<ProductoOdoo[]>([]);

  const addToFavorites = (product: ProductoOdoo) => {
    setFavorites((prev) =>
      prev.find((p) => p.id === product.id) ? prev : [...prev, product]
    );
  };

  const removeFromFavorites = (id: number) => {
    setFavorites((prev) => prev.filter((p) => p.id !== id));
  };

  const isFavorite = (id: number) => favorites.some((p) => p.id === id);

  return (
    <FavoritesContext.Provider value={{ favorites, addToFavorites, removeFromFavorites, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites must be used within a FavoritesProvider");
  return context;
}