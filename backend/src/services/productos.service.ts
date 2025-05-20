// Product business logic
import { callOdoo } from "../utils/odooClient";

/**
 * Generates a valid EAN-13 barcode
 */
export function generateBarcode(): string {
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
  return imageData;
}

/**
 * Create or update size variants for a product
 */
export async function handleSizeVariants(productId: number, sizes: string[]) {
  console.log(
    `Setting up size variants for product ${productId}: ${sizes.join(", ")}`
  );

  // Step 1: Find or create Size attribute
  let sizeAttributeId: number;
  const existingSizeAttribute = await callOdoo(
    "product.attribute",
    "search_read",
    [[["name", "ilike", "Size"]]],
    { fields: ["id"] }
  );

  if (existingSizeAttribute && existingSizeAttribute.length > 0) {
    sizeAttributeId = existingSizeAttribute[0].id;
    console.log(`Using existing Size attribute ID: ${sizeAttributeId}`);
  } else {
    sizeAttributeId = await callOdoo("product.attribute", "create", [
      { name: "Size" },
    ]);
    console.log(`Created new Size attribute with ID: ${sizeAttributeId}`);
  }

  // Step 2: Get or create size values
  const sizeValueIds: number[] = [];
  for (const size of sizes) {
    const existingSize = await callOdoo(
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

    let sizeValueId: number;
    if (existingSize && existingSize.length > 0) {
      sizeValueId = existingSize[0].id;
      console.log(
        `Using existing size value '${size}' with ID: ${sizeValueId}`
      );
    } else {
      sizeValueId = await callOdoo("product.attribute.value", "create", [
        {
          name: size,
          attribute_id: sizeAttributeId,
        },
      ]);
      console.log(`Created new size value '${size}' with ID: ${sizeValueId}`);
    }

    sizeValueIds.push(sizeValueId);
  }

  // Step 3: Check if attribute line already exists for this product and attribute
  const existingAttrLine = await callOdoo(
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

  // Step 4: Create or update attribute line with all size values
  if (existingAttrLine && existingAttrLine.length > 0) {
    const lineId = existingAttrLine[0].id;
    console.log(`Updating existing attribute line ${lineId} with size values`);

    await callOdoo("product.template.attribute.line", "write", [
      [lineId],
      {
        value_ids: [[6, 0, sizeValueIds]],
      },
    ]);
  } else {
    console.log(
      `Creating new attribute line for product ${productId} with size values`
    );

    await callOdoo("product.template.attribute.line", "create", [
      {
        product_tmpl_id: productId,
        attribute_id: sizeAttributeId,
        value_ids: [[6, 0, sizeValueIds]],
      },
    ]);
  }

  console.log(`Successfully set up size variants for product ${productId}`);
}

/**
 * Create or update color variants for a product
 */
export async function handleColorVariants(productId: number, colors: string[]) {
  console.log(
    `Setting up color variants for product ${productId}: ${colors.join(", ")}`
  );

  // Step 1: Find or create Color attribute
  let colorAttributeId: number;
  const existingColorAttribute = await callOdoo(
    "product.attribute",
    "search_read",
    [[["name", "ilike", "Color"]]],
    { fields: ["id"] }
  );

  if (existingColorAttribute && existingColorAttribute.length > 0) {
    colorAttributeId = existingColorAttribute[0].id;
    console.log(`Using existing Color attribute ID: ${colorAttributeId}`);
  } else {
    colorAttributeId = await callOdoo("product.attribute", "create", [
      { name: "Color" },
    ]);
    console.log(`Created new Color attribute with ID: ${colorAttributeId}`);
  }

  // Step 2: Get or create color values
  const colorValueIds: number[] = [];
  for (const color of colors) {
    const existingColor = await callOdoo(
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

    let colorValueId: number;
    if (existingColor && existingColor.length > 0) {
      colorValueId = existingColor[0].id;
      console.log(
        `Using existing color value '${color}' with ID: ${colorValueId}`
      );
    } else {
      colorValueId = await callOdoo("product.attribute.value", "create", [
        {
          name: color,
          attribute_id: colorAttributeId,
        },
      ]);
      console.log(
        `Created new color value '${color}' with ID: ${colorValueId}`
      );
    }

    colorValueIds.push(colorValueId);
  }

  // Step 3: Check if attribute line already exists for this product and attribute
  const existingAttrLine = await callOdoo(
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

  // Step 4: Create or update attribute line with all color values
  if (existingAttrLine && existingAttrLine.length > 0) {
    const lineId = existingAttrLine[0].id;
    console.log(`Updating existing attribute line ${lineId} with color values`);

    await callOdoo("product.template.attribute.line", "write", [
      [lineId],
      {
        value_ids: [[6, 0, colorValueIds]],
      },
    ]);
  } else {
    console.log(
      `Creating new attribute line for product ${productId} with color values`
    );

    await callOdoo("product.template.attribute.line", "create", [
      {
        product_tmpl_id: productId,
        attribute_id: colorAttributeId,
        value_ids: [[6, 0, colorValueIds]],
      },
    ]);
  }

  console.log(`Successfully set up color variants for product ${productId}`);
}

/**
 * Generate all variant combinations from existing attributes
 */
export async function generateVariantCombinations(productId: number) {
  try {
    console.log(
      `Attempting to generate variant combinations for product ${productId}`
    );

    // First try the direct method
    try {
      await callOdoo("product.template", "create_variant_ids", [[productId]]);
      console.log("Successfully generated variants using create_variant_ids");
      return true;
    } catch (error) {
      console.log(
        "Direct variant creation failed, trying alternatives:",
        error
      );

      try {
        // Some versions use this method instead
        await callOdoo("product.template", "_create_variant_ids", [
          [productId],
        ]);
        console.log(
          "Successfully generated variants using _create_variant_ids"
        );
        return true;
      } catch (error2) {
        console.log(
          "Alternative method failed, trying product update:",
          error2
        );

        // Last resort: trigger update to generate variants
        await callOdoo("product.template", "write", [
          [productId],
          { active: true },
        ]);
        console.log("Triggered product update to generate variants");

        // Set create_variant flag to always
        try {
          await callOdoo("product.template", "write", [
            [productId],
            { create_variant: "always" },
          ]);
          console.log("Set create_variant to always");
          return true;
        } catch (error3) {
          console.error("Failed all attempts to create variants:", error3);
          return false;
        }
      }
    }
  } catch (finalError) {
    console.error("Fatal error in generateVariantCombinations:", finalError);
    return false;
  }
}

// Add this new function to the file:

/**
 * Generate and set barcodes for product variants
 */
export async function setVariantBarcodes(variants: any[], productId: number) {
  if (!variants || !Array.isArray(variants) || variants.length === 0) {
    return [];
  }

  const updatedVariants = [];

  for (const variant of variants) {
    if (!variant.barcode) {
      try {
        // Generate a unique barcode
        const timestamp = Date.now().toString().slice(-6);
        const barcode = `P${productId}V${variant.id}${timestamp}`;

        // Update the variant with the new barcode
        await callOdoo("product.product", "write", [
          [variant.id],
          { barcode: barcode },
        ]);

        updatedVariants.push({
          id: variant.id,
          name: variant.name,
          barcode: barcode,
        });
      } catch (error) {
        console.error(
          `Error setting barcode for variant ${variant.id}:`,
          error
        );
      }
    }
  }

  return updatedVariants;
}

/**
 * Fix variant names to properly include attribute values
 */
export async function fixVariantNames(variants: any[], productName: string) {
  if (!variants || !Array.isArray(variants) || variants.length === 0) {
    return [];
  }

  const updatedVariants = [];

  for (const variant of variants) {
    if (
      !variant.product_template_attribute_value_ids ||
      variant.product_template_attribute_value_ids.length === 0
    ) {
      continue;
    }

    try {
      // Get attribute values for better naming
      const attrValues = await callOdoo<any[]>(
        "product.template.attribute.value",
        "read",
        [variant.product_template_attribute_value_ids],
        { fields: ["id", "name", "attribute_id"] }
      );

      // Build attribute part of name
      const attrNames = attrValues
        .map((attr) => attr.name)
        .filter((name) => name);

      if (attrNames.length > 0) {
        const newName = `${productName} - ${attrNames.join(" - ")}`;

        if (newName !== variant.name) {
          await callOdoo("product.product", "write", [
            [variant.id],
            { name: newName },
          ]);

          updatedVariants.push({
            id: variant.id,
            name: newName,
          });
        }
      }
    } catch (error) {
      console.error(`Error fixing name for variant ${variant.id}:`, error);
    }
  }

  return updatedVariants;
}
