
import axios from "axios";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Get configuration from environment variables
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

// Cache UID between calls to avoid authenticating on every request
let cachedUID: number | null = null;
let lastAuthTime: number = 0;
const AUTH_CACHE_DURATION = 3600000; // 1 hour in milliseconds

// Authenticate and get UID from Odoo
export async function authenticate(): Promise<number> {
  // Use cached UID if available and not expired
  const now = Date.now();
  if (cachedUID && now - lastAuthTime < AUTH_CACHE_DURATION) {
    return cachedUID;
  }

  // Only log auth once when actually authenticating
  console.log("🔐 Authenticating with Odoo API...");

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

  try {
    const response = await axios.post<OdooAuthResponse>(
      JSON_RPC_ENDPOINT,
      payload
    );

    if (
      typeof response.data.result !== "number" ||
      response.data.result === 0
    ) {
      throw new Error("Authentication failed");
    }

    // Cache the successful authentication
    cachedUID = response.data.result;
    lastAuthTime = now;
    return cachedUID;
  } catch (error: any) {
    console.error("❌ Authentication error:", error.message);
    throw error;
  }
}

// Call any Odoo model/method via JSON-RPC
export async function callOdoo<T = any>(
  model: string,
  method: string,
  args: any[],
  kwargs: Record<string, any> = {}
): Promise<T> {
  // More targeted logging - only log methods that change data
  const isWriteMethod = ["create", "write", "unlink"].includes(method);
  if (isWriteMethod) {
    console.log(
      `📝 ${model}.${method}:`,
      method === "create"
        ? "Creating new record"
        : method === "write"
        ? `Updating record(s): ${args[0]}`
        : method === "unlink"
        ? `Deleting record(s): ${args[0]}`
        : ""
    );
  }

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

  try {
    const response = await axios.post<OdooCallResponse<T>>(
      JSON_RPC_ENDPOINT,
      payload
    );

    // Only log success for write operations
    if (isWriteMethod) {
      console.log(
        `✅ ${model}.${method} successful:`,
        method === "create"
          ? `Created with ID: ${response.data.result}`
          : method === "write"
          ? "Update complete"
          : method === "unlink"
          ? "Delete complete"
          : "Operation complete"
      );
    }

    return response.data.result;
  } catch (error: any) {
    console.error(`❌ Error with ${model}.${method}:`, error.message);
    throw error;
  }
}
