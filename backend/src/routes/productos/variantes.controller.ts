// Variant controller logic

import { Request, Response } from "express";
import { callOdoo } from "../../utils/odooClient";
import { ProductVariant, SizeInfo, ColorInfo } from "../../types/productos";
import {
  handleSizeVariants,
  handleColorVariants,
  generateVariantCombinations,
  setVariantBarcodes,
  fixVariantNames,
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
 * Update product variants for a specific product
 */
export const updateProductVariants = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    const { sizes = [], colors = [], otherAttributes = [] } = req.body;

    // Input validation
    if (!productId || isNaN(productId)) {
      return res.status(400).json({
        error: "Invalid product ID",
        message: "Product ID must be a valid number",
      });
    }

    // Check that the product exists
    const products = await callOdoo<any[]>(
      "product.template",
      "search_read",
      [[["id", "=", productId]]],
      { fields: ["id", "name"] }
    );

    if (!products || products.length === 0) {
      return res.status(404).json({
        error: "Product not found",
        message: `No product found with ID ${productId}`,
      });
    }

    // Prepare attribute data
    const attributesList = [];

    // Add size attribute if sizes are provided
    if (sizes && sizes.length > 0) {
      // Look up the size attribute ID
      const sizeAttributes = await callOdoo<any[]>(
        "product.attribute",
        "search_read",
        [[["name", "=", "Size"]]],
        { fields: ["id", "name"] }
      );

      let sizeAttributeId;

      if (sizeAttributes && sizeAttributes.length > 0) {
        sizeAttributeId = sizeAttributes[0].id;
      } else {
        // Create size attribute if it doesn't exist
        sizeAttributeId = await callOdoo("product.attribute", "create", [
          { name: "Size", create_variant: "always" },
        ]);
      }

      // Create size values if they don't exist
      const sizeValues = [];
      for (const size of sizes) {
        const existingValues = await callOdoo<any[]>(
          "product.attribute.value",
          "search_read",
          [
            [
              ["name", "=", size],
              ["attribute_id", "=", sizeAttributeId],
            ],
          ],
          { fields: ["id", "name"] }
        );

        if (existingValues && existingValues.length > 0) {
          sizeValues.push(existingValues[0].id);
        } else {
          const newValueId = await callOdoo(
            "product.attribute.value",
            "create",
            [{ name: size, attribute_id: sizeAttributeId }]
          );
          sizeValues.push(newValueId);
        }
      }

      attributesList.push({
        attribute_id: sizeAttributeId,
        value_ids: sizeValues,
      });
    }

    // Add color attribute if colors are provided
    if (colors && colors.length > 0) {
      // Look up the color attribute ID
      const colorAttributes = await callOdoo<any[]>(
        "product.attribute",
        "search_read",
        [[["name", "=", "Color"]]],
        { fields: ["id", "name"] }
      );

      let colorAttributeId;

      if (colorAttributes && colorAttributes.length > 0) {
        colorAttributeId = colorAttributes[0].id;
      } else {
        // Create color attribute if it doesn't exist
        colorAttributeId = await callOdoo("product.attribute", "create", [
          { name: "Color", create_variant: "always" },
        ]);
      }

      // Create color values if they don't exist
      const colorValues = [];
      for (const color of colors) {
        const existingValues = await callOdoo<any[]>(
          "product.attribute.value",
          "search_read",
          [
            [
              ["name", "=", color],
              ["attribute_id", "=", colorAttributeId],
            ],
          ],
          { fields: ["id", "name"] }
        );

        if (existingValues && existingValues.length > 0) {
          colorValues.push(existingValues[0].id);
        } else {
          const newValueId = await callOdoo(
            "product.attribute.value",
            "create",
            [{ name: color, attribute_id: colorAttributeId }]
          );
          colorValues.push(newValueId);
        }
      }

      attributesList.push({
        attribute_id: colorAttributeId,
        value_ids: colorValues,
      });
    }

    // Add other attributes if provided
    if (otherAttributes && otherAttributes.length > 0) {
      for (const attr of otherAttributes) {
        if (!attr.name || !attr.values || !Array.isArray(attr.values)) {
          continue;
        }

        // Look up the attribute ID
        const existingAttrs = await callOdoo<any[]>(
          "product.attribute",
          "search_read",
          [[["name", "=", attr.name]]],
          { fields: ["id", "name"] }
        );

        let attrId;

        if (existingAttrs && existingAttrs.length > 0) {
          attrId = existingAttrs[0].id;
        } else {
          // Create attribute if it doesn't exist
          attrId = await callOdoo("product.attribute", "create", [
            { name: attr.name, create_variant: "always" },
          ]);
        }

        // Create attribute values if they don't exist
        const attrValues = [];
        for (const value of attr.values) {
          const existingValues = await callOdoo<any[]>(
            "product.attribute.value",
            "search_read",
            [
              [
                ["name", "=", value],
                ["attribute_id", "=", attrId],
              ],
            ],
            { fields: ["id", "name"] }
          );

          if (existingValues && existingValues.length > 0) {
            attrValues.push(existingValues[0].id);
          } else {
            const newValueId = await callOdoo(
              "product.attribute.value",
              "create",
              [{ name: value, attribute_id: attrId }]
            );
            attrValues.push(newValueId);
          }
        }

        attributesList.push({
          attribute_id: attrId,
          value_ids: attrValues,
        });
      }
    }

    // If we have attributes to add, update the product
    if (attributesList.length > 0) {
      // Create attribute lines
      for (const attrData of attributesList) {
        // Check if attribute line already exists for this attribute
        const existingLines = await callOdoo<any[]>(
          "product.template.attribute.line",
          "search_read",
          [
            [
              ["product_tmpl_id", "=", productId],
              ["attribute_id", "=", attrData.attribute_id],
            ],
          ],
          { fields: ["id"] }
        );

        if (existingLines && existingLines.length > 0) {
          // Update existing attribute line
          await callOdoo("product.template.attribute.line", "write", [
            [existingLines[0].id],
            { value_ids: [[6, 0, attrData.value_ids]] },
          ]);
        } else {
          // Create new attribute line
          await callOdoo("product.template.attribute.line", "create", [
            {
              product_tmpl_id: productId,
              attribute_id: attrData.attribute_id,
              value_ids: [[6, 0, attrData.value_ids]],
            },
          ]);
        }
      }
    }

    // Try to generate variants if needed
    try {
      await callOdoo("product.template", "create_variant_ids", [[productId]]);
      console.log("Variants created successfully");
    } catch (variantGenError) {
      console.error("Error generating variants:", variantGenError);
      // Continue anyway as the attributes were set successfully
    }

    // Wait a moment for variants to be fully created
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Get all variants to set barcodes and fix names
    const variants = await callOdoo<ProductVariant[]>(
      "product.product",
      "search_read",
      [[["product_tmpl_id", "=", productId]]],
      {
        fields: [
          "id",
          "name",
          "barcode",
          "product_template_attribute_value_ids",
          "display_name",
        ],
      }
    );

    console.log(`Found ${variants?.length || 0} variants to process`);

    // Process each variant to ensure barcode and name are correct
    if (variants && variants.length > 0) {
      console.log(
        `Processing ${variants.length} variants to update barcodes and names`
      );

      // First, set barcodes for variants without them
      try {
        const barcodeResults = await setVariantBarcodes(variants, productId);
        console.log(`Updated barcodes for ${barcodeResults.length} variants`);
      } catch (barcodeError) {
        console.error("Error setting variant barcodes:", barcodeError);
      }

      // Then fix variant names
      try {
        const nameResults = await fixVariantNames(variants, products[0].name);
        console.log(`Updated names for ${nameResults.length} variants`);
      } catch (nameError) {
        console.error("Error fixing variant names:", nameError);
      }

      // Get updated variants
      const updatedVariants = await callOdoo<ProductVariant[]>(
        "product.product",
        "search_read",
        [[["product_tmpl_id", "=", productId]]],
        {
          fields: ["id", "name", "barcode"],
        }
      );

      // Response with updated variants info
      return res.json({
        message: "Product variants updated successfully",
        product_id: productId,
        variants_updated: updatedVariants.length,
        variants: updatedVariants.map((v) => ({
          id: v.id,
          name: v.name,
          barcode: v.barcode,
        })),
      });
    }

    // If we got here, the attributes were successfully set but no variants were processed
    return res.json({
      message: "Product attributes updated successfully",
      product_id: productId,
      variants_updated: 0,
    });
  } catch (error: any) {
    console.error("Error updating product variants:", error);
    return res.status(500).json({
      error: "Failed to update product variants",
      message: error.message || "An unexpected error occurred",
    });
  }
};
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
