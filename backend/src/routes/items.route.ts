import express, { Request, Response } from "express";
import { callOdoo } from "../utils/odooClient";

const router = express.Router();

// POST /api/items
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, list_price, type } = req.body;

    console.log("Creating product with:", { name, list_price, type });

    const id = await callOdoo("product.template", "create", [
      {
        name,
        list_price,
        type: type || "product",
        sale_ok: true,
        purchase_ok: true,
        // categ_id: 1, // optional
      },
    ]);

    console.log("Created product ID:", id); // Should be a number

    if (!id) {
      throw new Error("Odoo did not return a product ID.");
    }

    res.status(201).json({ message: "Item created", id });
  } catch (error: any) {
    console.error("Error creating item:", error);
    res.status(500).json({
      error: "Failed to create item",
      details:
        error?.response?.data?.error?.message ||
        error.message ||
        "Unknown error",
    });
  }
});

// GET /api/items
router.get("/", async (_req: Request, res: Response) => {
  try {
    const items = await callOdoo("product.template", "search_read", [[]], {
      fields: ["id", "name", "list_price", "type"],
      limit: 10,
    });

    console.log("Fetched items from Odoo:", items);
    res.json(items);
  } catch (error: any) {
    console.error("Error fetching items:", error);
    res.status(500).json({
      error: "Failed to fetch items",
      details:
        error?.response?.data?.error?.message ||
        error.message ||
        "Unknown error",
    });
  }
});

// NEW: GET /api/categories → get product categories
router.get("/categories", async (_req: Request, res: Response) => {
  try {
    const categories = await callOdoo("product.category", "search_read", [], {
      fields: ["id", "name"],
      limit: 10,
    });

    res.json(categories);
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      error: "Failed to fetch categories",
      details:
        error?.response?.data?.error?.message ||
        error.message ||
        "Unknown error",
    });
  }
});

export default router;
