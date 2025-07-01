import Odoo from "odoo-await";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Explicitly load the .env file from the project root
const envPath = path.resolve(process.cwd(), ".env");
console.log(`Looking for .env file at: ${envPath}`);

if (fs.existsSync(envPath)) {
  console.log("Loading environment variables from .env file");
  dotenv.config({ path: envPath });
} else {
  console.error("ERROR: .env file not found at", envPath);
  console.error("Please create this file with your Odoo credentials");
  process.exit(1); // Exit the process if the .env file doesn't exist
}

// Verify that required environment variables are set
const requiredEnvVars = [
  "ODOO_URL",
  "ODOO_PORT",
  "ODOO_DB",
  "ODOO_USERNAME",
  "ODOO_PASSWORD",
];
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  console.error(
    "ERROR: Missing required environment variables:",
    missingEnvVars.join(", ")
  );
  console.error("Please ensure these are set in your .env file");
  process.exit(1); // Exit the process if any required variables are missing
}

// Connection details strictly from environment variables
const odooConfig = {
  url: process.env.ODOO_URL!,
  port: parseInt(process.env.ODOO_PORT!),
  db: process.env.ODOO_DB!,
  username: process.env.ODOO_USERNAME!,
  password: process.env.ODOO_PASSWORD!,
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
