/**
 * Currency type used in the system
 */
export type Currency = "EUR" | "USD" | "GBP";

/**
 * Unit of measurement
 */
export type Unit = "Unidades" | "Kg" | "g" | "L" | "ml";

/**
 * Product interface based on the CSV structure
 * Using string for category to allow flexibility
 */
export interface Product {
  id: number;
  name: string;
  internalReference: string | null; // "Referencia interna"
  currency: Currency;
  category: string; // Using string instead of enum for flexibility
  numberOfVariants: number; // "# Variantes de producto"
  salePrice: number; // "Precio de venta"
  actualQuantity: number; // "Cantidad real"
  unit: Unit;
  properties?: string; // "Propiedades"
  // Additional fields that might be in Odoo but not in CSV
  description?: string;
  imageUrl?: string;
  barcode?: string;
  weight?: number;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Product stock information
 */
export interface ProductStock {
  productId: number;
  quantity: number;
  availableQuantity: number;
  warehouseId?: number;
  warehouseName?: string;
  locationId?: number;
}

/**
 * Product price information
 */
export interface ProductPrice {
  productId: number;
  listPrice: number; // Regular price
  salePrice: number; // Current selling price
  currency: Currency;
  priceDiscount?: number; // Discount percentage
}

/**
 * Product search parameters
 */
export interface ProductSearchParams {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: "name" | "price" | "category";
  sortOrder?: "asc" | "desc";
}

/**
 * Product search results
 */
export interface ProductSearchResult {
  products: Product[];
  totalCount: number;
  limit: number;
  offset: number;
}

/**
 * Common categories found in the system (for reference only)
 * This is not used for type checking, but as a reference
 */
export const COMMON_CATEGORIES = {
  SIN_CATEGORIA: "Sin categoría",
  BANADOR: "Bañador",
  BIKINI: "Bikini",
  BODY: "Body",
  BOLSO: "Bolso",
  TOPS: "Tops",
  CHAQUETA: "Chaqueta",
  CHALECO: "Chaleco",
  CONJUNTOS: "Conjuntos",
  FALDAS: "Faldas",
  MONO: "Mono",
  PAREO: "Pareo",
  INTERIOR: "Interior",
  PIJAMA: "Pijama",
  SANDALIA: "Sandalia",
  PANTALONES: "Pantalones",
  TACONES: "Tacones",
} as const;

/**
 * Sample product data to represent what we have in the CSV
 * This could be used for testing or initial data seeding
 */
export const sampleProducts: Partial<Product>[] = [
  {
    name: "Anillos",
    internalReference: null,
    currency: "EUR",
    category: "Sin categoría",
    numberOfVariants: 1,
    salePrice: 3.0,
    actualQuantity: 20.0,
    unit: "Unidades",
  },
  {
    name: "Anillos Grandes",
    internalReference: null,
    currency: "EUR",
    category: "Sin categoría",
    numberOfVariants: 1,
    salePrice: 5.0,
    actualQuantity: 0.0,
    unit: "Unidades",
  },
  {
    name: "BODY LISO",
    internalReference: "6123",
    currency: "EUR",
    category: "Sin categoría",
    numberOfVariants: 1,
    salePrice: 19.99,
    actualQuantity: 3.0,
    unit: "Unidades",
  },
  {
    name: "BRAZERAS",
    internalReference: null,
    currency: "EUR",
    category: "Sin categoría",
    numberOfVariants: 1,
    salePrice: 350.0,
    actualQuantity: 3.0,
    unit: "Unidades",
  },
  {
    name: "Bañador",
    internalReference: null,
    currency: "EUR",
    category: "Bañador",
    numberOfVariants: 1,
    salePrice: 13.99,
    actualQuantity: 5.0,
    unit: "Unidades",
  },
  {
    name: "Bikini cascos 2 bragas",
    internalReference: null,
    currency: "EUR",
    category: "Bikini",
    numberOfVariants: 1,
    salePrice: 11.99,
    actualQuantity: 28.0,
    unit: "Unidades",
  },
];
