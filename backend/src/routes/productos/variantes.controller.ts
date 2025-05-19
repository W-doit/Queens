// Variant controller logic

import { Request, Response } from "express";
import { callOdoo } from "../../utils/odooClient";
import { ProductVariant, SizeInfo, ColorInfo } from "../../types/productos";
import {
  handleSizeVariants,
  handleColorVariants,
  generateVariantCombinations,
} from "../../services/productos.service";

/**
 * Get variants for a specific product
 */
export const getProductVariants = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    console.log(`Getting variants for product ID ${productId}`);

    // First check if product exists
    const products = await callOdoo<any[]>(
      "product.template",
      "search_read",
      [[["id", "=", productId]]],
      { fields: ["id", "name"] }
    );

    if (!products || products.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    console.log(`Found product: ${products[0].name} (ID: ${products[0].id})`);

    // Get all variants for this product - FIXED DOMAIN SYNTAX
    const variants = await callOdoo<ProductVariant[]>(
      "product.product",
      "search_read",
      [[["product_tmpl_id", "=", productId]]], // Note the extra brackets
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

    console.log(
      `Found ${variants?.length || 0} variants for product ${productId}`
    );

    // Debug: Print raw variants to see what we're getting
    console.log(
      "Raw variants:",
      JSON.stringify(
        variants?.map((v: any) => ({
          id: v.id,
          name: v.name,
          attribute_values: v.product_template_attribute_value_ids,
        })),
        null,
        2
      )
    );

    // Simple response if no processing is needed
    if (!variants || variants.length === 0) {
      return res.json({
        product_id: productId,
        product_name: products[0].name,
        variants: [],
      });
    }

    // Get attribute values for each variant
    const variantsWithAttributes = await Promise.all(
      variants.map(async (variant) => {
        let sizes: SizeInfo[] = [];
        let colors: ColorInfo[] = [];

        // Only process variants with attribute values
        if (variant.product_template_attribute_value_ids?.length) {
          try {
            console.log(
              `Processing variant ${variant.id} with attribute values:`,
              variant.product_template_attribute_value_ids
            );

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

            console.log(
              `Found ${attrValues?.length || 0} attribute values for variant ${
                variant.id
              }`
            );

            // Safely extract attribute IDs
            const attrIds = [];
            for (const attr of attrValues) {
              // Check if attribute_id exists and is in the expected format
              if (
                attr.attribute_id &&
                Array.isArray(attr.attribute_id) &&
                attr.attribute_id.length > 0
              ) {
                attrIds.push(attr.attribute_id[0]);
              }
            }

            console.log(
              `Extracted ${attrIds.length} attribute IDs for variant ${variant.id}:`,
              attrIds
            );

            // Only proceed if we have attribute IDs
            if (attrIds.length > 0) {
              // Get the attribute details to distinguish size from color
              const attributes = await callOdoo<any[]>(
                "product.attribute",
                "read",
                [attrIds],
                { fields: ["id", "name"] }
              );

              console.log(
                `Found ${attributes?.length || 0} attributes:`,
                attributes?.map((a: any) => ({ id: a.id, name: a.name }))
              );

              // Create a map for easy lookup
              const attributeMap = Object.fromEntries(
                attributes.map((attr) => [attr.id, attr.name])
              );

              // Separate size and color attributes
              attrValues.forEach((attrValue) => {
                if (
                  attrValue.attribute_id &&
                  Array.isArray(attrValue.attribute_id)
                ) {
                  const attrType =
                    attributeMap[attrValue.attribute_id[0]]?.toLowerCase();
                  console.log(
                    `Attribute type for ${attrValue.name}: ${attrType}`
                  );

                  if (attrType === "size") {
                    sizes.push({
                      id: attrValue.id,
                      name: attrValue.name,
                      product_id: variant.id,
                      qty_available: variant.qty_available,
                      barcode: variant.barcode,
                    });
                    console.log(
                      `Added size ${attrValue.name} to variant ${variant.id}`
                    );
                  } else if (attrType === "color") {
                    colors.push({
                      id: attrValue.id,
                      name: attrValue.name,
                      product_id: variant.id,
                    });
                    console.log(
                      `Added color ${attrValue.name} to variant ${variant.id}`
                    );
                  } else {
                    console.log(
                      `Unknown attribute type ${attrType} for value ${attrValue.name}`
                    );
                  }
                }
              });
            }
          } catch (error) {
            console.error(
              `Error processing attributes for variant ${variant.id}:`,
              error
            );
            // Continue with the variant without attributes
          }
        } else {
          console.log(`Variant ${variant.id} has no attribute values`);
        }

        return {
          ...variant,
          sizes: sizes.length > 0 ? sizes : undefined,
          colors: colors.length > 0 ? colors : undefined,
        };
      })
    );

    console.log(
      `Processed ${variantsWithAttributes.length} variants with attributes`
    );

    res.json({
      product_id: productId,
      product_name: products[0].name,
      variants: variantsWithAttributes,
    });
  } catch (error: any) {
    console.error("Variant error details:", error);
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
      [[["id", "=", productId]]],
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

    // Force generation of variant products after setting attributes
    try {
      console.log("Attempting to generate variants for product", productId);

      // First try the direct method if available
      try {
        await callOdoo("product.template", "create_variant_ids", [[productId]]);
        console.log("Variants generated using create_variant_ids method");
      } catch (variantError) {
        console.log(
          "create_variant_ids not available, trying alternative approaches"
        );

        // Alternative approach: trigger a product update to force variant generation
        await callOdoo("product.template", "write", [
          [productId],
          { active: true },
        ]);

        // Try to set create_variant to "always"
        try {
          await callOdoo("product.template", "write", [
            [productId],
            { create_variant: "always" },
          ]);
          console.log("Set create_variant to always");
        } catch (err) {
          console.log("Could not set create_variant flag, continuing...");
        }

        // Some versions need a call to this method
        try {
          await callOdoo("product.template", "_create_variant_ids", [
            [productId],
          ]);
          console.log("Variants generated using _create_variant_ids method");
        } catch (innerError) {
          console.log(
            "_create_variant_ids not available, using standard update"
          );
          // The write operation should have triggered the variant generation
        }
      }

      // Additional attempt: use action_create_variant if available
      try {
        await callOdoo("product.template", "action_create_variant", [
          [productId],
        ]);
        console.log("Variants generated using action_create_variant method");
      } catch (actionError) {
        console.log("action_create_variant not available, continuing...");
      }

      // Give Odoo a moment to process the variants
      console.log("Waiting for Odoo to process variants...");
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Check if variants were actually generated
      const generatedVariants = await callOdoo(
        "product.product",
        "search_read",
        [[["product_tmpl_id", "=", productId]]],
        { fields: ["id", "name"] }
      );

      console.log(
        `Found ${generatedVariants?.length || 0} variants after generation:`,
        generatedVariants?.map((v: any) => ({ id: v.id, name: v.name }))
      );
    } catch (variantGenError) {
      console.error("Error generating variants:", variantGenError);
      // Continue anyway as the attributes were set successfully
    }

    // If we got here, the attributes were successfully set
    res.json({
      message: "Product variants updated successfully",
      product_id: productId,
    });
  } catch (error: any) {
    console.error("Error updating product variants:", error);
    res.status(500).json({
      error: "Failed to update product variants",
      message: error.message,
    });
  }
};

/**
 * Update stock quantity for a specific product variant
 */
/**
 * Update stock quantity for a specific product variant
 */
export const updateVariantStock = async (req: Request, res: Response) => {
  try {
    const variantId = parseInt(req.params.variantId);
    const { qty_change, reason = "Stock adjustment" } = req.body;

    console.log(
      `Updating stock for variant ID ${variantId} with change: ${qty_change}`
    );

    // Validate qty_change is a number
    if (typeof qty_change !== "number") {
      return res.status(400).json({ error: "qty_change must be a number" });
    }

    // Find the variant
    const variants = await callOdoo<any[]>(
      "product.product",
      "search_read",
      [[["id", "=", variantId]]],
      { fields: ["id", "name", "qty_available", "uom_id"] }
    );

    if (!variants || variants.length === 0) {
      return res.status(404).json({ error: "Variant not found" });
    }

    const variant = variants[0];
    const currentQty = variant.qty_available || 0;
    const productUomId = variant.uom_id ? variant.uom_id[0] : 1; // Default UoM is usually 1 (Units)

    // Calculate new quantity, ensuring it doesn't go below zero
    const newQty = Math.max(0, currentQty + qty_change);
    const qtyToMove = Math.abs(qty_change);

    console.log(
      `Current qty: ${currentQty}, Target qty: ${newQty}, Qty to move: ${qtyToMove}`
    );

    if (qty_change === 0) {
      return res.json({
        message: "No stock change requested",
        variant_id: variantId,
        variant_name: variant.name,
        qty_available: currentQty,
        change: 0,
      });
    }

    // Find stock locations
    const stockLocations = await callOdoo(
      "stock.location",
      "search_read",
      [
        [
          ["usage", "=", "internal"],
          ["name", "=", "Stock"],
        ],
      ],
      { fields: ["id"] }
    );

    const inventoryLocations = await callOdoo(
      "stock.location",
      "search_read",
      [[["usage", "=", "inventory"]]],
      { fields: ["id"] }
    );

    if (!stockLocations || stockLocations.length === 0) {
      throw new Error("Stock location not found");
    }

    if (!inventoryLocations || inventoryLocations.length === 0) {
      throw new Error("Inventory adjustment location not found");
    }

    const stockLocationId = stockLocations[0].id;
    const inventoryLocationId = inventoryLocations[0].id;

    console.log(
      `Using stock location ID: ${stockLocationId}, inventory location ID: ${inventoryLocationId}`
    );

    // Get company ID (usually 1)
    const companies = await callOdoo("res.company", "search_read", [[]], {
      fields: ["id"],
      limit: 1,
    });

    const companyId = companies && companies.length > 0 ? companies[0].id : 1;

    // Create immediate transfer picking for inventory adjustment
    console.log("Creating stock picking");
    const pickingTypeId = qty_change > 0 ? 1 : 2; // 1 = Receipt, 2 = Delivery

    const sourceLocationId =
      qty_change > 0 ? inventoryLocationId : stockLocationId;
    const destLocationId =
      qty_change > 0 ? stockLocationId : inventoryLocationId;

    const picking = await callOdoo("stock.picking", "create", [
      {
        name: `INV-ADJ-${Date.now()}`,
        origin: reason,
        picking_type_id: pickingTypeId,
        location_id: sourceLocationId,
        location_dest_id: destLocationId,
        immediate_transfer: true,
        company_id: companyId,
      },
    ]);

    console.log(`Created picking with ID: ${picking}`);

    // Create stock move
    console.log("Creating stock move");
    const move = await callOdoo("stock.move", "create", [
      {
        name: reason,
        picking_id: picking,
        product_id: variantId,
        product_uom: productUomId,
        product_uom_qty: qtyToMove,
        location_id: sourceLocationId,
        location_dest_id: destLocationId,
        company_id: companyId,
        state: "draft",
      },
    ]);

    console.log(`Created stock move with ID: ${move}`);

    // Process the picking through all states
    console.log("Processing picking");
    await callOdoo("stock.picking", "action_confirm", [[picking]]);
    await callOdoo("stock.picking", "action_assign", [[picking]]);

    // Create stock move line for the move
    console.log("Creating stock move line");
    await callOdoo("stock.move.line", "create", [
      {
        move_id: move,
        picking_id: picking,
        product_id: variantId,
        product_uom_id: productUomId,
        location_id: sourceLocationId,
        location_dest_id: destLocationId,
        qty_done: qtyToMove,
        company_id: companyId,
      },
    ]);

    // Mark as done
    console.log("Validating picking");
    await callOdoo("stock.picking", "button_validate", [[picking]]);

    // Get updated quantity
    const updatedVariants = await callOdoo<any[]>(
      "product.product",
      "search_read",
      [[["id", "=", variantId]]],
      { fields: ["id", "name", "qty_available"] }
    );

    const updatedQty =
      updatedVariants && updatedVariants.length > 0
        ? updatedVariants[0].qty_available || 0
        : newQty;

    console.log(`Stock update complete. New quantity: ${updatedQty}`);

    res.json({
      message: "Variant stock updated successfully",
      variant_id: variantId,
      variant_name: variant.name,
      previous_qty: currentQty,
      new_qty: updatedQty,
      change: qty_change,
    });
  } catch (error: any) {
    console.error("Error updating variant stock:", error);
    res.status(500).json({
      error: "Failed to update variant stock",
      message: error.message,
    });
  }
};

/**
 * Delete all variants for a product
 */
export const deleteProductVariants = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);

    // Check if product exists
    const products = await callOdoo<any[]>(
      "product.template",
      "search_read",
      [[["id", "=", productId]]],
      { fields: ["id", "name"] }
    );

    if (!products || products.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Find all variant IDs for this product
    const variants = await callOdoo<any[]>(
      "product.product",
      "search_read",
      [[["product_tmpl_id", "=", productId]]],
      { fields: ["id", "name"] }
    );

    if (!variants || variants.length === 0) {
      return res.json({
        message: "No variants found for this product",
        product_id: productId,
      });
    }

    console.log(
      `Found ${variants.length} variants to delete for product ${productId}`
    );

    // Extract the variant IDs
    const variantIds = variants.map((v) => v.id);

    // Delete all variants
    await callOdoo("product.product", "unlink", [variantIds]);

    // Also remove the attribute lines from the product template
    const attrLines = await callOdoo<any[]>(
      "product.template.attribute.line",
      "search_read",
      [[["product_tmpl_id", "=", productId]]],
      { fields: ["id"] }
    );

    if (attrLines && attrLines.length > 0) {
      const attrLineIds = attrLines.map((line) => line.id);
      await callOdoo("product.template.attribute.line", "unlink", [
        attrLineIds,
      ]);
    }

    res.json({
      message: "All product variants have been deleted",
      product_id: productId,
      deleted_variants: variants.length,
    });
  } catch (error: any) {
    console.error("Error deleting product variants:", error);
    res.status(500).json({
      error: "Failed to delete product variants",
      message: error.message,
    });
  }
};

// Add this function to your controller

/**
 * Get stock information for a specific variant
 */
export const getVariantStock = async (req: Request, res: Response) => {
  try {
    const variantId = parseInt(req.params.variantId);

    if (isNaN(variantId)) {
      return res.status(400).json({
        error: "Invalid variant ID",
        message: "Variant ID must be a number",
      });
    }

    // Get variant details with stock information
    const variants = await callOdoo<any[]>(
      "product.product",
      "search_read",
      [[["id", "=", variantId]]],
      {
        fields: [
          "id",
          "name",
          "qty_available",
          "virtual_available",
          "incoming_qty",
          "outgoing_qty",
          "product_tmpl_id",
        ],
      }
    );

    if (!variants || variants.length === 0) {
      return res.status(404).json({
        error: "Variant not found",
        message: `No variant found with ID ${variantId}`,
      });
    }

    const variant = variants[0];

    // Format response with nicely formatted decimal values
    const response = {
      variant_id: variant.id,
      variant_name: variant.name,
      product_id: variant.product_tmpl_id[0],
      product_name: variant.product_tmpl_id[1],
      stock: {
        qty_available: parseFloat(variant.qty_available || 0).toFixed(2),
        qty_virtual: parseFloat(variant.virtual_available || 0).toFixed(2),
        qty_incoming: parseFloat(variant.incoming_qty || 0).toFixed(2),
        qty_outgoing: parseFloat(variant.outgoing_qty || 0).toFixed(2),
      },
    };

    return res.json(response);
  } catch (error: any) {
    console.error("Error fetching variant stock:", error);
    return res.status(500).json({
      error: "Failed to fetch variant stock",
      message: error.message || "An unexpected error occurred",
    });
  }
};
