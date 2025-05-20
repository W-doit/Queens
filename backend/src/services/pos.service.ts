// POS business logic

import { callOdoo } from "../utils/odooClient";

/**
 * Get the currently active POS session
 */
export async function getActiveSession() {
  try {
    console.log("Searching for active POS sessions...");

    // Search for any session in 'opened' state
    const sessions = await callOdoo<any[]>(
      "pos.session",
      "search_read",
      [[["state", "=", "opened"]]],
      {
        fields: [
          "id",
          "name",
          "user_id",
          "config_id",
          "start_at",
          "state",
          "payment_method_ids",
        ],
        order: "create_date DESC",
        limit: 1,
      }
    );

    if (sessions && sessions.length > 0) {
      console.log(
        `Found active session: ${sessions[0].name} (ID: ${sessions[0].id})`
      );
      return sessions[0];
    }

    // If no 'opened' session found, also check for 'opening_control' sessions
    // which might just need to be opened
    const pendingSessions = await callOdoo<any[]>(
      "pos.session",
      "search_read",
      [[["state", "=", "opening_control"]]],
      {
        fields: [
          "id",
          "name",
          "user_id",
          "config_id",
          "start_at",
          "state",
          "payment_method_ids",
        ],
        order: "create_date DESC",
        limit: 1,
      }
    );

    if (pendingSessions && pendingSessions.length > 0) {
      console.log(
        `Found pending session in 'opening_control' state: ${pendingSessions[0].name}`
      );

      // Try to open this session
      await callOdoo("pos.session", "action_pos_session_open", [
        [pendingSessions[0].id],
      ]);

      // Get updated session data
      const updatedSessions = await callOdoo<any[]>(
        "pos.session",
        "read",
        [[pendingSessions[0].id]],
        {
          fields: [
            "id",
            "name",
            "user_id",
            "config_id",
            "start_at",
            "state",
            "payment_method_ids",
          ],
        }
      );

      if (
        updatedSessions &&
        updatedSessions.length > 0 &&
        updatedSessions[0].state === "opened"
      ) {
        console.log(
          `Successfully opened pending session: ${updatedSessions[0].name}`
        );
        return updatedSessions[0];
      }
    }

    console.log("No active POS session found");
    return null;
  } catch (error) {
    console.error("Error getting active POS session:", error);
    return null;
  }
}

/**
 * Check if an order exists and is in draft state
 */
export async function isOrderEditable(orderId: number) {
  try {
    const orders = await callOdoo<any[]>("pos.order", "read", [[orderId]], {
      fields: ["state"],
    });

    if (!orders || orders.length === 0) {
      return { exists: false, editable: false };
    }

    return { exists: true, editable: orders[0].state === "draft" };
  } catch (error) {
    console.error("Error checking order status:", error);
    return { exists: false, editable: false };
  }
}

/**
 * Get product information with price
 */
export async function getProductInfo(productId: number) {
  try {
    const products = await callOdoo<any[]>(
      "product.product",
      "read",
      [[productId]],
      { fields: ["name", "list_price", "taxes_id", "barcode", "default_code"] }
    );

    if (!products || products.length === 0) {
      return null;
    }

    return products[0];
  } catch (error) {
    console.error("Error getting product info:", error);
    return null;
  }
}

/**
 * Search for products by barcode, reference or name
 */
export async function searchProducts(query: string, limit: number = 20) {
  try {
    // Build domain to search by barcode or name
    const domain = [
      "|",
      "|",
      ["barcode", "=", query], // Exact match on barcode
      ["name", "ilike", `%${query}%`], // Partial match on name
      ["default_code", "ilike", `%${query}%`], // Partial match on reference
    ];

    const products = await callOdoo<any[]>(
      "product.product",
      "search_read",
      [domain],
      {
        fields: ["id", "name", "list_price", "barcode", "default_code"],
        limit,
      }
    );

    return products || [];
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
}

/**
 * Calculate order total and update it
 */
export async function recalculateOrder(orderId: number) {
  try {
    // This is just a trigger for Odoo to recalculate the order totals
    await callOdoo("pos.order", "write", [[orderId], { to_invoice: false }]);

    // Return the updated order totals
    const orders = await callOdoo<any[]>("pos.order", "read", [[orderId]], {
      fields: ["amount_total", "amount_tax"],
    });

    if (!orders || orders.length === 0) {
      return null;
    }

    return {
      total: orders[0].amount_total,
      tax: orders[0].amount_tax,
    };
  } catch (error) {
    console.error("Error recalculating order:", error);
    return null;
  }
}

/**
 * Process stock movements for a paid order
 * This ensures inventory is updated after a sale
 */
export async function processStockMovements(orderId: number): Promise<boolean> {
  try {
    console.log(`Processing stock movements for order ${orderId}...`);

    // 1. First try to create the stock picking (if not already created)
    try {
      await callOdoo("pos.order", "create_picking", [[orderId]]);
      console.log("Created picking for order");
    } catch (createError: any) {
      // Add type annotation
      console.log(
        "Picking might already exist or couldn't be created:",
        createError.message
      );
    }

    // 2. Get order with picking information
    const orders = await callOdoo<any[]>(
      "pos.order",
      "search_read",
      [[["id", "=", orderId]]],
      { fields: ["id", "name", "state", "picking_id", "picking_ids"] }
    );

    if (!orders || orders.length === 0) {
      console.error("Order not found when processing stock");
      return false;
    }

    const order = orders[0];

    // Handle different Odoo versions (some use picking_id, some use picking_ids)
    let pickingIds: number[] = [];

    if (
      order.picking_ids &&
      Array.isArray(order.picking_ids) &&
      order.picking_ids.length > 0
    ) {
      // Multiple pickings case
      pickingIds = order.picking_ids;
    } else if (order.picking_id && order.picking_id[0]) {
      // Single picking case
      pickingIds = [order.picking_id[0]];
    } else {
      console.warn("No picking found for this order");
      return false;
    }

    // 3. Process each picking
    let success = false;

    for (const pickingId of pickingIds) {
      try {
        console.log(`Processing stock picking ID ${pickingId}`);

        // 3.1 Get current picking state
        const pickings = await callOdoo<any[]>(
          "stock.picking",
          "search_read",
          [[["id", "=", pickingId]]],
          { fields: ["id", "state", "move_line_ids"] }
        );

        if (!pickings || pickings.length === 0) {
          console.warn(`Picking ${pickingId} not found`);
          continue;
        }

        const picking = pickings[0];
        console.log(`Picking state: ${picking.state}`);

        // 3.2 If picking is already done, skip
        if (picking.state === "done") {
          console.log("Picking already processed");
          success = true;
          continue;
        }

        // 3.3 Process the picking through its workflow
        // Confirm the picking if needed
        if (picking.state === "draft") {
          await callOdoo("stock.picking", "action_confirm", [[pickingId]]);
          console.log("Picking confirmed");
        }

        // Assign (reserve) the picking
        await callOdoo("stock.picking", "action_assign", [[pickingId]]);
        console.log("Picking assigned");

        // Get the moves to set quantities
        const moves = await callOdoo<any[]>(
          "stock.move",
          "search_read",
          [[["picking_id", "=", pickingId]]],
          {
            fields: [
              "id",
              "product_id",
              "product_uom_qty",
              "quantity_done",
              "state",
            ],
          }
        );

        // For each move, ensure quantity_done is set
        for (const move of moves) {
          if (move.state !== "done" && move.quantity_done === 0) {
            await callOdoo("stock.move", "write", [
              [move.id],
              { quantity_done: move.product_uom_qty },
            ]);
            console.log(`Set quantity_done for move ${move.id}`);
          }
        }

        // Validate the picking
        try {
          // Try immediate transfer
          await callOdoo("stock.picking", "button_validate", [[pickingId]]);
          console.log("Picking validated successfully");
          success = true;
        } catch (validateError: any) {
          // Add type annotation
          console.warn(
            "Validation error, trying with wizard:",
            validateError.message
          );

          // Try with backorder wizard if needed
          try {
            // Create immediate transfer wizard
            const wizardId = await callOdoo(
              "stock.immediate.transfer",
              "create",
              [
                {
                  pick_ids: [[6, 0, [pickingId]]],
                },
              ]
            );

            // Process the wizard
            await callOdoo("stock.immediate.transfer", "process", [[wizardId]]);
            console.log("Picking processed via immediate transfer wizard");
            success = true;
          } catch (wizardError: any) {
            // Add type annotation
            console.error(
              "Failed to process with wizard:",
              wizardError.message
            );
          }
        }
      } catch (pickingError: any) {
        // Add type annotation
        console.error(
          `Error processing picking ${pickingId}:`,
          pickingError.message
        );
      }
    }

    // 4. Final verification
    if (success) {
      return true;
    } else {
      // Try one more approach - finalizing the order
      try {
        await callOdoo("pos.order", "action_pos_order_done", [[orderId]]);
        console.log("Finalized order");
        return true;
      } catch (finalizeError: any) {
        // Add type annotation
        console.warn("action_pos_order_done failed:", finalizeError.message);
        return false;
      }
    }
  } catch (error: any) {
    console.error("Error in processStockMovements:", error.message);
    return false;
  }
}

/**
 * Process stock movements for a paid order using direct inventory adjustments
 * This is a special implementation for Odoo configurations where standard picking process doesn't work
 */
export async function processStockMovementsDirect(
  orderId: number
): Promise<boolean> {
  try {
    console.log(`Processing direct stock adjustment for order ${orderId}...`);

    // 1. Get the order details and lines
    const orders = await callOdoo<any[]>(
      "pos.order",
      "search_read",
      [[["id", "=", orderId]]],
      { fields: ["id", "name", "state", "lines"] }
    );

    if (!orders || orders.length === 0) {
      console.error("Order not found for stock adjustment");
      return false;
    }

    const order = orders[0];

    // 2. Get the order lines to identify products and quantities
    const lineIds = order.lines || [];

    if (!lineIds || lineIds.length === 0) {
      console.warn("Order doesn't contain any products");
      return false;
    }

    const orderLines = await callOdoo<any[]>(
      "pos.order.line",
      "search_read",
      [[["id", "in", lineIds]]],
      { fields: ["id", "product_id", "qty"] }
    );

    if (!orderLines || orderLines.length === 0) {
      console.warn("No order lines found");
      return false;
    }

    // 3. Find the internal stock location
    const locations = await callOdoo<any[]>(
      "stock.location",
      "search_read",
      [[["usage", "=", "internal"]]],
      { fields: ["id", "name"], limit: 1 }
    );

    if (!locations || locations.length === 0) {
      console.error("No internal location found for stock adjustment");
      return false;
    }

    const locationId = locations[0].id;

    // 4. Process each product in the order
    let successCount = 0;

    for (const line of orderLines) {
      try {
        if (!line.product_id || !line.qty) {
          console.warn(`Skipping invalid line ${line.id}`);
          continue;
        }

        const productId = line.product_id[0];
        const productName = line.product_id[1];
        const qtyToDeduct = line.qty;

        console.log(
          `Processing stock adjustment for ${productName}, qty: -${qtyToDeduct}`
        );

        // Get current quants for this product at this location
        const quants = await callOdoo<any[]>(
          "stock.quant",
          "search_read",
          [
            [
              ["product_id", "=", productId],
              ["location_id", "=", locationId],
            ],
          ],
          { fields: ["id", "quantity"] }
        );

        if (quants && quants.length > 0) {
          // Update existing quant
          const quantId = quants[0].id;
          const currentQty = quants[0].quantity;
          const newQty = Math.max(0, currentQty - qtyToDeduct);

          console.log(`Updating quant ${quantId}: ${currentQty} → ${newQty}`);

          await callOdoo("stock.quant", "write", [
            [quantId],
            { inventory_quantity: newQty },
          ]);

          await callOdoo("stock.quant", "action_apply_inventory", [[quantId]]);
          successCount++;
        } else {
          // Create new quant with negative adjustment
          console.log(
            `No existing quant found, creating new entry with -${qtyToDeduct}`
          );

          const quantId = await callOdoo("stock.quant", "create", [
            {
              product_id: productId,
              location_id: locationId,
              inventory_quantity: -qtyToDeduct,
            },
          ]);

          await callOdoo("stock.quant", "action_apply_inventory", [[quantId]]);
          successCount++;
        }
      } catch (lineError: any) {
        console.error(`Error processing line ${line.id}:`, lineError.message);
      }
    }

    console.log(
      `Processed ${successCount} out of ${orderLines.length} products`
    );
    return successCount === orderLines.length;
  } catch (error: any) {
    console.error("Error processing stock movements:", error.message);
    return false;
  }
}
