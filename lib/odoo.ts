// types
export interface SizeInfo {
  id: number;
  name: string;
  product_id: number;
  qty_available?: number;
  barcode?: string;
}

export interface ColorInfo {
  id: number;
  name: string;
  product_id: number;
  hex_code?: string;
}

export interface ProductoOdoo {
  id: number;
  name: string;
  list_price: number;
  type: string;
  barcode?: string;
  categ_id?: [number, string] | false;
  description?: string;
  description_sale?: string;
  image_url?: string;
  image_1920?: string;
  qty_available?: number;
  default_code?: string;
  sizes?: SizeInfo[];
  colors?: ColorInfo[];
  size?: string;
}



// Mock data
export const mockProductos: ProductoOdoo[] = [
  {
    id: 1,
    name: "Vestido Dorado Elegante",
    list_price: 129.99,
    type: "consumable",
    image_url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='gray'><rect x='3' y='3' width='18' height='18' rx='2' stroke-width='2'/><path d='M8 17l4-4 4 4' stroke-width='2'/><circle cx='9' cy='9' r='2' stroke-width='2'/></svg>",
    categ_id: [1, "Vestidos"],
    barcode: "",
    description: "",
    description_sale: "",
    image_1920: "",
    qty_available: 10,
    default_code: "VDE1",
    sizes: [],
    colors: [
      { id: 1, name: "dorado", product_id: 1, hex_code: "#FFD700" },
      { id: 2, name: "plateado", product_id: 1, hex_code: "#C0C0C0" },
      { id: 3, name: "negro", product_id: 1, hex_code: "#000000" }
    ],
    size: "M"
  },
  {
    id: 2,
    name: "Blusa Negra Satinada",
    list_price: 59.99,
    type: "consumable",
    image_url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='gray'><rect x='3' y='3' width='18' height='18' rx='2' stroke-width='2'/><path d='M8 17l4-4 4 4' stroke-width='2'/><circle cx='9' cy='9' r='2' stroke-width='2'/></svg>",
    categ_id: [2, "Blusas"],
    barcode: "",
    description: "",
    description_sale: "",
    image_1920: "",
    qty_available: 10,
    default_code: "BNS2",
    sizes: [],
    colors: [
      { id: 1, name: "negro", product_id: 2, hex_code: "#000000" },
      { id: 2, name: "blanco", product_id: 2, hex_code: "#FFFFFF" }
    ],
    size: "S"
  },
  {
    id: 3,
    name: "Falda Plisada Elegante",
    list_price: 79.99,
    type: "consumable",
    image_url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='gray'><rect x='3' y='3' width='18' height='18' rx='2' stroke-width='2'/><path d='M8 17l4-4 4 4' stroke-width='2'/><circle cx='9' cy='9' r='2' stroke-width='2'/></svg>",
    categ_id: [3, "Faldas"],
    barcode: "",
    description: "",
    description_sale: "",
    image_1920: "",
    qty_available: 10,
    default_code: "FPE3",
    sizes: [],
    colors: [
      { id: 1, name: "rojo", product_id: 3, hex_code: "#FF0000" },
      { id: 2, name: "azul", product_id: 3, hex_code: "#0000FF" }
    ],
    size: "XS"
  },
  {
    id: 4,
    name: "Conjunto Formal Dorado",
    list_price: 149.99,
    type: "consumable",
    image_url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='gray'><rect x='3' y='3' width='18' height='18' rx='2' stroke-width='2'/><path d='M8 17l4-4 4 4' stroke-width='2'/><circle cx='9' cy='9' r='2' stroke-width='2'/></svg>",
    categ_id: [4, "Conjuntos"],
    barcode: "",
    description: "",
    description_sale: "",
    image_1920: "",
    qty_available: 10,
    default_code: "CFD4",
    sizes: [],
    colors: [
      { id: 1, name: "dorado", product_id: 4, hex_code: "#FFD700" },
      { id: 2, name: "negro", product_id: 4, hex_code: "#000000" }
    ],
    size: "XL"
  },
  {
    id: 5,
    name: "Vestido Negro Formal",
    list_price: 119.99,
    type: "consumable",
    image_url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='gray'><rect x='3' y='3' width='18' height='18' rx='2' stroke-width='2'/><path d='M8 17l4-4 4 4' stroke-width='2'/><circle cx='9' cy='9' r='2' stroke-width='2'/></svg>",
    categ_id: [1, "Vestidos"],
    barcode: "",
    description: "",
    description_sale: "",
    image_1920: "",
    qty_available: 10,
    default_code: "VNF5",
    sizes: [],
    colors: [
      { id: 1, name: "negro", product_id: 5, hex_code: "#000000" },
      { id: 2, name: "blanco", product_id: 5, hex_code: "#FFFFFF" }
    ],
    size: "L"
  },
  {
    id: 6,
    name: "Falda Corta Elegante",
    list_price: 69.99,
    type: "consumable",
    image_url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='gray'><rect x='3' y='3' width='18' height='18' rx='2' stroke-width='2'/><path d='M8 17l4-4 4 4' stroke-width='2'/><circle cx='9' cy='9' r='2' stroke-width='2'/></svg>",
    categ_id: [3, "Faldas"],
    barcode: "",
    description: "",
    description_sale: "",
    image_1920: "",
    qty_available: 10,
    default_code: "FCE6",
    sizes: [],
    colors: [
      { id: 1, name: "azul", product_id: 6, hex_code: "#0000FF" },
      { id: 2, name: "blanco", product_id: 6, hex_code: "#FFFFFF" }
    ],
    size: "M"
  },
  {
    id: 7,
    name: "Blusa Dorada de Fiesta",
    list_price: 89.99,
    type: "consumable",
    image_url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='gray'><rect x='3' y='3' width='18' height='18' rx='2' stroke-width='2'/><path d='M8 17l4-4 4 4' stroke-width='2'/><circle cx='9' cy='9' r='2' stroke-width='2'/></svg>",
    categ_id: [2, "Blusas"],
    barcode: "",
    description: "",
    description_sale: "",
    image_1920: "",
    qty_available: 10,
    default_code: "BDF7",
    sizes: [],
    colors: [
      { id: 1, name: "dorado", product_id: 7, hex_code: "#FFD700" },
      { id: 2, name: "rojo", product_id: 7, hex_code: "#FF0000" }
    ],
    size: "S"
  },
  {
    id: 8,
    name: "Chaqueta Negra Elegante",
    list_price: 159.99,
    type: "consumable",
    image_url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='gray'><rect x='3' y='3' width='18' height='18' rx='2' stroke-width='2'/><path d='M8 17l4-4 4 4' stroke-width='2'/><circle cx='9' cy='9' r='2' stroke-width='2'/></svg>",
    categ_id: [5, "Chaquetas"],
    barcode: "",
    description: "",
    description_sale: "",
    image_1920: "",
    qty_available: 10,
    default_code: "CNE8",
    sizes: [],
    colors: [
      { id: 1, name: "negro", product_id: 8, hex_code: "#000000" },
      { id: 2, name: "azul", product_id: 8, hex_code: "#0000FF" },
      { id: 3, name: "plateado", product_id: 8, hex_code: "#C0C0C0" }
    ],
    size: "L"
  }
];


export async function fetchProductosApi(): Promise<ProductoOdoo[]> {
  try {
    const res = await fetch("/api/productos");
    if (!res.ok) throw new Error("Error fetching products");
    return res.json();
  } catch (error) {
    // Return mockup data if API fails
    console.error("Error fetching products from API, returning mock data:", error);
    return mockProductos;
  }
}

export async function fetchProductoById(id: string | number): Promise<ProductoOdoo> {
  try {
    const res = await fetch(`/api/productos/${id}`);
    if (!res.ok) throw new Error("Error fetching product");
    return res.json();
  } catch (error) {
    // Search in mock data if API fails
    const producto = mockProductos.find(p => p.id === Number(id));
    if (!producto) throw new Error("Producto mock no encontrado");
    return producto;
  }
}
