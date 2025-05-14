import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import productRouter from "./routes/productos.route"; // Correct import name

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware for logging all requests
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`📥 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  const originalSend = res.send;
  res.send = function (body) {
    console.log(`📤 Response ${res.statusCode} - ${new Date().toISOString()}`);
    return originalSend.call(this, body);
  };
  next();
});

// Enable CORS
app.use(cors());

// Middleware to parse JSON requests with larger size limit
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Register your Odoo item routes
app.use("/api/items", productRouter);

// Add a test route to verify Express is working
app.get("/test", (req: Request, res: Response) => {
  console.log("Test route hit!");
  res.json({ message: "API is working" });
});

// Default route
app.get("/", (req: Request, res: Response) => {
  res.send("Odoo API is running");
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Server error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
