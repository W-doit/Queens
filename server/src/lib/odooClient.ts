import axios from "axios";

interface OdooClientConfig {
  url: string;
  db: string;
  username: string;
  password: string;
}

export class OdooClient {
  private url: string;
  private db: string;
  private username: string;
  private password: string;
  private uid: number | null = null;
  private session_id: string | null = null;

  constructor(config: OdooClientConfig) {
    this.url = config.url;
    this.db = config.db;
    this.username = config.username;
    this.password = config.password;
  }

  /**
   * Authenticate with Odoo and get a user ID
   */
  private async authenticate(): Promise<number> {
    if (this.uid) return this.uid;

    try {
      const response = await axios.post(`${this.url}/jsonrpc`, {
        jsonrpc: "2.0",
        method: "call",
        params: {
          service: "common",
          method: "login",
          args: [this.db, this.username, this.password],
        },
        id: Math.floor(Math.random() * 1000000),
      });

      if (response.data.error) {
        throw new Error(response.data.error.message || "Authentication failed");
      }

      this.uid = response.data.result;

      if (!this.uid) {
        throw new Error("Authentication failed: Invalid credentials");
      }

      return this.uid;
    } catch (error: any) {
      console.error("Odoo authentication error:", error.message);
      throw new Error(`Odoo authentication failed: ${error.message}`);
    }
  }

  /**
   * Execute a method on an Odoo model
   */
  public async executeKw(
    model: string,
    method: string,
    args: any[] = [],
    kwargs: any = {}
  ): Promise<any> {
    try {
      const uid = await this.authenticate();

      const response = await axios.post(`${this.url}/jsonrpc`, {
        jsonrpc: "2.0",
        method: "call",
        params: {
          service: "object",
          method: "execute_kw",
          args: [this.db, uid, this.password, model, method, args, kwargs],
        },
        id: Math.floor(Math.random() * 1000000),
      });

      if (response.data.error) {
        throw new Error(
          response.data.error.message || `Odoo API error: ${method} on ${model}`
        );
      }

      return response.data.result;
    } catch (error: any) {
      console.error(`Odoo API error (${model}.${method}):`, error.message);
      throw new Error(`Odoo API error (${model}.${method}): ${error.message}`);
    }
  }

  /**
   * Search for records
   */
  public async search(
    model: string,
    domain: any[] = [],
    options: any = {}
  ): Promise<number[]> {
    return this.executeKw(model, "search", [domain], options);
  }

  /**
   * Read record data
   */
  public async read(
    model: string,
    ids: number[],
    fields: string[] = []
  ): Promise<any[]> {
    return this.executeKw(model, "read", [ids, fields]);
  }

  /**
   * Search and read records in one call
   */
  public async searchRead(
    model: string,
    domain: any[] = [],
    fields: string[] = [],
    options: any = {}
  ): Promise<any[]> {
    return this.executeKw(model, "search_read", [domain, fields], options);
  }
}
