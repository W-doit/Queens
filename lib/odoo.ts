//mockup function
export async function fetchProductosMock(): Promise<ProductoOdoo[]> {
  return [
  {
    id: 1,
    name: "Vestido Dorado Elegante",
    list_price: 129.99,
    image_1920: "https://images.pexels.com/photos/7319464/pexels-photo-7319464.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    categ_id: [1, "Vestidos"],
  },
  {
    id: 2,
    name: "Blusa Negra Satinada",
    list_price:  59.99,
    image_1920: "https://images.pexels.com/photos/7319464/pexels-photo-7319464.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    categ_id: [2, "Blusas"],
  },
  {
    id: 3,
    name: "Falda Plisada Elegante",
    list_price:  79.99,
    image_1920: "https://images.pexels.com/photos/7319464/pexels-photo-7319464.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    categ_id: [3, "Faldas"],
  },
  {
    id: 4,
    name: "Conjunto Formal Dorado",
    list_price:  149.99,
    image_1920: "https://images.pexels.com/photos/7319464/pexels-photo-7319464.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    categ_id: [4, "Conjuntos"],
  },
  {
    id: 5,
    name: "Vestido Negro Formal",
    list_price:  119.99,
    image_1920: "https://images.pexels.com/photos/7319464/pexels-photo-7319464.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    categ_id: [1, "Vestidos"],
  },
  {
    id: 6,
    name: "Falda Corta Elegante",
    list_price:  69.99,
    image_1920: "https://images.pexels.com/photos/7319464/pexels-photo-7319464.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    categ_id: [3, "Faldas"],
  },
  {
    id: 7,
    name: "Blusa Dorada de Fiesta",
    list_price:  89.99,
    image_1920: "",
    categ_id: [2, "Blusas"],
  },
  {
    id: 8,
    name: "Chaqueta Negra Elegante",
    list_price:  159.99,
    image_1920: "https://images.pexels.com/photos/7319464/pexels-photo-7319464.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    categ_id: [5, "Chaquetas"],
  },
];
}

//types
export interface ProductoOdoo {
  id: number;
  name: string;
  list_price: number;
  image_1920?: string;
  categ_id: [number, string];
}

interface JsonRpcResponse<T> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

const ODOO_URL = "https://your-odoo-domain.com/jsonrpc"; //replace for odoo domain
const DB = "DB_NAME"; //replace for odoo database name
const UID = 2; //replace for the user id
const PASSWORD = "your_password"; //replace for odoo user password

//fetch products from odoo
export async function fetchProductosOdoo(): Promise<ProductoOdoo[]> {
  const res = await fetch(ODOO_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "object",
        method: "execute_kw",
        args: [
          DB,
          UID,
          PASSWORD,
          "product.template",
          "search_read",
          [[["sale_ok", "=", true]]],
          {
            fields: ["id", "name", "price", "image_1920", "categ_id"],
            limit: 50,
          },
        ],
      },
      id: Math.floor(Math.random() * 100000),
    }),
  });

  const json: JsonRpcResponse<ProductoOdoo[]> = await res.json();

  if (json.error) {
    throw new Error(`Odoo RPC Error: ${json.error.message}`);
  }

  return json.result ?? [];
}
