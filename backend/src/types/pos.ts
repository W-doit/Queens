// POS types (sales, sessions, etc.)

// POS types (sales, sessions, etc.)

export interface POSOrderRequest {
  partner_id?: number;
  note?: string;
}

export interface OrderLineRequest {
  product_id: number;
  quantity: number;
  price_unit?: number;
  discount?: number;
}

export interface DiscountRequest {
  discount_type: "percentage" | "fixed";
  discount_value: number;
  line_id?: number; // If provided, apply to specific line, otherwise apply to whole order
}

export interface PaymentRequest {
  payment_method: string | number; // Either method ID or 'cash'/'card'
  amount: number;
}

export interface POSSessionResponse {
  active: boolean;
  session_id?: number;
  name?: string;
  user?: string;
  start_time?: string;
  config_name?: string;
  message?: string;
}

export interface POSOrderResponse {
  id: number;
  name: string;
  date_order: string;
  partner_id: [number, string] | false;
  amount_total: number;
  state: string;
  pos_reference: string;
  session_id: [number, string];
  lines?: POSOrderLineResponse[];
}

export interface POSOrderLineResponse {
  id: number;
  product_id: [number, string];
  qty: number;
  price_unit: number;
  price_subtotal: number;
  price_subtotal_incl: number;
  discount: number;
}

export interface POSPaymentResponse {
  id: number;
  payment_method_id: [number, string];
  amount: number;
}

export interface ReceiptResponse {
  company: {
    name: string;
    address: string;
    vat: string;
    phone: string;
    email: string;
  };
  order: {
    id: number;
    name: string;
    date: string;
    reference: string;
    customer: string;
  };
  lines: {
    product: string;
    quantity: number;
    unit_price: number;
    discount: number;
    subtotal: number;
  }[];
  payments: {
    method: string;
    amount: number;
  }[];
  totals: {
    subtotal: number;
    tax: number;
    total: number;
  };
}

export interface POSPaymentMethod {
  id: number;
  name: string;
  is_cash_count: boolean;
}

export interface ProductSearchResult {
  id: number;
  name: string;
  list_price: number;
  barcode: string | boolean;
  default_code: string | boolean;
}
