// Product business logic

import { callOdoo } from "../utils/odooClient";

/**
 * Generates a unique EAN-13 barcode for products
 */
export async function generateBarcode(): Promise<string> {
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

/**
 * Formats image data for Odoo by ensuring it's in base64 format
 */
export function formatImageForOdoo(imageData: string): string {
  // If the image already has a data URI prefix, strip it out
  if (imageData.includes("base64,")) {
    return imageData.split("base64,")[1];
  }
  // Otherwise return as is
  return imageData;
}

/**
 * Adds or updates size variants for a product
 */
export async function handleSizeVariants(
  productId: number,
  sizes: string[]
): Promise<boolean> {
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

    // Check if attribute line already exists for this product/attribute
    const existingAttributeLines = await callOdoo<any[]>(
      "product.template.attribute.line",
      "search_read",
      [
        [
          ["product_tmpl_id", "=", productId],
          ["attribute_id", "=", sizeAttributeId],
        ],
      ],
      { fields: ["id"] }
    );

    if (existingAttributeLines.length > 0) {
      // Update existing attribute line
      await callOdoo("product.template.attribute.line", "write", [
        [existingAttributeLines[0].id],
        { value_ids: sizeValueIds },
      ]);
    } else {
      // Create new attribute line
      await callOdoo("product.template.attribute.line", "create", [
        {
          product_tmpl_id: productId,
          attribute_id: sizeAttributeId,
          value_ids: sizeValueIds,
        },
      ]);
    }

    return true;
  } catch (error: any) {
    console.error("Error handling size variants:", error.message);
    throw error;
  }
}

/**
 * Adds or updates color variants for a product
 */
export async function handleColorVariants(
  productId: number,
  colors: string[]
): Promise<boolean> {
  try {
    // Check if "Color" attribute already exists
    const colorAttributes = await callOdoo<any[]>(
      "product.attribute",
      "search_read",
      [[["name", "=", "Color"]]],
      { fields: ["id", "name"] }
    );

    // Get or create the color attribute
    let colorAttributeId;
    if (colorAttributes.length > 0) {
      colorAttributeId = colorAttributes[0].id;
    } else {
      colorAttributeId = await callOdoo("product.attribute", "create", [
        { name: "Color", create_variant: true },
      ]);
    }

    // Create or find attribute values for each color
    const colorValueIds = [];
    for (const color of colors) {
      // Check if color value already exists
      const existingValues = await callOdoo<any[]>(
        "product.attribute.value",
        "search_read",
        [
          [
            ["name", "=", color],
            ["attribute_id", "=", colorAttributeId],
          ],
        ],
        { fields: ["id"] }
      );

      let colorValueId;
      if (existingValues.length > 0) {
        colorValueId = existingValues[0].id;
      } else {
        colorValueId = await callOdoo("product.attribute.value", "create", [
          { name: color, attribute_id: colorAttributeId },
        ]);
      }
      colorValueIds.push(colorValueId);
    }

    // Check if attribute line already exists for this product/attribute
    const existingAttributeLines = await callOdoo<any[]>(
      "product.template.attribute.line",
      "search_read",
      [
        [
          ["product_tmpl_id", "=", productId],
          ["attribute_id", "=", colorAttributeId],
        ],
      ],
      { fields: ["id"] }
    );

    if (existingAttributeLines.length > 0) {
      // Update existing attribute line
      await callOdoo("product.template.attribute.line", "write", [
        [existingAttributeLines[0].id],
        { value_ids: colorValueIds },
      ]);
    } else {
      // Create new attribute line
      await callOdoo("product.template.attribute.line", "create", [
        {
          product_tmpl_id: productId,
          attribute_id: colorAttributeId,
          value_ids: colorValueIds,
        },
      ]);
    }

    return true;
  } catch (error: any) {
    console.error("Error handling color variants:", error.message);
    throw error;
  }
}
