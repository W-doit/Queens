// POS business logic

// POS business logic

import { callOdoo } from "../utils/odooClient";

/**
 * Get the currently active POS session
 */
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
