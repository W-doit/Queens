import { Request, Response, NextFunction } from "express";
import { OdooService } from "../services/odooService";
import { formatResponse } from "../utils/responseFormatter";
import { Product } from "../types/product.types";

export class ProductController {
  private odooService: OdooService;

  constructor() {
    this.odooService = new OdooService();
  }

  public getAllProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      console.log("Controller: Fetching all products");
      const products = await this.odooService.fetchAllProducts();

      if (!products || products.length === 0) {
        console.log("Controller: No products found");
        res
          .status(200)
          .json(formatResponse<Product[]>([], "No products found"));
        return;
      }

      console.log(
        `Controller: Successfully fetched ${products.length} products`
      );
      res.status(200).json(formatResponse<Product[]>(products));
    } catch (error: any) {
      console.error("Controller: Error fetching products:", error);

      // Provide more detailed error for debugging
      const errorMessage = error.message || "Unknown error occurred";
      const statusCode = error.statusCode || 500;

      res
        .status(statusCode)
        .json(
          formatResponse<null>(
            null,
            `Failed to fetch products: ${errorMessage}`,
            false
          )
        );
    }
  };

  public getProductById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      console.log(`Controller: Fetching product with ID ${id}`);

      if (!id || isNaN(Number(id))) {
        console.log("Controller: Invalid product ID");
        res
          .status(400)
          .json(formatResponse<null>(null, "Invalid product ID", false));
        return;
      }

      const product = await this.odooService.fetchProductById(Number(id));

      if (!product) {
        console.log(`Controller: Product with ID ${id} not found`);
        res
          .status(404)
          .json(formatResponse<null>(null, "Product not found", false));
        return;
      }

      console.log(`Controller: Successfully fetched product with ID ${id}`);
      res.status(200).json(formatResponse<Product>(product));
    } catch (error: any) {
      console.error(
        `Controller: Error fetching product with ID ${req.params.id}:`,
        error
      );

      // Provide more detailed error for debugging
      const errorMessage = error.message || "Unknown error occurred";
      const statusCode = error.statusCode || 500;

      res
        .status(statusCode)
        .json(
          formatResponse<null>(
            null,
            `Failed to fetch product: ${errorMessage}`,
            false
          )
        );
    }
  };
}
