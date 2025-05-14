import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const ODOO_URL = process.env.ODOO_URL || "";
const ODOO_DB = process.env.ODOO_DB || "";
const ODOO_USER = process.env.ODOO_USER || "";
const ODOO_PASSWORD = process.env.ODOO_PASSWORD || "";

const JSON_RPC_ENDPOINT = `${ODOO_URL}/jsonrpc`;

interface OdooAuthResponse {
  result: number;
}

interface OdooCallResponse<T = any> {
  result: T;
}

// Authenticate and get UID from Odoo
export async function authenticate(): Promise<number> {
  console.log("🔐 Authenticating with Odoo:", {
    db: ODOO_DB,
    username: ODOO_USER,
    password: ODOO_PASSWORD,
  });

  const payload = {
    jsonrpc: "2.0",
    method: "call",
    params: {
      service: "common",
      method: "authenticate",
      args: [ODOO_DB, ODOO_USER, ODOO_PASSWORD, {}],
    },
    id: Date.now(),
  };

  const response = await axios.post<OdooAuthResponse>(
    JSON_RPC_ENDPOINT,
    payload
  );

  if (typeof response.data.result !== "number" || response.data.result === 0) {
    throw new Error(
      "Authentication failed. Please check your Odoo credentials."
    );
  }

  return response.data.result;
}

// Call any Odoo model/method via JSON-RPC
export async function callOdoo<T = any>(
  model: string,
  method: string,
  args: any[],
  kwargs: Record<string, any> = {}
): Promise<T> {
  const uid = await authenticate();

  const payload = {
    jsonrpc: "2.0",
    method: "call",
    params: {
      service: "object",
      method: "execute_kw",
      args: [ODOO_DB, uid, ODOO_PASSWORD, model, method, args, kwargs],
    },
    id: Date.now(),
  };

  const response = await axios.post<OdooCallResponse<T>>(
    JSON_RPC_ENDPOINT,
    payload
  );

  return response.data.result;
}
