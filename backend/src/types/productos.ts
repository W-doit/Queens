
// Base model interface for Odoo objects
export interface OdooModel {
  id: number;
  create_date?: string;
  write_date?: string;
}

// Size information for product variants
export interface SizeInfo {
  id: number;
  name: string;
  product_id: number;
  qty_available?: number;
  barcode?: string;
}

// Color information for product variants
export interface ColorInfo {
  id: number;
  name: string;
  product_id: number;
  hex_code?: string;
}

// Product Template from Odoo
export interface ProductTemplate extends OdooModel {
  name: string;
  list_price: number;
  type: "product" | "service" | "consu";
  barcode?: string;
  default_code?: string;
  image_1920?: string;
  image_128?: string;
  description?: string;
  description_sale?: string;
  qty_available?: number;
  categ_id?: [number, string] | false;
  product_variant_ids?: number[];
  attribute_line_ids?: number[];
  sale_ok?: boolean;
  purchase_ok?: boolean;
}

// Product Variant from Odoo
export interface ProductVariant extends OdooModel {
  product_tmpl_id: [number, string];
  name: string;
  barcode?: string;
  default_code?: string;
  qty_available?: number;
  product_template_attribute_value_ids?: number[];
  combination_indices?: string;
}

// Product Category
export interface ProductCategory extends OdooModel {
  name: string;
  parent_id?: [number, string] | false;
  complete_name?: string;
  child_id?: number[];
}

// Request body for creating a product
export interface CreateProductRequest {
  name: string;
  list_price: number;
  type?: "product" | "service" | "consu";
  categ_id?: number;
  barcode?: string;
  description?: string;
  default_code?: string;
  sale_ok?: boolean;
  purchase_ok?: boolean;
  has_sizes?: boolean;
  sizes?: string[];
  has_colors?: boolean;
  colors?: string[];
  image_1920?: string;
}

// Request body for updating a product
export interface UpdateProductRequest {
  name?: string;
  list_price?: number;
  type?: "product" | "service" | "consu";
  categ_id?: number;
  barcode?: string;
  description?: string;
  default_code?: string;
  sale_ok?: boolean;
  purchase_ok?: boolean;
  sizes?: string[];
  colors?: string[];
  image_1920?: string;
}

// API response format for a product
export interface ProductResponse {
  id: number;
  name: string;
  list_price: number;
  type: string;
  barcode?: string;
  categ_id?: [number, string] | false;
  description?: string;
  description_sale?: string;
  image_url?: string;
  qty_available?: number;
  default_code?: string;
  sizes?: SizeInfo[];
  colors?: ColorInfo[];
}

// API response for paginated product list
export interface ProductListResponse {
  products: ProductResponse[];
  total: number;
  page: number;
  limit: number;
}

// Request for updating product inventory
export interface UpdateInventoryRequest {
  product_id: number;
  variant_id?: number;
  qty_change: number;
  location_id?: number;
  reason?: string;
}

// API response for inventory update
export interface InventoryUpdateResponse {
  product_id: number;
  variant_id?: number;
  new_qty: number;
  success: boolean;
  message: string;
}

// Product variant representation (expanded)
export interface ProductVariant extends OdooModel {
  name: string;
  product_tmpl_id?: number[];
  product_template_attribute_value_ids?: number[];
  qty_available?: number;
  barcode?: string | boolean;
  display_name?: string;
  virtual_available?: number;
  incoming_qty?: number;
  outgoing_qty?: number;
  [key: string]: any;
}

// Variant update information
export interface VariantUpdates {
  name?: string;
  barcode?: string;
  [key: string]: any;
}

// Updated variant information
export interface UpdatedVariant {
  id: number;
  updates?: string[];
  name: string;
  barcode?: string | boolean;
}