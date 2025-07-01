import { odooClient, testOdooConnection } from "../config/odooConfig";
import { Product } from "../types/product.types";

export class OdooService {
  constructor() {
    // Test the connection when service is initialized
    this.testConnection();
  }

  private async testConnection() {
    try {
      await testOdooConnection();
    } catch (error) {
      console.error(
        "Could not establish Odoo connection on service init:",
        error
      );
    }
  }

  public async fetchAllProducts(): Promise<Product[]> {
    try {
      console.log("Service: Attempting to connect to Odoo...");
      await odooClient.connect();

      console.log("Service: Connected to Odoo, fetching products...");
      // Use a simpler domain first to test basic connectivity
      const response = await odooClient.searchRead(
        "product.product",
        [], // Empty domain to fetch all products
        [
          "id",
          "name",
          "default_code",
          "list_price",
          "categ_id",
          "qty_available",
        ]
      );

      console.log(
        `Service: Successfully fetched ${response.length} products from Odoo`
      );

      // Map Odoo data to our Product interface
      return response.map((item: any) => ({
        id: item.id,
        name: item.name,
        internalReference: item.default_code || null,
        currency: "EUR",
        category: item.categ_id ? item.categ_id[1] : "Sin categoría",
        numberOfVariants: 1,
        salePrice: item.list_price,
        actualQuantity: item.qty_available || 0,
        unit: "Unidades",
        imageUrl: null, // Omit image for initial testing to reduce payload
      }));
    } catch (error: any) {
      console.error("Service: Error fetching products from Odoo:", error);

      // Try to provide more specific error information
      if (error.message && error.message.includes("connect")) {
        throw new Error(
          "Could not connect to Odoo server. Please check if Odoo is running."
        );
      } else if (error.message && error.message.includes("auth")) {
        throw new Error(
          "Authentication failed. Please check Odoo credentials."
        );
      } else if (error.message && error.message.includes("database")) {
        throw new Error(
          "Database error. Please check if the database exists and is accessible."
        );
      }

      throw new Error(`Failed to fetch products from Odoo: ${error.message}`);
    }
  }

  public async fetchProductById(id: number): Promise<Product | null> {
    try {
      console.log(
        `Service: Attempting to connect to Odoo to fetch product ${id}...`
      );
      await odooClient.connect();

      console.log(
        `Service: Connected to Odoo, fetching product with ID ${id}...`
      );
      const response = await odooClient.searchRead(
        "product.product",
        [["id", "=", id]],
        [
          "id",
          "name",
          "default_code",
          "list_price",
          "categ_id",
          "qty_available",
          "description",
          "description_sale",
        ]
      );

      if (!response || response.length === 0) {
        console.log(`Service: No product found with ID ${id} in Odoo`);
        return null;
      }

      console.log(
        `Service: Successfully fetched product with ID ${id} from Odoo`
      );

      // Map Odoo data to our Product interface
      const item = response[0];
      return {
        id: item.id,
        name: item.name,
        internalReference: item.default_code || null,
        currency: "EUR",
        category: item.categ_id ? item.categ_id[1] : "Sin categoría",
        numberOfVariants: 1,
        salePrice: item.list_price,
        actualQuantity: item.qty_available || 0,
        unit: "Unidades",
        description: item.description_sale || item.description || undefined,
        imageUrl: null, // Omit image for initial testing
      };
    } catch (error: any) {
      console.error(
        `Service: Error fetching product with ID ${id} from Odoo:`,
        error
      );

      // Try to provide more specific error information
      if (error.message && error.message.includes("connect")) {
        throw new Error(
          "Could not connect to Odoo server. Please check if Odoo is running."
        );
      } else if (error.message && error.message.includes("auth")) {
        throw new Error(
          "Authentication failed. Please check Odoo credentials."
        );
      } else if (error.message && error.message.includes("database")) {
        throw new Error(
          "Database error. Please check if the database exists and is accessible."
        );
      }

      throw new Error(
        `Failed to fetch product with ID ${id} from Odoo: ${error.message}`
      );
    }
  }
}
