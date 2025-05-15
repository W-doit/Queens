import { Request, Response } from "express";
import { callOdoo } from "../../utils/odooClient";
import {
  UpdateInventoryRequest,
  InventoryUpdateResponse,
} from "../../types/productos";

/**
 * Get current inventory levels for a product
 */
export const getInventory = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);

    // Check if product exists
    const products = await callOdoo<any[]>(
      "product.template",
      "search_read",
      [["id", "=", productId]],
      { fields: ["id", "name"] }
    );

    if (!products || products.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Get product variants
    const variants = await callOdoo<any[]>(
      "product.product",
      "search_read",
      [["product_tmpl_id", "=", productId]],
      {
        fields: [
          "id",
          "name",
          "qty_available",
          "virtual_available",
          "incoming_qty",
          "outgoing_qty",
        ],
      }
    );

    // Format response
    const inventoryData = {
      product_id: productId,
      product_name: products[0].name,
      variants: variants.map((variant) => ({
        variant_id: variant.id,
        variant_name: variant.name,
        qty_available: variant.qty_available || 0,
        virtual_available: variant.virtual_available || 0,
        incoming_qty: variant.incoming_qty || 0,
        outgoing_qty: variant.outgoing_qty || 0,
      })),
    };

    res.json(inventoryData);
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to fetch inventory data",
      message: error.message,
    });
  }
};

/**
 * Update inventory levels (add or remove stock)
 */
export const updateInventory = async (req: Request, res: Response) => {
  try {
    const { product_id, variant_id, qty_change, location_id, reason } =
      req.body as UpdateInventoryRequest;

    // Basic validation
    if (!product_id) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    if (qty_change === undefined || qty_change === 0) {
      return res
        .status(400)
        .json({ error: "Quantity change must be non-zero" });
    }

    // If no variant specified, try to get the default one
    let targetVariantId = variant_id;
    if (!targetVariantId) {
      const variants = await callOdoo<any[]>(
        "product.product",
        "search_read",
        [["product_tmpl_id", "=", product_id]],
        { fields: ["id"] }
      );

      if (!variants || variants.length === 0) {
        return res.status(404).json({ error: "Product variant not found" });
      }

      // Use the first variant if none specified
      targetVariantId = variants[0].id;
    }

    // Default location if not specified
    const targetLocationId = location_id || 12; // Assume 12 is stock location ID

    // Create an inventory adjustment
    const inventoryAdjustmentId = await callOdoo<number>(
      "stock.inventory",
      "create",
      [
        {
          name: reason || `Manual adjustment via API`,
          location_ids: [targetLocationId],
          product_ids: [targetVariantId],
        },
      ]
    );

    // Prepare the inventory
    await callOdoo("stock.inventory", "action_start", [
      [inventoryAdjustmentId],
    ]);

    // Get the current inventory line
    const inventoryLines = await callOdoo<any[]>(
      "stock.inventory.line",
      "search_read",
      [
        [
          ["inventory_id", "=", inventoryAdjustmentId],
          ["product_id", "=", targetVariantId],
        ],
      ],
      { fields: ["id", "product_qty"] }
    );

    // Update the quantity
    if (inventoryLines && inventoryLines.length > 0) {
      const line = inventoryLines[0];
      const newQty = Math.max(0, (line.product_qty || 0) + qty_change);

      await callOdoo("stock.inventory.line", "write", [
        [line.id],
        { product_qty: newQty },
      ]);

      // Validate inventory
      await callOdoo("stock.inventory", "action_validate", [
        [inventoryAdjustmentId],
      ]);

      // Get updated quantity
      const updatedVariant = await callOdoo<any[]>(
        "product.product",
        "read",
        [[targetVariantId]],
        { fields: ["qty_available"] }
      );

      const response: InventoryUpdateResponse = {
        product_id,
        variant_id: targetVariantId,
        new_qty: updatedVariant[0].qty_available,
        success: true,
        message: `Inventory updated successfully (${
          qty_change > 0 ? "+" : ""
        }${qty_change})`,
      };

      res.json(response);
    } else {
      throw new Error("Inventory line not found");
    }
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to update inventory",
      message: error.message,
    });
  }
};
