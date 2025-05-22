// Image controller

import { Request, Response } from "express";
import { callOdoo } from "../../utils/odooClient";
import { ProductTemplate } from "../../types/productos";
import { formatImageForOdoo } from "../../services/productos.service";

/**
 * Get product image by product ID
 */
export const getProductImage = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    const products = await callOdoo<ProductTemplate[]>(
      "product.template",
      "search_read",
      [["id", "=", id]],
      { fields: ["image_1920"] }
    );

    if (!products || products.length === 0 || !products[0].image_1920) {
      return res.status(404).json({ error: "Product image not found" });
    }

    // Decode base64 image
    const imageBuffer = Buffer.from(products[0].image_1920, "base64");

    // Set appropriate content type (assuming JPEG, but could be determined from image data)
    res.setHeader("Content-Type", "image/jpeg");
    res.send(imageBuffer);
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to fetch product image",
      message: error.message,
    });
  }
};

/**
 * Upload a new image for a product
 */
export const uploadProductImage = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    // Format and update product with new image
    const formattedImage = formatImageForOdoo(image);
    await callOdoo("product.template", "write", [
      [id],
      { image_1920: formattedImage },
    ]);

    res.json({
      message: "Product image uploaded successfully",
      id,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to upload product image",
      message: error.message,
    });
  }
};
