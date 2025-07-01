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
      console.log("Fetching products from Odoo...");
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
          "image_1920", // Add this field to fetch product images
          "image_1024", // Alternative image field
          "image_128", // Smaller image for thumbnails
        ]
      );

      console.log(`Successfully fetched ${response.length} products from Odoo`);

      return response.map((item: any) => {
        // Determine which image field to use, preferring higher resolution
        let imageData = item.image_1920 || item.image_1024 || item.image_128;
        let imageUrl = null;

        // Convert image data to base64 URL if available
        if (imageData) {
          imageUrl = `data:image/png;base64,${imageData}`;
        }

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
          imageUrl: imageUrl,
        };
      });
    } catch (error: any) {
      console.error("Error fetching products from Odoo:", error);
      throw new Error(`Failed to fetch products from Odoo: ${error.message}`);
    }
  }

  public async fetchProductById(id: number): Promise<Product | null> {
    try {
      console.log(`Fetching product with ID ${id} from Odoo...`);
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
          "image_1920", // Add this field to fetch product images
          "image_1024", // Alternative image field
          "image_128", // Smaller image for thumbnails
        ]
      );

      if (!response || response.length === 0) {
        console.log(`No product found with ID ${id} in Odoo`);
        return null;
      }

      console.log(`Successfully fetched product with ID ${id} from Odoo`);

      const item = response[0];

      // Determine which image field to use, preferring higher resolution
      let imageData = item.image_1920 || item.image_1024 || item.image_128;
      let imageUrl = null;

      // Convert image data to base64 URL if available
      if (imageData) {
        imageUrl = `data:image/png;base64,${imageData}`;
      }

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
        imageUrl: imageUrl,
      };
    } catch (error: any) {
      console.error(`Error fetching product with ID ${id} from Odoo:`, error);
      throw new Error(
        `Failed to fetch product with ID ${id} from Odoo: ${error.message}`
      );
    }
  }
}
