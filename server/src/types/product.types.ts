export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: number;
  category_name: string;
  isAvailable: boolean;
  qty_available?: number;
  create_date: string;
}

export interface ProductQueryOptions {
  search?: string;
  category?: string | number;
  sort?: string;
  available?: boolean;
}
