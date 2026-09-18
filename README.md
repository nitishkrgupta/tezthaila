# TEZ THAILA — Indian E-Commerce Shopping Platform

**Tez Thaila** (Express Shopping Bag) is a modern, full-stack Indian e-commerce web platform engineered with React, Vite, Tailwind CSS, Node.js, Express, Prisma ORM, and MySQL.

---

## 🏗️ Architecture Overview

```
tezthaila/
├── client/                     # Frontend Application (React + Vite + Tailwind CSS)
│   ├── public/                 # Static assets & SVG logo
│   ├── src/
│   │   ├── components/         # Reusable atomic UI components
│   │   ├── context/            # Context API providers (Auth, Cart, Wishlist, Toast)
│   │   ├── hooks/              # Custom hooks
│   │   ├── layouts/            # MainLayout, AdminLayout
│   │   ├── pages/              # Customer & Admin pages
│   │   ├── routes/             # AppRoutes, ProtectedRoute, AdminRoute
│   │   ├── services/           # Axios HTTP client instance & API endpoints
│   │   ├── utils/              # Currency formatting, helpers
│   │   ├── App.jsx             # Diagnostic & core app entry
│   │   ├── index.css           # Tailwind base, utilities & custom styles
│   │   └── main.jsx            # React root mount
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js      # Emerald/Tez-Green brand theme
│   └── vite.config.js          # Vite config with /api proxy to backend
│
├── server/                     # Backend API Application (Node + Express + Prisma)
│   ├── config/
│   │   └── db.js               # Prisma Client singleton
│   ├── controllers/
│   │   └── healthController.js # Server & MySQL connection health check
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication & requireAdmin middleware (Phase 2)
│   │   └── errorHandler.js     # Centralized Express error handler (400, 401, 403, 404, 409, 422, 500)
│   ├── prisma/
│   │   ├── schema.prisma       # 17 Normalized Relational Models
│   │   └── seed.js             # Database seeding script
│   ├── routes/
│   │   └── healthRoutes.js     # Health check route (/api/health)
│   ├── services/               # Core business services
│   ├── utils/
│   │   ├── apiError.js         # Custom ApiError class
│   │   └── apiResponse.js      # Standard JSON response helpers
│   ├── validators/             # Request payload validators
│   ├── server.js               # Express application initialization & middleware
│   ├── package.json
│   ├── .env                    # Local environment variables
│   └── .env.example
│
├── .gitignore
├── package.json                # Monorepo/Root task runner
└── README.md
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Axios, React Router DOM, React Hook Form
- **Backend**: Node.js (v24+), Express.js, Prisma ORM
- **Database**: MySQL 8.0 (Normalized schema, foreign keys, indexes, transactions)
- **Security**: Helmet, CORS origin restriction, Rate limiting, Centralized Error Handling

---

## 🗄️ Database Models (Prisma)

The application utilizes 17 normalized models in MySQL:
1. `User` (Customer & Admin RBAC)
2. `Address` (Indian delivery address structure)
3. `Category` (Categorization with slugs & images)
4. `Brand` (Product brands with logos & descriptions)
5. `Product` (Pricing, discounts, inventory, SKUs, indexed slugs)
6. `ProductImage` (Multiple images per product)
7. `ProductVariant` (Sizes, Weights, Colors, Pack variants)
8. `Cart` (Persistent customer cart)
9. `CartItem` (Unique cart items with compound constraint)
10. `Wishlist` (Unique customer wishlist items)
11. `Order` (Snapshot order data with status timeline)
12. `OrderItem` (Historical price and product snapshot)
13. `Payment` (Razorpay and COD payment records)
14. `Review` (Verified purchase reviews and ratings)
15. `Coupon` (Percentage & Flat discounts with limits)
16. `Notification` (Order and system notifications)
17. `ReturnRequest` (Post-delivery return and refund flow)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher recommended; verified with v24.19.0)
- npm (v9 or higher; verified with v11.17.0)
- MySQL Server 8.0 running locally on port 3306

### 2. Environment Setup

Configure `server/.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="mysql://root:root@localhost:3306/tez_thaila"
JWT_SECRET="tez_thaila_jwt_super_secret_key_2026_indian_ecommerce_platform"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"
RAZORPAY_KEY_ID="rzp_test_tezthaila2026"
RAZORPAY_KEY_SECRET="rzp_test_secret_tezthaila2026"
CLOUDINARY_CLOUD_NAME="tezthaila"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="tezthaila_cloudinary_secret_key"
```

Configure `client/.env`:
```env
VITE_API_URL="/api"
```

### 3. Database Migration & Seeding
From the `server` directory:
```bash
# Generate Prisma Client
npx prisma generate

# Apply Schema Migrations
npx prisma migrate dev --name init_tez_thaila_schema

# Seed Database
node prisma/seed.js
```

### 4. Running the Applications

**Run Backend:**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Run Frontend:**
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

---

## 🔑 Demo Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@tezthaila.com` | `Admin@123` |
| **Customer** | `customer@tezthaila.com` | `Customer@123` |

---

## 🩺 Health Check Endpoint

- `GET http://localhost:5000/api/health`
- Verifies live MySQL connection via Prisma query, returns database version, memory usage, uptime, and latency.
