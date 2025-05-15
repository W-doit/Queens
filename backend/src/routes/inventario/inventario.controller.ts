import { Request, Response } from "express";
import { callOdoo } from "../../utils/odooClient";
import {
  UpdateInventoryRequest,
  InventoryUpdateResponse,
  Location,
  ProductInventory,
  VariantInventory,
  MovementsResponse,
  InventoryMovement,
} from "../../types/inventario";

/**
 * Get inventory levels for a product and its variants
 */
export const getInventory = async (req: Request, res: Response) => {
  try {
    const productIdParam = req.params.id;
    console.log(`Looking up inventory for product ID: ${productIdParam}`);

    const productId = parseInt(productIdParam);

    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID format" });
    }

    // Use the same approach that worked in your debug route
    console.log(`Searching for product template with ID ${productId}`);
    const templates = await callOdoo<any[]>(
      "product.template",
      "search_read",
      [[["id", "=", productId]]],
      { fields: ["id", "name", "product_variant_ids"] }
    );

    console.log(`Search returned ${templates?.length || 0} templates`);

    if (!templates || templates.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const template = templates[0];
    console.log(
      `Found template: ${template.name} with ${
        template.product_variant_ids?.length || 0
      } variants`
    );

    // If no variant IDs found, return empty variants array
    if (!template.product_variant_ids || !template.product_variant_ids.length) {
      return res.json({
        product_id: productId,
        product_name: template.name,
        variants: [],
      });
    }

    // Get all variants for this product
    console.log(
      `Fetching variants with IDs: ${JSON.stringify(
        template.product_variant_ids
      )}`
    );
    const variants = await callOdoo<any[]>(
      "product.product",
      "search_read",
      [[["id", "in", template.product_variant_ids]]],
      {
        fields: [
          "id",
          "name",
          "qty_available",
          "virtual_available",
          "incoming_qty",
          "outgoing_qty",
          "barcode",
        ],
      }
    );

    console.log(`Found ${variants?.length || 0} variants`);

    // Format variants
    const variantData: VariantInventory[] = variants.map((variant: any) => {
      // Extract size/color from variant name if present
      let size: string | undefined;
      let color: string | undefined;

      if (variant.name.includes(" - ")) {
        const parts = variant.name.split(" - ");
        size = parts[parts.length - 1];
      }

      return {
        variant_id: variant.id,
        variant_name: variant.name,
        size,
        color,
        qty_available: variant.qty_available || 0,
        qty_virtual: variant.virtual_available || 0,
        qty_incoming: variant.incoming_qty || 0,
        qty_outgoing: variant.outgoing_qty || 0,
        barcode: variant.barcode,
      };
    });

    // Build response
    const response: ProductInventory = {
      product_id: productId,
      product_name: template.name,
      variants: variantData,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({
      error: "Failed to fetch inventory data",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Update inventory levels for a product or variant
 */
// Fix for the updateInventory function
export const updateInventory = async (req: Request, res: Response) => {
  try {
    console.log("Inventory update request:", req.body);
    const { product_id, variant_id, qty_change, location_id, reason } =
      req.body as UpdateInventoryRequest;

    if (qty_change === undefined) {
      return res.status(400).json({
        error: "Invalid quantity change",
        message: "Please specify a quantity change (positive or negative)",
      });
    }

    // Need either product_id or variant_id
    if (!product_id && !variant_id) {
      return res.status(400).json({
        error: "Missing product identifier",
        message: "Please specify either product_id or variant_id",
      });
    }

    // If variant_id is provided, use it directly
    let targetVariantId: number;
    if (variant_id) {
      targetVariantId = variant_id;
      console.log(`Using provided variant ID: ${targetVariantId}`);
    } else if (product_id) {
      // If only product_id is provided, get its default variant
      console.log(`Finding variants for product template ID: ${product_id}`);

      const variants = await callOdoo<any[]>(
        "product.product",
        "search_read",
        [[["product_tmpl_id", "=", product_id]]],
        { fields: ["id", "name"] }
      );

      console.log(
        `Found ${variants?.length || 0} variants for product ${product_id}`
      );

      if (!variants || variants.length === 0) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Use the first variant if multiple exist
      targetVariantId = variants[0].id;
      console.log(
        `Using variant: ${variants[0].name} (ID: ${targetVariantId})`
      );
    } else {
      return res.status(400).json({ error: "Invalid product identifiers" });
    }

    // Check if variant exists and get current quantity
    console.log(`Checking variant ID: ${targetVariantId}`);
    const variantCheck = await callOdoo<any[]>(
      "product.product",
      "search_read",
      [[["id", "=", targetVariantId]]],
      { fields: ["id", "qty_available", "name"] }
    );

    console.log(`Variant check result:`, variantCheck);

    if (!variantCheck || variantCheck.length === 0) {
      return res.status(404).json({ error: "Product variant not found" });
    }

    // Calculate new quantity
    const currentQty = variantCheck[0].qty_available || 0;
    const newQty = currentQty + qty_change;

    console.log(
      `Current qty: ${currentQty}, Change: ${qty_change}, New qty: ${newQty}`
    );

    if (newQty < 0 && qty_change < 0) {
      return res.status(400).json({
        error: "Insufficient stock",
        message: `Current stock (${currentQty}) is not enough to remove ${Math.abs(
          qty_change
        )} units`,
      });
    }

    // Get default stock location if none provided
    const stockLocationId = location_id || (await getDefaultStockLocation());
    console.log(`Using stock location ID: ${stockLocationId}`);

    // APPROACH 2: Use Stock Quants directly

    // Step 1: Check if there's an existing quant for this product at this location
    console.log(`Looking for existing quants at location ${stockLocationId}`);
    const existingQuants = await callOdoo<any[]>(
      "stock.quant",
      "search_read",
      [
        [
          ["product_id", "=", targetVariantId],
          ["location_id", "=", stockLocationId],
        ],
      ],
      { fields: ["id", "quantity"] }
    );

    console.log(
      `Found ${existingQuants?.length || 0} existing quants:`,
      existingQuants
    );

    if (existingQuants && existingQuants.length > 0) {
      // Update existing quant
      console.log(
        `Updating existing quant ${existingQuants[0].id} to quantity ${newQty}`
      );
      await callOdoo("stock.quant", "write", [
        [existingQuants[0].id],
        { quantity: newQty },
      ]);
    } else {
      // Create new quant
      console.log(`Creating new quant with quantity ${newQty}`);
      await callOdoo("stock.quant", "create", [
        {
          product_id: targetVariantId,
          location_id: stockLocationId,
          quantity: newQty,
        },
      ]);
    }

    // Create inventory move for record-keeping
    if (reason) {
      console.log(`Creating inventory move record for: ${reason}`);
      try {
        // Use stock.move to create a movement record
        const sourceLocationId = qty_change > 0 ? 8 : stockLocationId; // 8 is typically supplier location
        const destLocationId = qty_change > 0 ? stockLocationId : 9; // 9 is typically customer location

        await callOdoo("stock.move", "create", [
          {
            name: reason || `Inventory update via API`,
            product_id: targetVariantId,
            product_uom_qty: Math.abs(qty_change),
            product_uom: 1, // Default unit of measure
            location_id: sourceLocationId,
            location_dest_id: destLocationId,
            state: "done",
            origin: `API adjustment: ${reason || "No reason provided"}`,
          },
        ]);

        console.log(`Created inventory movement record`);
      } catch (moveError) {
        console.error(
          "Error creating movement record (non-critical):",
          moveError
        );
        // Continue anyway - this is just for record keeping
      }
    }

    // Get updated data - make sure it's refreshed
    console.log(`Getting updated variant data`);

    // Invalidate cache for this product (Odoo might cache the result)
    try {
      await callOdoo("product.product", "_invalidate_cache", []);
    } catch (error) {
      console.log(
        "Invalidating cache failed - this is OK. We'll fetch the latest data anyway."
      );
    }

    const updatedVariant = await callOdoo<any[]>(
      "product.product",
      "search_read",
      [[["id", "=", targetVariantId]]],
      { fields: ["qty_available", "name"] }
    );

    const response: InventoryUpdateResponse = {
      product_id: product_id || null,
      variant_id: targetVariantId,
      variant_name: updatedVariant[0].name,
      new_qty: updatedVariant[0].qty_available,
      success: true,
      message: `Inventory successfully updated (${
        qty_change > 0 ? "+" : ""
      }${qty_change})`,
    };

    console.log(`Inventory update successful:`, response);
    res.json(response);
  } catch (error: any) {
    console.error("Error updating inventory:", error);
    res.status(500).json({
      error: "Failed to update inventory",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Helper function to get default stock location
async function getDefaultStockLocation(): Promise<number> {
  try {
    const locations = await callOdoo<any[]>(
      "stock.location",
      "search_read",
      [[["usage", "=", "internal"]]],
      { fields: ["id"], limit: 1 }
    );

    if (locations && locations.length > 0) {
      return locations[0].id;
    }

    // Default to stock location ID 12 if none found
    return 12;
  } catch (error) {
    console.error("Error getting default location:", error);
    return 12; // Fallback to a common stock location ID
  }
}

/**
 * Get warehouse locations
 */
export const getLocations = async (req: Request, res: Response) => {
  try {
    const locations = await callOdoo<any[]>(
      "stock.location",
      "search_read",
      [["usage", "=", "internal"]],
      { fields: ["id", "name", "complete_name"] }
    );

    const formattedLocations: Location[] = locations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      complete_path: loc.complete_name,
    }));

    res.json(formattedLocations);
  } catch (error: any) {
    console.error("Error fetching locations:", error);
    res.status(500).json({
      error: "Failed to fetch locations",
      message: error.message,
    });
  }
};

/**
 * Get inventory movements for a product
 */
export const getMovements = async (req: Request, res: Response) => {
  try {
    // Parse parameters with validation
    const productIdParam = req.params.id;
    if (!productIdParam) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const productId = parseInt(productIdParam);

    // Validate product ID
    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    // Parse other query parameters
    const variantId = req.query.variant_id
      ? parseInt(req.query.variant_id as string)
      : undefined;

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

    // Build domain filter
    let domain: any[] = [];

    if (variantId) {
      // If variant ID is provided, search for that specific variant
      domain.push(["product_id", "=", variantId]);
    } else {
      // If only product ID is provided, search for all its variants
      const variants = await callOdoo<any[]>(
        "product.product",
        "search_read",
        [["product_tmpl_id", "=", productId]],
        { fields: ["id"] }
      );

      if (variants && variants.length > 0) {
        const variantIds = variants.map((v) => v.id);
        domain.push(["product_id", "in", variantIds]);
      } else {
        return res.status(404).json({ error: "Product not found" });
      }
    }

    // Get movements
    const moves = await callOdoo<any[]>("stock.move", "search_read", [domain], {
      fields: [
        "id",
        "reference",
        "origin",
        "product_id",
        "product_qty",
        "location_id",
        "location_dest_id",
        "state",
        "date",
      ],
      limit,
      offset,
      order: "date DESC",
    });

    // Get total count
    const total = await callOdoo<number>("stock.move", "search_count", [
      domain,
    ]);

    // Format movements with location names
    const formattedMoves = await Promise.all(
      moves.map(async (move) => {
        // Get location names
        const fromLocationResult = await callOdoo<any[]>(
          "stock.location",
          "read",
          [[move.location_id[0]]],
          { fields: ["name"] }
        );

        const toLocationResult = await callOdoo<any[]>(
          "stock.location",
          "read",
          [[move.location_dest_id[0]]],
          { fields: ["name"] }
        );

        // Safely extract location names
        const fromLocationName =
          fromLocationResult && fromLocationResult.length > 0
            ? fromLocationResult[0].name
            : "Unknown";

        const toLocationName =
          toLocationResult && toLocationResult.length > 0
            ? toLocationResult[0].name
            : "Unknown";

        // Determine movement type
        let type: "inbound" | "outbound" | "internal" = "internal";
        const fromLocationId = move.location_id[0];
        const toLocationId = move.location_dest_id[0];

        // Check if source or destination is a customer/supplier/inventory location
        const internalLocations = await callOdoo<any[]>(
          "stock.location",
          "search_read",
          [["usage", "=", "internal"]],
          { fields: ["id"] }
        );

        const internalLocationIds = internalLocations.map((loc) => loc.id);

        const isSourceInternal = internalLocationIds.includes(fromLocationId);
        const isDestInternal = internalLocationIds.includes(toLocationId);

        if (isSourceInternal && !isDestInternal) {
          type = "outbound";
        } else if (!isSourceInternal && isDestInternal) {
          type = "inbound";
        }

        // Format movement
        const movement: InventoryMovement = {
          id: move.id,
          reference: move.reference || "",
          origin: move.origin,
          product_id: move.product_id[0],
          product_name: move.product_id[1],
          quantity: move.product_qty,
          from_location: {
            id: fromLocationId,
            name: fromLocationName,
          },
          to_location: {
            id: toLocationId,
            name: toLocationName,
          },
          state: move.state,
          date: move.date,
          type,
        };

        return movement;
      })
    );

    // Build response
    const response: MovementsResponse = {
      movements: formattedMoves,
      total,
      page: Math.floor(offset / limit) + 1,
      limit,
    };

    res.json(response);
  } catch (error: any) {
    console.error("Error fetching inventory movements:", error);
    res.status(500).json({
      error: "Failed to fetch inventory movements",
      message: error.message,
    });
  }
};
