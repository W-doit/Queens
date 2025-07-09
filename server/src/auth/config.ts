import path from "path";
import fs from "fs";
import dotenv from "dotenv";

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

// Verify that required environment variables for auth are set
const requiredAuthEnvVars = [
  "ODOO_URL",
  "ODOO_DB",
  "ODOO_ADMIN_USER",
  "ODOO_ADMIN_PASSWORD",
  "JWT_SECRET",
];

const missingVars = requiredAuthEnvVars.filter(
  (varName) => !process.env[varName]
);
if (missingVars.length > 0) {
  console.error("ERROR: Missing required environment variables:");
  missingVars.forEach((varName) => console.error(`- ${varName}`));
  process.exit(1);
}

export const odooConfig = {
  url: process.env.ODOO_URL,
  db: process.env.ODOO_DB,
  adminUser: process.env.ODOO_ADMIN_USER,
  adminPassword: process.env.ODOO_ADMIN_PASSWORD,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiration: process.env.JWT_EXPIRATION || "24h",
  portalGroupId: parseInt(process.env.ODOO_PORTAL_GROUP_ID || "9", 10),
};
