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

// Basic test route to verify the router is loaded
router.get("/test-route", (req: Request, res: Response) => {
  console.log("Products router test route hit!");
  res.json({ message: "Products router is working" });
});

// Test POST endpoint with minimal functionality
router.post("/test-post", (req: Request, res: Response) => {
  console.log("Test POST endpoint hit with data:", req.body);
  res.status(201).json({
    message: "Test POST received",
    receivedData: req.body,
  });
});

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

// GET /api/items - List products with pagination
// Update the GET handler

// Complete GET handler with proper variables

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
      `📄 GET products with limit=${limit}, offset=${offset}, category=${category}, sort=${sort}`
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

    console.log(`📄 Found ${products.length} products`);

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
// GET /api/items/:id - Get single product details
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    console.log(`🔍 Getting details for product ID: ${id}`);

    try {
      const products = await callOdoo<ProductTemplate[]>(
        "product.template",
        "search_read",
        [["id", "=", id]],
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

      if (!products || products.length === 0) {
        console.log(`❌ Product ID ${id} not found`);
        return res.status(404).json({ error: "Product not found" });
      }

      const product = products[0];
      console.log(`✅ Found product: ${product.name}`);

      let sizes: SizeInfo[] = [];

      if (
        product.product_variant_ids &&
        product.product_variant_ids.length > 1
      ) {
        console.log(
          `🔍 Fetching ${product.product_variant_ids.length} variants for product`
        );

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

        sizes = variants.map((variant) => {
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

        console.log(`✅ Found ${sizes.length} size variants`);
      } else {
        console.log(`ℹ️ Product has no size variants`);
      }

      const response: ProductResponse = {
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
      console.error(`❌ Error fetching product ${id}:`, error.message);
      res.status(500).json({
        error: "Failed to fetch product",
        message: error.message,
      });
    }
  })
);

// Simple POST test without asyncHandler
router.post("/simple-test", (req: Request, res: Response) => {
  console.log("⭐ Simple POST test hit with body:", req.body);
  res.status(201).json({
    message: "Simple test successful",
    received: req.body,
  });
});

// POST /api/items - Create a new product
// Update your POST handler with more logging

// Update your POST handler with detailed logging

// Update your POST handler

// POST /api/items - Create a new product
router.post(
  "/",
  (req: Request, res: Response, next: NextFunction) => {
    // Add direct logging outside the asyncHandler
    console.log("\n➡️➡️➡️ POST /api/items HIT ⬅️⬅️⬅️");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    next();
  },
  asyncHandler(async (req: Request, res: Response) => {
    // Your existing product creation code
    console.log("\n====== PRODUCT CREATION REQUEST ======");
    console.log(
      "📦 Received product creation request at:",
      new Date().toISOString()
    );

    try {
      // Log the request body (excluding image for brevity)
      const requestBody = { ...req.body };
      if (requestBody.image_1920) {
        requestBody.image_1920 = "[BASE64_IMAGE_DATA_REDACTED]";
      }
      console.log("📄 Request data:", JSON.stringify(requestBody, null, 2));

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
        console.log("❌ Validation failed: Missing product name");
        return res.status(400).json({ error: "Product name is required" });
      }

      if (list_price === undefined || list_price < 0) {
        console.log("❌ Validation failed: Invalid price");
        return res
          .status(400)
          .json({ error: "Valid product price is required" });
      }

      // Generate barcode if not provided
      console.log("🔄 Generating barcode...");
      const productBarcode = barcode || (await generateBarcode());
      console.log("✅ Barcode generated:", productBarcode);

      // Prepare the product data
      const productData: any = {
        name,
        list_price,
        type: type || "product",
        barcode: productBarcode,
        sale_ok: sale_ok !== undefined ? sale_ok : true,
        purchase_ok: purchase_ok !== undefined ? purchase_ok : true,
      };

      // Add optional fields if provided
      if (categ_id !== undefined) productData.categ_id = categ_id;
      if (description) productData.description = description;
      if (default_code) productData.default_code = default_code;
      if (image_1920) {
        console.log("🖼️ Image data provided, length:", image_1920.length);
        productData.image_1920 = image_1920;
      }

      console.log("🚀 Creating product in Odoo:", {
        name: productData.name,
        list_price: productData.list_price,
        type: productData.type,
      });

      // Create the product template in Odoo
      const productId = await callOdoo<number>("product.template", "create", [
        productData,
      ]);

      if (!productId) {
        throw new Error("Failed to get product ID from Odoo");
      }

      console.log(`✅ Product created with ID: ${productId}`);

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
      console.error("❌ Error creating product:", error);
      res.status(500).json({
        error: "Failed to create product",
        message: error.message,
      });
    }
  })
);
// Helper function to handle size variants
// Helper function to handle size variants with improved logging
async function handleSizeVariants(productId: number, sizes: string[]) {
  try {
    console.log(`\n🔄 ADDING SIZE VARIANTS FOR PRODUCT ${productId}`);
    console.log(`📏 Sizes to add: ${sizes.join(", ")}`);

    // Check if "Size" attribute already exists
    console.log("🔍 Checking if Size attribute exists...");
    const sizeAttributes = await callOdoo<any[]>(
      "product.attribute",
      "search_read",
      [[["name", "=", "Size"]]],
      { fields: ["id", "name"] }
    );

    let sizeAttributeId;
    if (sizeAttributes.length > 0) {
      sizeAttributeId = sizeAttributes[0].id;
      console.log("✅ Size attribute found, ID:", sizeAttributeId);
    } else {
      console.log("🔄 Size attribute not found, creating...");
      sizeAttributeId = await callOdoo("product.attribute", "create", [
        { name: "Size", create_variant: true },
      ]);
      console.log("✅ Created Size attribute, ID:", sizeAttributeId);
    }

    // Create or find attribute values for each size
    console.log("🔄 Processing individual sizes...");
    const sizeValueIds = [];
    for (const size of sizes) {
      console.log(`  🔍 Processing size: ${size}`);

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
        console.log(`  ✅ Size '${size}' already exists, ID:`, sizeValueId);
      } else {
        console.log(`  🔄 Creating new size value: ${size}`);
        sizeValueId = await callOdoo("product.attribute.value", "create", [
          { name: size, attribute_id: sizeAttributeId },
        ]);
        console.log(`  ✅ Created size '${size}', ID:`, sizeValueId);
      }
      sizeValueIds.push(sizeValueId);
    }

    // Create attribute line for the product
    console.log(
      `🔄 Creating attribute line for product ${productId} with size values:`,
      sizeValueIds
    );
    const attributeLineId = await callOdoo(
      "product.template.attribute.line",
      "create",
      [
        {
          product_tmpl_id: productId,
          attribute_id: sizeAttributeId,
          value_ids: sizeValueIds,
        },
      ]
    );

    console.log(`✅ Successfully added size variants to product ${productId}`);
    console.log(`   Attribute line created, ID: ${attributeLineId}`);
    console.log("==== SIZE VARIANT CREATION COMPLETE ====\n");
    return true;
  } catch (error: any) {
    console.error(
      `❌ SIZE VARIANT CREATION ERROR for product ${productId}:`,
      error
    );
    if (error.response) {
      console.error(
        "Response data:",
        JSON.stringify(error.response.data, null, 2)
      );
    }
    console.log("==== SIZE VARIANT CREATION FAILED ====\n");
    throw error;
  }
}

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

// // DELETE /api/items/:id - Delete a product
// router.delete(
//   "/:id",
//   asyncHandler(async (req: Request, res: Response) => {
//     const id = parseInt(req.params.id);

//     await callOdoo("product.template", "unlink", [[id]]);

//     res.json({ message: "Product deleted", id });
//   })
// );

// GET /api/items/:id/image - Get product image
router.get(
  "/:id/image",
  asyncHandler(async (req: Request, res: Response) => {
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

    // Set appropriate content type
    res.setHeader("Content-Type", "image/jpeg");
    res.send(imageBuffer);
  })
);

// POST /api/items/:id/image - Upload product image (direct base64)
router.post(
  "/:id/image",
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    // Update product with new image
    await callOdoo("product.template", "write", [[id], { image_1920: image }]);

    res.json({ message: "Product image uploaded", id });
  })
);

// Add this function to your route file
router.get(
  "/debug",
  asyncHandler(async (req: Request, res: Response) => {
    console.log("🔍 Running API diagnostics...");

    try {
      // Test authentication
      console.log("🔐 Testing Odoo authentication...");
      const uid = await authenticate();
      console.log(`✅ Authentication successful, UID: ${uid}`);

      // Test simple read operation
      console.log("📚 Testing product read operation...");
      const products = await callOdoo<any[]>(
        "product.template",
        "search_read",
        [[]],
        { fields: ["id", "name"], limit: 5 }
      );

      console.log(`✅ Successfully fetched ${products.length} products`);

      // Test product categories
      console.log("🏷️ Fetching product categories...");
      const categories = await callOdoo<any[]>(
        "product.category",
        "search_read",
        [[]],
        { fields: ["id", "name", "display_name"], limit: 10 }
      );

      console.log(`✅ Found ${categories.length} product categories`);

      // Return diagnostics results
      return res.json({
        status: "success",
        odoo_connection: "working",
        uid,
        sample_products: products,
        product_categories: categories,
      });
    } catch (error: any) {
      console.error("❌ API diagnostics failed:", error);
      return res.status(500).json({
        status: "error",
        message: "API diagnostics failed",
        error: error.message,
        details: error.response?.data || null,
      });
    }
  })
);

// Export the router
export default router;
