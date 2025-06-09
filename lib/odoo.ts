
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


export async function fetchProductosApi(): Promise<ProductoOdoo[]> {
  const res = await fetch("http://localhost:3001/api/productos");
  if (!res.ok) throw new Error("Error fetching products");
  return res.json();
}

export async function fetchProductoById(id: string | number): Promise<ProductoOdoo> {
  const res = await fetch(`http://localhost:3001/api/productos/${id}`);
  if (!res.ok) throw new Error("Error fetching product");
  return res.json();
}

