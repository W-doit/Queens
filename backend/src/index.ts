import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import itemsRouter from "./routes/items.route";

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS - more permissive for development
app.use(cors()); // This allows all origins during development

// Middleware to parse JSON requests
app.use(express.json());

// Register your Odoo item routes
app.use("/api/items", itemsRouter)


// Default route
app.get("/", (req: Request, res: Response) => {
  res.send("Odoo API is running");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
