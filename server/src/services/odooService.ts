import axios from "axios";
import config from "../config";
import { Product, ProductQueryOptions } from "../types/product.types";

export class OdooService {
  private readonly odooUrl: string;
  private readonly db: string;
  private readonly username: string;
  private readonly password: string;
  private uid: number | null = null;

  constructor() {
    this.odooUrl = config.odoo.url;
    this.db = config.odoo.db;
    this.username = config.odoo.username;
    this.password = config.odoo.password;
  }

  /**
   * Authenticate with Odoo and get user ID
   * @returns User ID
   */
  private async authenticate(): Promise<number> {
    if (this.uid) return this.uid;

    try {
      const response = await axios.post(`${this.odooUrl}/jsonrpc`, {
        jsonrpc: "2.0",
        method: "call",
        params: {
          service: "common",
          method: "login",
          args: [this.db, this.username, this.password],
        },
        id: new Date().getTime(),
      });

      if (response.data.error) {
        throw new Error(
          `Authentication failed: ${response.data.error.message}`
        );
      }

      this.uid = response.data.result;
      return this.uid;
    } catch (error: any) {
      console.error("OdooService: Authentication error:", error);
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  /**
   * Execute Odoo RPC call
   * @param model Odoo model name
   * @param method Method to call
   * @param args Arguments for the method
   * @param kwargs Additional keyword arguments
   * @returns API response
   */
  private async executeKw(
    model: string,
    method: string,
    args: any[] = [],
    kwargs: any = {}
  ): Promise<any> {
    try {
      const uid = await this.authenticate();

      const response = await axios.post(`${this.odooUrl}/jsonrpc`, {
        jsonrpc: "2.0",
        method: "call",
        params: {
          service: "object",
          method: "execute_kw",
          args: [this.db, uid, this.password, model, method, args, kwargs],
        },
        id: new Date().getTime(),
      });

      if (response.data.error) {
        throw new Error(
          `Odoo API error: ${
            response.data.error.message || JSON.stringify(response.data.error)
          }`
        );
      }

      return response.data.result;
    } catch (error: any) {
      console.error(`OdooService: Error executing ${model}.${method}:`, error);
      throw new Error(`Failed to execute ${model}.${method}: ${error.message}`);
    }
  }

  /**
   * Fetch all products from Odoo with optional filtering and sorting
   * @param options Query options for filtering and sorting
   * @returns Array of products
   */
  public async fetchAllProducts(
    options?: ProductQueryOptions
  ): Promise<Product[]> {
    try {
      console.log("OdooService: Fetching products with options:", options);

      // Build domain filters for Odoo query
      let domain: any[] = [["sale_ok", "=", true]]; // Only include products that can be sold

      // Add search term filter if provided
      if (options?.search) {
        domain.push([
          "|", // OR operator
          ["name", "ilike", options.search],
          ["description", "ilike", options.search],
        ]);
      }

      // Add category filter if provided
      if (options?.category) {
        // Handle both string and number category identifiers
        const categoryId =
          typeof options.category === "string"
            ? isNaN(Number(options.category))
              ? options.category // Category name string
              : Number(options.category) // Category ID as string
            : options.category; // Category ID as number

        if (typeof categoryId === "string") {
          domain.push(["categ_id.name", "ilike", categoryId]);
        } else {
          domain.push(["categ_id", "child_of", categoryId]);
        }
      }

      // Add availability filter if specified
      if (options?.available === true) {
        domain.push(["qty_available", ">", 0]); // Only products with stock
      } else if (options?.available === false) {
        domain.push(["qty_available", "<=", 0]); // Only products without stock
      }

      // Define fields to retrieve
      const fields = [
        "id",
        "name",
        "description",
        "list_price",
        "image_1920",
        "categ_id",
        "qty_available",
        "create_date",
      ];

      // Determine sort order
      let order = "name asc"; // Default sorting
      if (options?.sort) {
        switch (options.sort) {
          case "price-asc":
            order = "list_price asc";
            break;
          case "price-desc":
            order = "list_price desc";
            break;
          case "newest":
            order = "create_date desc";
            break;
          case "name-asc":
            order = "name asc";
            break;
          case "name-desc":
            order = "name desc";
            break;
          // Default to name asc for unknown sort options
        }
      }

      // Execute Odoo query with explicit params
      const result = await this.executeKw(
        "product.template",
        "search_read",
        [domain, fields],
        { order }
      );

      // Transform the result
      return result.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description || "",
        price: item.list_price,
        image_url: item.image_1920
          ? `data:image/png;base64,${item.image_1920}`
          : "/images/placeholder.jpg",
        category_id: item.categ_id[0],
        category_name: item.categ_id[1],
        isAvailable: item.qty_available > 0,
        qty_available: item.qty_available,
        create_date: item.create_date,
      }));
    } catch (error: any) {
      console.error("OdooService: Error fetching products:", error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  }

  /**
   * Fetch a single product by ID
   * @param id Product ID
   * @returns Product details or null if not found
   */
  public async fetchProductById(id: number): Promise<Product | null> {
    try {
      console.log(`OdooService: Fetching product with ID ${id}`);

      const domain = [["id", "=", id]];
      const fields = [
        "id",
        "name",
        "description",
        "list_price",
        "image_1920",
        "categ_id",
        "qty_available",
        "create_date",
      ];

      const result = await this.executeKw("product.template", "search_read", [
        domain,
        fields,
      ]);

      if (!result || result.length === 0) {
        return null;
      }

      const item = result[0];
      return {
        id: item.id,
        name: item.name,
        description: item.description || "",
        price: item.list_price,
        image_url: item.image_1920
          ? `data:image/png;base64,${item.image_1920}`
          : "/images/placeholder.jpg",
        category_id: item.categ_id[0],
        category_name: item.categ_id[1],
        isAvailable: item.qty_available > 0,
        qty_available: item.qty_available,
        create_date: item.create_date,
      };
    } catch (error: any) {
      console.error(`OdooService: Error fetching product ${id}:`, error);
      throw new Error(`Failed to fetch product: ${error.message}`);
    }
  }

  /**
   * Fetch products by category ID
   * @param categoryId Category ID
   * @returns Array of products in the category
   */
  public async fetchProductsByCategory(
    categoryId: string | number
  ): Promise<Product[]> {
    const catId =
      typeof categoryId === "string" ? Number(categoryId) : categoryId;
    return this.fetchAllProducts({ category: catId });
  }

  /**
   * Search products by query term
   * @param query Search query
   * @returns Array of matching products
   */
  public async searchProducts(query: string): Promise<Product[]> {
    return this.fetchAllProducts({ search: query });
  }
}
