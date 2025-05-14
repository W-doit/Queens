import express, { Request, Response, NextFunction } from "express";
import { callOdoo, authenticate } from "../utils/odooClient";
import {
  ProductTemplate,
  ProductVariant,
  CreateProductRequest,
  UpdateProductRequest,
  ProductResponse,
  ProductListResponse,
  SizeInfo,
} from "../types/productos";

const router = express.Router();

// AsyncHandler middleware to handle Promise rejections
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Helper to generate barcode
async function generateBarcode(): Promise<string> {
  const prefix = "200"; // Product prefix
  const random = Math.floor(Math.random() * 1000000000)
    .toString()
    .padStart(9, "0");
  const digits12 = prefix + random;

  // Calculate check digit (last digit)
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits12[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const checkDigit = (10 - (sum % 10)) % 10;

  return digits12 + checkDigit;
}

// Helper to format image data for Odoo
function formatImageForOdoo(imageData: string): string {
  // If the image already has a data URI prefix, strip it out
  if (imageData.includes('base64,')) {
    return imageData.split('base64,')[1];
  }
  // Otherwise return as is
  return imageData;
}


// GET /api/items - List all products with pagination
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    // Extract query parameters with defaults
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    const category = req.query.category
      ? parseInt(req.query.category as string)
      : undefined;
    const sort = (req.query.sort as string) || "name";

    console.log(
      `GET products with limit=${limit}, offset=${offset}, category=${category}, sort=${sort}`
    );

    // Build domain filter
    const domain: any[] = [];
    if (category) {
      domain.push(["categ_id", "=", category]);
    }

    // Build sort order
    let order = "name ASC";
    if (sort === "newest") {
      order = "id DESC"; // Most recently created first
    } else if (sort === "price_low") {
      order = "list_price ASC";
    } else if (sort === "price_high") {
      order = "list_price DESC";
    }

    // Get products from Odoo with sorting
    const products = await callOdoo<ProductTemplate[]>(
      "product.template",
      "search_read",
      [domain],
      {
        fields: [
          "id",
          "name",
          "list_price",
          "type",
          "barcode",
          "image_1920",
          "categ_id",
          "qty_available",
          "default_code",
          "product_variant_ids",
          "attribute_line_ids",
        ],
        limit,
        offset,
        order,
      }
    );

    console.log(`Found ${products.length} products`);

    // Get total count for pagination
    const total = await callOdoo<number>("product.template", "search_count", [
      domain,
    ]);

    // Process and format each product
    const formattedProducts: ProductResponse[] = await Promise.all(
      products.map(async (product) => {
        // Get size variants if available
        let sizes: SizeInfo[] = [];

        if (
          product.product_variant_ids &&
          product.product_variant_ids.length > 1
        ) {
          // Fetch variants to get size information
          const variants = await callOdoo<ProductVariant[]>(
            "product.product",
            "search_read",
            [["product_tmpl_id", "=", product.id]],
            {
              fields: [
                "id",
                "name",
                "product_template_attribute_value_ids",
                "qty_available",
                "barcode",
              ],
            }
          );

          // Extract size info from variants
          sizes = variants.map((variant) => {
            // Extract size from variant name
            const nameParts = variant.name.split(" - ");
            const sizeName =
              nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

            return {
              id: variant.id,
              name: sizeName,
              product_id: variant.id,
              qty_available: variant.qty_available,
              barcode: variant.barcode,
            };
          });
        }

        // Format the response
        return {
          id: product.id,
          name: product.name,
          list_price: product.list_price,
          type: product.type,
          barcode: product.barcode,
          categ_id: product.categ_id,
          image_url: product.image_1920
            ? `/api/items/${product.id}/image`
            : undefined,
          qty_available: product.qty_available,
          default_code: product.default_code,
          sizes: sizes.length > 0 ? sizes : undefined,
        };
      })
    );

    // Create the response object
    const response: ProductListResponse = {
      products: formattedProducts,
      total,
      page: Math.floor(offset / limit) + 1,
      limit,
    };

    res.json(response);
  })
);

// GET /api/items/:id - Get single product details
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    try {
      // Fetch product by ID using the direct read method
      // This bypasses search and is more reliable for single record retrieval
      let products = await callOdoo<ProductTemplate[]>(
        "product.template",
        "read",
        [[id]],
        {
          fields: [
            "id",
            "name",
            "list_price",
            "type",
            "barcode",
            "image_1920",
            "categ_id",
            "description",
            "description_sale",
            "qty_available",
            "default_code",
            "product_variant_ids",
          ],
        }
      );

      // Handle case when product is not found
      if (!products || products.length === 0) {
        return res.status(404).json({ error: "Product not found" });
      }

      const product = products[0];
      let sizes: SizeInfo[] = [];

      // Get size variants if available
      if (
        product.product_variant_ids &&
        product.product_variant_ids.length > 1
      ) {
        // Fetch variants to get size information
        const variants = await callOdoo<ProductVariant[]>(
          "product.product",
          "search_read",
          [["product_tmpl_id", "=", product.id]],
          {
            fields: [
              "id",
              "name",
              "product_template_attribute_value_ids",
              "qty_available",
              "barcode",
            ],
          }
        );

        // Extract size info from variants
        sizes = variants.map((variant) => {
          // Extract size from variant name
          const nameParts = variant.name.split(" - ");
          const sizeName =
            nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

          return {
            id: variant.id,
            name: sizeName,
            product_id: variant.id,
            qty_available: variant.qty_available,
            barcode: variant.barcode,
          };
        });
      }

      // Construct the response
      const response = {
        id: product.id,
        name: product.name,
        list_price: product.list_price,
        type: product.type,
        barcode: product.barcode,
        categ_id: product.categ_id,
        description: product.description,
        description_sale: product.description_sale,
        image_url: product.image_1920
          ? `/api/items/${product.id}/image`
          : undefined,
        qty_available: product.qty_available,
        default_code: product.default_code,
        sizes: sizes.length > 0 ? sizes : undefined,
      };

      res.json(response);
    } catch (error: any) {
      res.status(500).json({
        error: "Failed to fetch product",
        message: error.message,
      });
    }
  })
);



// POST /api/items - Create a new product
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    try {
      // Extract request data
      const {
        name,
        list_price,
        type,
        categ_id,
        barcode,
        description,
        default_code,
        sale_ok,
        purchase_ok,
        has_sizes,
        sizes,
        image_1920,
      } = req.body as CreateProductRequest & { image_1920?: string };

      // Basic validation
      if (!name) {
        return res.status(400).json({ error: "Product name is required" });
      }

      if (list_price === undefined || list_price < 0) {
        return res
          .status(400)
          .json({ error: "Valid product price is required" });
      }

      // Generate barcode if not provided
      const productBarcode = barcode || (await generateBarcode());

      // Prepare the product data
      const productData: any = {
        name,
        list_price,
        type: type || "product",
        barcode: productBarcode,
      };

      // Add optional fields only if they're provided in the request
      if (sale_ok !== undefined) productData.sale_ok = sale_ok;
      if (purchase_ok !== undefined) productData.purchase_ok = purchase_ok;
      if (categ_id !== undefined) productData.categ_id = categ_id;
      if (description !== undefined) productData.description = description;
      if (default_code !== undefined) productData.default_code = default_code;

      // Add image if provided - use the formatImageForOdoo helper
      if (image_1920 !== undefined) {
        productData.image_1920 = formatImageForOdoo(image_1920);
      }

      // Create the product template in Odoo
      const productId = await callOdoo<number>("product.template", "create", [
        productData,
      ]);

      if (!productId) {
        throw new Error("Failed to get product ID from Odoo");
      }

      // Send response immediately
      res.status(201).json({
        message: "Product created successfully",
        id: productId,
        barcode: productBarcode,
      });

      // Handle sizes after sending the response
      if (has_sizes && sizes && sizes.length > 0) {
        handleSizeVariants(productId, sizes).catch((err) => {
          console.error("Error handling sizes:", err);
        });
      }
    } catch (error: any) {
      // Handle errors
      res.status(500).json({
        error: "Failed to create product",
        message: error.message,
      });
    }
  })
);

/**
 * Helper function to add size variants to a product
 * @param productId - The ID of the product template
 * @param sizes - Array of size names to add (e.g., ["S", "M", "L"])
 */
async function handleSizeVariants(productId: number, sizes: string[]) {
  try {
    // Check if "Size" attribute already exists
    const sizeAttributes = await callOdoo<any[]>(
      "product.attribute",
      "search_read",
      [[["name", "=", "Size"]]],
      { fields: ["id", "name"] }
    );

    // Get or create the size attribute
    let sizeAttributeId;
    if (sizeAttributes.length > 0) {
      sizeAttributeId = sizeAttributes[0].id;
    } else {
      sizeAttributeId = await callOdoo("product.attribute", "create", [
        { name: "Size", create_variant: true },
      ]);
    }

    // Create or find attribute values for each size
    const sizeValueIds = [];
    for (const size of sizes) {
      // Check if size value already exists
      const existingValues = await callOdoo<any[]>(
        "product.attribute.value",
        "search_read",
        [
          [
            ["name", "=", size],
            ["attribute_id", "=", sizeAttributeId],
          ],
        ],
        { fields: ["id"] }
      );

      let sizeValueId;
      if (existingValues.length > 0) {
        sizeValueId = existingValues[0].id;
      } else {
        sizeValueId = await callOdoo("product.attribute.value", "create", [
          { name: size, attribute_id: sizeAttributeId },
        ]);
      }
      sizeValueIds.push(sizeValueId);
    }

    // Create attribute line for the product
    await callOdoo("product.template.attribute.line", "create", [
      {
        product_tmpl_id: productId,
        attribute_id: sizeAttributeId,
        value_ids: sizeValueIds,
      },
    ]);

    return true;
  } catch (error: any) {
    // Error is logged by the caller
    throw error;
  }
}


// TODO: Still in development
// PUT /api/items/:id - Update a product
// Update the PUT route to match the asyncHandler signature:
// router.put(
//   "/:id",
//   asyncHandler(async (req: Request, res: Response) => {
//     const id = parseInt(req.params.id);
//     const {
//       name,
//       list_price,
//       type,
//       categ_id,
//       barcode,
//       description,
//       default_code,
//       sale_ok,
//       purchase_ok,
//       sizes,
//       image_1920,
//     } = req.body as UpdateProductRequest & { image_1920?: string };

//     // Prepare the update data
//     const updateData: any = {};

//     // Only add fields that are defined
//     if (name !== undefined) updateData.name = name;
//     if (list_price !== undefined) updateData.list_price = list_price;
//     if (type !== undefined) updateData.type = type;
//     if (categ_id !== undefined) updateData.categ_id = categ_id;
//     if (barcode !== undefined) updateData.barcode = barcode;
//     if (description !== undefined) updateData.description = description;
//     if (default_code !== undefined) updateData.default_code = default_code;
//     if (sale_ok !== undefined) updateData.sale_ok = sale_ok;
//     if (purchase_ok !== undefined) updateData.purchase_ok = purchase_ok;
//     if (image_1920 !== undefined) updateData.image_1920 = image_1920;

//     // Update the product in Odoo
//     await callOdoo("product.template", "write", [[id], updateData]);

//     // If sizes are specified, update them
//     if (sizes && sizes.length > 0) {
//       try {
//         // Handle sizes update logic...
//         console.log("Updating sizes for product:", id);
//       } catch (attributeError) {
//         console.error("Error updating size attributes:", attributeError);
//       }
//     }

//     res.json({ message: "Product updated", id });
//   })
// );

// TODO: Still in development
// // DELETE /api/items/:id - Delete a product
// router.delete(
//   "/:id",
//   asyncHandler(async (req: Request, res: Response) => {
//     const id = parseInt(req.params.id);

//     await callOdoo("product.template", "unlink", [[id]]);

//     res.json({ message: "Product deleted", id });
//   })
// );

// TODO: Still in development
// GET /api/items/:id/image - Get product image
// router.get(
//   "/:id/image",
//   asyncHandler(async (req: Request, res: Response) => {
//     const id = parseInt(req.params.id);

//     const products = await callOdoo<ProductTemplate[]>(
//       "product.template",
//       "search_read",
//       [["id", "=", id]],
//       { fields: ["image_1920"] }
//     );

//     if (!products || products.length === 0 || !products[0].image_1920) {
//       return res.status(404).json({ error: "Product image not found" });
//     }

//     // Decode base64 image
//     const imageBuffer = Buffer.from(products[0].image_1920, "base64");

//     // Set appropriate content type
//     res.setHeader("Content-Type", "image/jpeg");
//     res.send(imageBuffer);
//   })
// );

// TODO: Still in development
// POST /api/items/:id/image - Upload product image (direct base64)
// router.post(
//   "/:id/image",
//   asyncHandler(async (req: Request, res: Response) => {
//     const id = parseInt(req.params.id);
//     const { image } = req.body;

//     if (!image) {
//       return res.status(400).json({ error: "No image provided" });
//     }

//     // Update product with new image
//     await callOdoo("product.template", "write", [[id], { image_1920: image }]);

//     res.json({ message: "Product image uploaded", id });
//   })
// );

// Export the router
export default router;
