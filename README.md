# sancart Backend (Server)

A robust Node.js/Express REST API serving the sancart E-commerce application. It handles user authentication, product catalogs, shopping carts, order creation, and payment processing.

---

## Folder Structure & Meaning

A quick guide to the directory layout for new developers:

```
server/
├── config/                 # Configurations
│   ├── db.js               # Database connection
│   └── cloudinary.js       # Cloudinary and Multer storage config
├── controllers/            # Controller layers containing business logic
│   ├── AuthController.js   # User registration & login handling
│   ├── ProductController.js# Catalog query and review management
│   ├── CartController.js   # User-specific shopping cart logic
│   ├── OrderController.js  # Order creation, updates, and records
│   ├── PaymentController.js# Stripe payment intent generation
│   └── MessageController.js# Contact form emailing
├── dtos/                   # Data Transfer Object layer
│   ├── authdto/            # Request and Response DTOs for Auth
│   ├── productdto/         # Request and Response DTOs for Catalog
│   ├── cartdto/            # Request and Response DTOs for Shopping Carts
│   ├── orderdto/           # Request and Response DTOs for Orders
│   ├── messagedto/         # Message request DTOs
│   └── paymentdto/         # Payment intent request/response DTOs
├── middleware/             # Request processing middleware
│   ├── AuthMiddleware.js   # JWT token decryption and user verification
│   ├── uploadMiddleware.js # File upload interceptor (multer)
│   ├── validate.js         # Schema validation middleware
│   └── errorHandler.js     # Centralized server crash / exception catcher
├── models/                 # Schemas (Database documents)
│   ├── UserModel.js
│   ├── ProductModel.js
│   ├── CartModel.js
│   ├── OrderModel.js
│   └── reviewModel.js
├── routes/                 # Router routes binding URLs to controller functions
│   ├── AuthRoute.js
│   ├── ProductsRoute.js
│   └── OrderRoute.js
├── validators/             # Request schemas
│   ├── authValidator.js
│   ├── productValidator.js
│   ├── cartValidator.js
│   ├── orderValidator.js
│   ├── messageValidator.js
│   └── paymentValidator.js
├── index.js                # Server entry point
└── package.json            # Server dependencies
```

---


### 1. Schema Validation Layer
* Validates and sanitizes incoming payloads at the route layer.
* The validation middleware verifies parameters against schemas. On failure, it stops the request and returns a detailed response.

### 2. Output Formatting Layer (DTOs)
* Formats and structures data for consistent client-server communication.
* Standardizes outgoing properties to match the frontend expectations.

### 3. Global Exception Management
* Uncaught execution errors are caught by centralized middleware instead of crashing the server.
* The handler logs details locally and sends consistent error responses.

---

## Getting Started

### 1. Environment Variables Configuration
Configure a `.env` file in the root of the server directory containing all necessary credentials (API keys, ports, secrets, database URIs).

### 2. Installation
Install project dependencies:
```bash
npm install
```

### 3. Run Server
Start the Express server:
```bash
npm start
```
