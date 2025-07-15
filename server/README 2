# **Queens E-commerce Server Documentation**

## **Overview**

This server acts as a middleware between the Next.js frontend application and the Odoo ERP system. It provides authentication services and product management endpoints that interact with Odoo through its XML-RPC API.

**Project Structure**

```jsx
server/
├── src/
│   ├── auth/                   # Authentication services
│   │   ├── authController.ts   # Handles auth HTTP requests
│   │   ├── config.ts           # Auth-specific configuration
│   │   └── odooService.ts      # Odoo authentication implementation
│   ├── config/
│   │   └── odooConfig.ts       # Odoo connection configuration
│   ├── controllers/
│   │   └── productController.ts # Product-related endpoints
│   ├── lib/
│   │   └── odooClient.ts       # Generic Odoo client utilities
│   ├── middleware/
│   │   └── authMiddleware.ts   # JWT authentication middleware
│   ├── services/
│   │   └── odooService.ts      # Product-related Odoo services
│   ├── types/
│   │   ├── product.types.ts    # Product type definitions
│   │   └── odoo-await.d.ts     # TypeScript definitions for Odoo
│   ├── utils/
│   │   └── responseFormatter.ts # Response formatting utilities
│   ├── config.ts               # Main server configuration
│   └── server.ts               # Express server entry point
├── .env                        # Environment variables (not in repo)
├── package.json                # Node.js dependencies
└── tsconfig.json               # TypeScript configuration
```

## **Setup**

### **Prerequisites**

- Node.js 18.x or later
- Docker and Docker Compose (for Odoo)
- PostgreSQL (provided via Docker)

### **Environment Variables**

Create a .env file in the server directory with this variables + passwordprovided by Simobe:

```jsx
# Odoo Connection
ODOO_URL=http://localhost:8069
ODOO_PORT=8069
ODOO_DB=queens_dev
ODOO_ADMIN_USER=admin
ODOO_ADMIN_PASSWORD=provided_by_Simone

# JWT Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=24h

# Odoo Group IDs
ODOO_PORTAL_GROUP_ID=9

# Original Postgres settings (keep for reference)
POSTGRES_DB=postgres
POSTGRES_USER=odoo
POSTGRES_PASSWORD=odoo
```

### **Installation**

1. Install dependencies:

```jsx
cd server
npm install
```

2. Start the development server:

```jsx
npm run server
```

## **Docker Setup for Odoo**

The project uses Docker Compose to set up Odoo and PostgreSQL. The configuration is in the docker-compose.yml file at the project root.

**Starting Odoo**

```jsx
docker-compose up
```

This will start:

- PostgreSQL database on port 5432
- Odoo 16 on port 8069

### **Accessing Odoo**

- URL: http://localhost:8069
- Default admin credentials: admin/admin (change these in production)

### **Data Persistence**

Docker volumes are configured to persist data:

- odoo-db-data: PostgreSQL data
- odoo-web-data: Odoo application data

### **Custom Modules**

Custom Odoo modules can be placed in the odoo-addons directory at the project root.

## **Authentication System**

The authentication system connects to Odoo's built-in user management and implements:

1. User registration
2. User login
3. Password reset

### **Authentication Flow**

1. The client sends credentials to the server
2. The server verifies credentials with Odoo via XML-RPC
3. If valid, the server issues a JWT token
4. The client stores this token and includes it in subsequent requests

### **Key Files**

- odooService.ts: Contains the OdooAuthService class with methods for:
  - authenticateAdmin(): Gets an admin session for operations requiring elevated permissions
  - authenticateUser(email, password): Validates user credentials
  - createUser(name, email, password): Creates a new user in Odoo's portal group
  - userExists(email): Checks if a user already exists
  - triggerOdooPasswordReset(email): Initiates Odoo's native password reset flow
- authMiddleware.ts: Contains JWT validation middleware:
  - requireAuth: Ensures the user is authenticated
  - checkAuth: Optional middleware that populates user info if authenticated
  - requireAdmin: Restricts routes to admin users

## **Product Management**

The product system provides an API layer over Odoo's product catalog.

### **Features**

- Retrieve all products with filtering, sorting, and pagination
- Fetch product details by ID
- Query products by category, price range, availability, etc.

### **Key Files**

- odooService.ts: Contains the OdooService class with methods for:
  - fetchAllProducts(options): Gets products with filtering options
  - fetchProductById(id): Gets a single product by ID
- productController.ts: HTTP endpoints for product operations

### **Data Transformation**

The service transforms Odoo's product data structure into a format more suitable for the frontend:

```jsx
// Example transformation
return result.map((item: any) => ({
  id: item.id,
  name: item.name,
  description: item.description || "",
  price: item.list_price,
  image_url: item.image_1920
    ? `data:image/png;base64,${item.image_1920}`
    : "/images/placeholder.jpg",
  category_id: item.categ_id[0],
  category_name: item.categ_id[1],
  isAvailable: item.qty_available > 0,
  qty_available: item.qty_available,
  create_date: item.create_date,
}));
```

## **Odoo Integration**

### **JSON-RPC API**

The server uses Odoo's JSON-RPC API for most operations, implemented in:

- odooClient.ts: Low-level client for generic Odoo operations
- odooService.ts: Product-specific operations
- odooService.ts: Authentication-specific operations

### **Key Methods**

- authenticate(): Gets a valid Odoo UID for the session
- executeKw(model, method, args, kwargs): Core method to execute operations on Odoo models

## **Future Improvements**

### **Product Management**

- Implement product creation, updating, and deletion
- Add support for product variants (sizes, colors)
- Implement inventory management

### **Order Management**

- Create endpoints for shopping cart operations
- Implement order creation and tracking
- Add payment processing integration

### **User Management**

- Implement user profile management
- Discuss which service will be used to send email to restore password

## **Production Migration**

When moving from the development environment to production with Odoo Enterprise:

1. Update all Odoo connection details in the `.env` file
2. Update CORS settings to match the production frontend domain
