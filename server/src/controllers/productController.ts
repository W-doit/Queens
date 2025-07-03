import { Request, Response, NextFunction } from "express";
import { OdooService } from "../services/odooService";
import { Product } from "../types/product.types";
import { formatResponse } from "../utils/responseFormatter";

export class ProductController {
  private odooService: OdooService;

  constructor() {
    this.odooService = new OdooService();
  }

  /**
   * Get all products with optional filtering, searching, and sorting
   * @param req Express request
   * @param res Express response
   * @param next Express next function
   */
  public getAllProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      console.log("Controller: Fetching products with options");

      // Extract query parameters from request
      const {
        category, // For category filtering
        q, // For search functionality
        sort = "relevancia", // For sorting (default to relevance)
        available, // For availability filtering
      } = req.query;

      // Use the OdooService to fetch products
      const products = await this.odooService.fetchAllProducts({
        search: q as string,
        category: category as string,
        sort: sort as string,
        available:
          available === "true"
            ? true
            : available === "false"
            ? false
            : undefined,
      });

      if (!products || products.length === 0) {
        console.log("Controller: No products found matching the criteria");
        return res
          .status(200)
          .json(
            formatResponse<Product[]>(
              [],
              "No products found matching the criteria"
            )
          );
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

  /**
   * Get a specific product by ID
   * @param req Express request
   * @param res Express response
   * @param next Express next function
   */
  public getProductById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const productId = Number(req.params.id);

      if (isNaN(productId)) {
        return res
          .status(400)
          .json(formatResponse<null>(null, "Invalid product ID format", false));
      }

      console.log(`Controller: Fetching product with ID ${productId}`);
      const product = await this.odooService.fetchProductById(productId);

      if (!product) {
        console.log(`Controller: Product with ID ${productId} not found`);
        return res
          .status(404)
          .json(
            formatResponse<null>(
              null,
              `Product with ID ${productId} not found`,
              false
            )
          );
      }

      console.log(`Controller: Successfully fetched product ${productId}`);
      res.status(200).json(formatResponse<Product>(product));
    } catch (error: any) {
      console.error(`Controller: Error fetching product:`, error);

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
