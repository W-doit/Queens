// Product controller logic

import { Request, Response } from "express";
import { callOdoo } from "../../utils/odooClient";
import {
  ProductTemplate,
  ProductVariant,
  CreateProductRequest,
  UpdateProductRequest,
  ProductResponse,
  ProductListResponse,
  SizeInfo,
} from "../../types/productos";
import {
  formatImageForOdoo,
  generateBarcode,
  handleSizeVariants,
} from "../../services/productos.service";

/**
 * Get all products with pagination, filtering, and sorting
 */
export const getProducts = async (req: Request, res: Response) => {
  try {
    // Extract pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // Extract filtering and sorting parameters
    const category = req.query.category
      ? parseInt(req.query.category as string)
      : undefined;
    const search = req.query.search as string;
    const sortBy = (req.query.sortBy as string) || "name";
    const sortOrder = (req.query.sortOrder as string) || "asc";

    // Build domain for filtering
    let domain: any[] = [["sale_ok", "=", true]];

    if (category) {
      domain.push(["categ_id", "=", category]);
    }

    if (search) {
      domain.push(["name", "ilike", search]);
    }

    // Get total count
    const count = await callOdoo<number>("product.template", "search_count", [
      domain,
    ]);

    // Get products
    const products = await callOdoo<any[]>(
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
          "categ_id",
          "image_1920",
          "qty_available",
          "default_code",
          "product_variant_ids",
        ],
        limit: limit,
        offset: offset,
        order: `${sortBy} ${sortOrder}`,
      }
    );

    console.log(`Found ${products?.length || 0} products`);

    // Process products with Promise.all to handle async operations in map
    const formattedProducts =
      products && Array.isArray(products)
        ? await Promise.all(
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
                  [[["product_tmpl_id", "=", product.id]]],
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

                if (variants && Array.isArray(variants)) {
                  // Extract size info from variants
                  sizes = variants.map((variant) => {
                    // Extract size from variant name
                    const nameParts = variant.name.split(" - ");
                    const sizeName =
                      nameParts.length > 1
                        ? nameParts[nameParts.length - 1]
                        : "";

                    return {
                      id: variant.id,
                      name: sizeName,
                      product_id: variant.id,
                      qty_available: variant.qty_available,
                      barcode: variant.barcode,
                    };
                  });
                }
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
                  ? `/api/products/${product.id}/image`
                  : undefined,
                qty_available: product.qty_available,
                default_code: product.default_code,
                sizes: sizes.length > 0 ? sizes : undefined,
              };
            })
          )
        : [];

    // Create the response object
    const response: ProductListResponse = {
      products: formattedProducts,
      total: count || 0,
      page: Math.floor(offset / limit) + 1,
      limit,
    };

    res.json(response);
  } catch (error: any) {
    // Add explicit type annotation here
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to fetch products" });
  }
};

/**
 * Get a single product by ID
 */
export const getProductById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  try {
    // Fetch product by ID using the direct read method
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
    if (product.product_variant_ids && product.product_variant_ids.length > 1) {
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
        ? `/api/products/${product.id}/image`
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
};

/**
 * Create a new product
 */
export const createProduct = async (req: Request, res: Response) => {
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
      return res.status(400).json({ error: "Valid product price is required" });
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

    // Add image if provided
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
};

/**
 * Update an existing product
 */
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
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
      sizes,
      image_1920,
    } = req.body as UpdateProductRequest & { image_1920?: string };

    // Prepare the update data
    const updateData: any = {};

    // Only add fields that are defined
    if (name !== undefined) updateData.name = name;
    if (list_price !== undefined) updateData.list_price = list_price;
    if (type !== undefined) updateData.type = type;
    if (categ_id !== undefined) updateData.categ_id = categ_id;
    if (barcode !== undefined) updateData.barcode = barcode;
    if (description !== undefined) updateData.description = description;
    if (default_code !== undefined) updateData.default_code = default_code;
    if (sale_ok !== undefined) updateData.sale_ok = sale_ok;
    if (purchase_ok !== undefined) updateData.purchase_ok = purchase_ok;

    // Process image if provided
    if (image_1920 !== undefined) {
      updateData.image_1920 = formatImageForOdoo(image_1920);
    }

    // Validate that there's something to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: "No valid fields to update",
      });
    }

    // Update the product in Odoo
    await callOdoo("product.template", "write", [[id], updateData]);

    // If sizes are specified, update them
    if (sizes && sizes.length > 0) {
      try {
        await handleSizeVariants(id, sizes);
      } catch (sizeError) {
        console.error("Error updating size attributes:", sizeError);
        // We continue anyway since the main product was updated
      }
    }

    res.json({
      message: "Product updated successfully",
      id,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to update product",
      message: error.message,
    });
  }
};

/**
 * Delete a product
 */
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    // IMPORTANT: The format should be [id] not [[id]]
    // Odoo expects an array of IDs to delete, not a nested array
    await callOdoo("product.template", "unlink", [[id]]);

    res.json({
      message: "Product deleted successfully",
      id,
    });
  } catch (error: any) {
    console.error("Delete error details:", error);

    res.status(500).json({
      error: "Failed to delete product",
      message: error.message,
    });
  }
};
