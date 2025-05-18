// Request/response types for inventory operations
export interface UpdateInventoryRequest {
  product_id?: number;
  variant_id?: number;
  qty_change: number;
  location_id?: number;
  reason?: string;
}

export interface InventoryUpdateResponse {
  product_id: number | null;
  variant_id: number;
  variant_name: string;
  new_qty: number;
  success: boolean;
  message: string;
}

export interface Location {
  id: number;
  name: string;
  complete_path?: string;
}

export interface VariantInventory {
  variant_id: number;
  variant_name: string;
  size?: string;
  color?: string;
  qty_available: number;
  qty_virtual: number;
  qty_incoming: number;
  qty_outgoing: number;
  barcode?: string;
}

export interface ProductInventory {
  product_id: number;
  product_name: string;
  variants: VariantInventory[];
}

export interface InventoryMovement {
  id: number;
  reference: string;
  origin?: string;
  product_id: number;
  product_name: string;
  quantity: number;
  from_location: {
    id: number;
    name: string;
  };
  to_location: {
    id: number;
    name: string;
  };
  state: string;
  date: string;
  type: "inbound" | "outbound" | "internal";
}

export interface MovementsResponse {
  movements: InventoryMovement[];
  total: number;
  page: number;
  limit: number;
}
