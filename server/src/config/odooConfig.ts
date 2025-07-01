import Odoo from "odoo-await";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Connection details from environment variables
const odooConfig = {
  url: process.env.ODOO_URL || "http://localhost:8069",
  port: parseInt(process.env.ODOO_PORT || "8069"),
  db: process.env.ODOO_DB || "queens_dev", // Set the correct database name
  username: process.env.ODOO_USERNAME || "admin",
  password: process.env.ODOO_PASSWORD || "admin",
};

console.log("Odoo connection configuration:", {
  url: odooConfig.url,
  port: odooConfig.port,
  db: odooConfig.db,
  username: odooConfig.username,
  // Password not logged for security
});

// Create the Odoo client instance
export const odooClient = new Odoo(odooConfig);

// Export a function to test the connection
export const testOdooConnection = async (): Promise<boolean> => {
  try {
    console.log("Attempting to connect to Odoo server...");
    await odooClient.connect();
    console.log("Successfully connected to Odoo server");
    console.log(
      `Connected to ${odooConfig.url}:${odooConfig.port} - Database: ${odooConfig.db}`
    );
    return true;
  } catch (error: any) {
    console.error("Failed to connect to Odoo server:", error);
    console.error(
      "Please check your Odoo connection details and ensure the Odoo server is running."
    );
    return false;
  }
};
