import express from "express";
import cors from "cors";
import routes from "./routes";
import dotenv from "dotenv";
import posRouter from "./routes/pos";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" })); // Increased limit for image uploads
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Mount POS router directly
app.use("/api/pos", posRouter);

// API routes
app.use("/api", routes);

// Global error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Global error:", err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      error: err.message || "An unexpected error occurred",
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(
    `🔗 Odoo connection: ${process.env.ODOO_URL || "Not configured"}`
  );
});

export default app;
