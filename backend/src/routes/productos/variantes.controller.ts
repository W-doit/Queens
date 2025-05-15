// Variant controller logic


import { Request, Response } from "express";
import { callOdoo } from "../../utils/odooClient";
import { ProductVariant, SizeInfo, ColorInfo } from "../../types/productos";
import { handleSizeVariants, handleColorVariants } from "../../services/productos.service";

/**
 * Get variants for a specific product
 */
export const getProductVariants = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);

    // First check if product exists
    const products = await callOdoo<any[]>(
      "product.template",
      "search_read",
      [["id", "=", productId]],
      { fields: ["id", "name"] }
    );

    if (!products || products.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Get all variants for this product
    const variants = await callOdoo<ProductVariant[]>(
      "product.product",
      "search_read",
      [["product_tmpl_id", "=", productId]],
      {
        fields: [
          "id",
          "name",
          "default_code",
          "barcode",
          "qty_available",
          "product_template_attribute_value_ids",
          "combination_indices",
        ],
      }
    );

    // Get attribute values for each variant
    const variantsWithAttributes = await Promise.all(
      variants.map(async (variant) => {
        let sizes: SizeInfo[] = [];
        let colors: ColorInfo[] = [];

        // Only process variants with attribute values
        if (variant.product_template_attribute_value_ids?.length) {
          // Get attribute values details
          const attrValues = await callOdoo<any[]>(
            "product.template.attribute.value",
            "read",
            [variant.product_template_attribute_value_ids],
            {
              fields: [
                "id",
                "name",
                "attribute_id",
                "product_attribute_value_id",
              ],
            }
          );

          // Get the attribute details to distinguish size from color
          const attrIds = attrValues.map((attr) => attr.attribute_id[0]);
          const attributes = await callOdoo<any[]>(
            "product.attribute",
            "read",
            [attrIds],
            { fields: ["id", "name"] }
          );

          // Create a map for easy lookup
          const attributeMap = Object.fromEntries(
            attributes.map((attr) => [attr.id, attr.name])
          );

          // Separate size and color attributes
          attrValues.forEach((attrValue) => {
            const attrType = attributeMap[attrValue.attribute_id[0]];
            if (attrType?.toLowerCase() === "size") {
              sizes.push({
                id: attrValue.id,
                name: attrValue.name,
                product_id: variant.id,
                qty_available: variant.qty_available,
                barcode: variant.barcode,
              });
            } else if (attrType?.toLowerCase() === "color") {
              colors.push({
                id: attrValue.id,
                name: attrValue.name,
                product_id: variant.id,
                // For color, we could fetch hex_code if available in the future
              });
            }
          });
        }

        return {
          ...variant,
          sizes: sizes.length > 0 ? sizes : undefined,
          colors: colors.length > 0 ? colors : undefined,
        };
      })
    );

    res.json({
      product_id: productId,
      product_name: products[0].name,
      variants: variantsWithAttributes,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to fetch product variants",
      message: error.message,
    });
  }
};

/**
 * Update variant attributes (sizes, colors)
 */
export const updateProductVariants = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    const { sizes, colors } = req.body;

    // Validate request
    if (!sizes && !colors) {
      return res.status(400).json({
        error: "At least one attribute (sizes or colors) must be provided",
      });
    }

    // Check if product exists
    const products = await callOdoo<any[]>(
      "product.template",
      "search_read",
      [["id", "=", productId]],
      { fields: ["id"] }
    );

    if (!products || products.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Process sizes if provided
    if (sizes && Array.isArray(sizes) && sizes.length > 0) {
      await handleSizeVariants(productId, sizes);
    }

    // Process colors if provided
    if (colors && Array.isArray(colors) && colors.length > 0) {
      await handleColorVariants(productId, colors);
    }

    res.json({
      message: "Product variants updated successfully",
      product_id: productId,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to update product variants",
      message: error.message,
    });
  }
};

/**
 * Update stock for a specific variant
 */
export const updateVariantStock = async (req: Request, res: Response) => {
  try {
    const variantId = parseInt(req.params.variantId);
    const { qty_change } = req.body;

    if (qty_change === undefined) {
      return res.status(400).json({ error: "Quantity change is required" });
    }

    // Check if variant exists
    const variants = await callOdoo<any[]>(
      "product.product",
      "search_read",
      [["id", "=", variantId]],
      { fields: ["id", "name", "qty_available"] }
    );

    if (!variants || variants.length === 0) {
      return res.status(404).json({ error: "Variant not found" });
    }

    const variant = variants[0];
    const currentQty = variant.qty_available || 0;
    const newQty = Math.max(0, currentQty + qty_change);

    // Update stock
    const inventoryAdjustmentId = await callOdoo<number>(
      "stock.inventory",
      "create",
      [{
        name: `Manual adjustment via API for variant ${variantId}`,
        product_ids: [variantId],
      }]
    );

    // Prepare the inventory
    await callOdoo(
      "stock.inventory",
      "action_start",
      [[inventoryAdjustmentId]]
    );

    // Get inventory line
    const inventoryLines = await callOdoo<any[]>(
      "stock.inventory.line",
      "search_read",
      [
        [
          ["inventory_id", "=", inventoryAdjustmentId],
          ["product_id", "=", variantId],
        ],
      ],
      { fields: ["id", "product_qty"] }
    );

    if (inventoryLines && inventoryLines.length > 0) {
      const line = inventoryLines[0];
      
      // Set new quantity
      await callOdoo(
        "stock.inventory.line",
        "write",
        [[line.id], { product_qty: newQty }]
      );

      // Validate inventory
      await callOdoo(
        "stock.inventory",
        "action_validate",
        [[inventoryAdjustmentId]]
      );

      res.json({
        message: "Variant stock updated successfully",
        variant_id: variantId,
        variant_name: variant.name,
        previous_qty: currentQty,
        new_qty: newQty,
        change: qty_change,
      });
    } else {
      throw new Error("Inventory line not found");
    }
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to update variant stock",
      message: error.message,
    });
  }
};