# Pawn-to-Pawn

> A full-stack TypeScript monorepo application for managing pawn shop operations with role-based access control

![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![React](https://img.shields.io/badge/React-19.0-61dafb)
![Express](https://img.shields.io/badge/Express-4.21-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Authentication Flow](#authentication-flow)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)

## Overview

Pawn-to-Pawn is a comprehensive management system designed for pawn shop operations. It provides a complete workflow for managing users, orders, products, materials, and machines with three distinct role levels: clients, operators, and administrators.

### Key Features

- **Role-Based Access Control**: Three-tier user system (Client, Operator, Admin)
- **Order Management**: Complete order lifecycle from creation to completion
- **Product Catalog**: Comprehensive product management system
- **Inventory Control**: Materials and machines tracking
- **JWT Authentication**: Secure authentication with automatic token refresh
- **Real-time Updates**: React Query for optimistic updates and caching

## Architecture

### System Architecture

```mermaid
graph TB
    subgraph "Frontend - React"
        A[User Interface] --> B[React Router]
        B --> C[User Context]
        B --> D[React Query]
        D --> E[API Client]
    end

    subgraph "Backend - Express"
        F[Express Server] --> G[CORS & Middleware]
        G --> H[Routes]
        H --> I[Auth Middleware]
        I --> J[Controllers]
        J --> K[Models]
        K --> L[Database Pool]
    end

    subgraph "Database"
        M[(PostgreSQL/Supabase)]
    end

    subgraph "Shared Types"
        N[TypeScript Types]
    end

    E -->|HTTP + Cookies| F
    L --> M
    A -.->|imports| N
    J -.->|imports| N
```

### Request Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant R as React App
    participant A as Axios
    participant E as Express
    participant M as Middleware
    participant Ctrl as Controller
    participant Mod as Model
    participant DB as PostgreSQL

    C->>R: User Action
    R->>A: API Call
    A->>E: HTTP Request + Cookies
    E->>M: CORS, JSON, Cookies
    M->>M: Auth Middleware
    M->>M: Role Check
    M->>Ctrl: Request + Session
    Ctrl->>Ctrl: Validation (Zod)
    Ctrl->>Mod: Business Logic
    Mod->>DB: SQL Query
    DB-->>Mod: Result
    Mod-->>Ctrl: Data
    Ctrl-->>E: Response
    E-->>A: JSON + Cookies
    A-->>R: Data
    R-->>C: UI Update
```

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as Database

    U->>F: Login (email, password)
    F->>B: POST /users/login
    B->>B: Validate with Zod
    B->>DB: Query user by email
    DB-->>B: User data
    B->>B: Compare password (bcrypt)
    B->>B: Generate Access Token (60min)
    B->>B: Generate Refresh Token (7 days)
    B->>DB: Store refresh token
    B-->>F: Set HTTP-only cookies
    B-->>F: User data (no password)
    F->>F: Store in Context + localStorage
    F-->>U: Redirect to dashboard

    Note over U,DB: Protected Request Flow

    U->>F: Access protected page
    F->>B: GET /protected (with cookies)
    B->>B: Verify Access Token

    alt Access token valid
        B-->>F: Protected data
    else Access token expired
        B->>B: Check refresh token
        B->>DB: Validate refresh token
        DB-->>B: Token valid
        B->>B: Generate new access token
        B-->>F: New cookie + data
    else Both tokens invalid
        B-->>F: 401 Unauthorized
        F->>F: Clear user context
        F-->>U: Redirect to login
    end
```

### Role-Based Access Control

```mermaid
flowchart TB
    subgraph Public["Public Routes"]
        A["POST /register"]
        B["POST /login"]
    end

    subgraph Client["Client Routes (authenticated)"]
        C["POST /orders (create)"]
        D["GET /orders (own orders)"]
        E["GET /users/me"]
    end

    subgraph Operator["Operator Routes (operator + admin)"]
        F["GET /orders/pending"]
        G["GET /orders/preparation"]
        H["GET /products"]
        I["PATCH /orders/:id/assign"]
        J["PATCH /orders/:id/complete"]
    end

    subgraph Admin["Admin Routes (admin only)"]
        K["GET /users (all users)"]
        L["GET /users/clients"]
        M["POST /products"]
        N["POST /materials"]
        O["POST /machines"]
        P["PATCH /users/:id (promote)"]
    end

    U1[Client User] --> Public
    U1 --> Client

    U2[Operator User] --> Public
    U2 --> Client
    U2 --> Operator

    U3[Admin User] --> Public
    U3 --> Client
    U3 --> Operator
    U3 --> Admin
```

## Tech Stack

### Frontend
- **React 19.0.0** - UI library
- **React Router 7.6.2** - Client-side routing
- **Vite 6.3.5** - Build tool with SWC
- **TanStack Query 5.67.1** - Server state management
- **styled-components 6.1.18** - CSS-in-JS styling
- **Radix UI Colors 3.0.0** - Design system
- **axios 1.9.0** - HTTP client
- **TypeScript 5.7.2** - Type safety

### Backend
- **Express.js 4.21.2** - Web framework
- **PostgreSQL** - Database (via Supabase)
- **pg 8.11.3** - PostgreSQL driver
- **jsonwebtoken 9.0.2** - JWT authentication
- **bcrypt 5.1.1** - Password hashing
- **Zod 3.24.2** - Schema validation
- **cookie-parser 1.4.7** - Cookie handling
- **TypeScript 5.8.2** - Type safety

### Shared
- **TypeScript Types Package** - Shared types between frontend and backend
- **NPM Workspaces** - Monorepo management

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Supabase recommended)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/jrx-jms/pawn-to-pawn.git
cd pawn-to-pawn
```

2. **Set up the backend**
```bash
cd express
npm install
```

Create `.env` file:
```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# JWT
SECRET_JWT_KEY=your-super-secret-jwt-key-here

# CORS
FRONTEND_URL=http://localhost:5173

# Server
PORT=3000
NODE_ENV=development

# Admin Initialization
ADMIN_ID_NUMBER=12345678
ADMIN_NAME=Administrator
ADMIN_EMAIL=admin@pawnshop.com
ADMIN_DEFAULT_PASSWORD=change-this-password
```

3. **Set up the frontend**
```bash
cd ../react
npm install
```

4. **Start development servers**

Terminal 1 (Backend):
```bash
cd express
npm run dev
```

Terminal 2 (Frontend):
```bash
cd react
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### First Login

The system automatically creates an admin user on first startup using the credentials from your `.env` file:

- **Email**: Value from `ADMIN_EMAIL`
- **Password**: Value from `ADMIN_DEFAULT_PASSWORD`

**Important**: Change the admin password immediately after first login!

## Project Structure

```
/
├── express/                 # Backend API
│   ├── src/
│   │   ├── index.ts        # Express app entry point
│   │   ├── controllers/    # Business logic layer
│   │   │   ├── users.controller.ts
│   │   │   ├── orders.controller.ts
│   │   │   ├── products.controller.ts
│   │   │   ├── materials.controller.ts
│   │   │   └── machines.controller.ts
│   │   ├── models/         # Database access layer
│   │   │   ├── user.model.ts
│   │   │   ├── order.model.ts
│   │   │   ├── product.model.ts
│   │   │   ├── material.model.ts
│   │   │   └── machine.model.ts
│   │   ├── routes/         # Express routes
│   │   │   ├── users.route.ts
│   │   │   ├── orders.route.ts
│   │   │   ├── products.route.ts
│   │   │   ├── materials.route.ts
│   │   │   └── machines.route.ts
│   │   ├── middlewares/    # Auth and validation
│   │   │   └── auth.middleware.ts
│   │   ├── schema/         # Zod validation schemas
│   │   ├── database/       # DB connection utilities
│   │   │   ├── connect.ts
│   │   │   └── AdminManager.ts
│   │   ├── errors/         # Custom error classes
│   │   └── types/          # Backend-specific types
│   ├── build/              # Compiled output
│   └── package.json
├── react/                  # Frontend application
│   ├── src/
│   │   ├── main.tsx       # App entry with providers
│   │   ├── App.tsx        # Role-based routing
│   │   ├── api/           # Axios API clients
│   │   │   ├── users.api.ts
│   │   │   ├── orders.api.ts
│   │   │   ├── products.api.ts
│   │   │   ├── materials.api.ts
│   │   │   └── machines.api.ts
│   │   ├── contexts/      # React Context providers
│   │   │   ├── UserContext.tsx
│   │   │   └── UserContextProvider.tsx
│   │   ├── pages/         # Page components
│   │   │   ├── client/
│   │   │   ├── professional/
│   │   │   └── admin/
│   │   ├── components/    # Reusable components
│   │   ├── config.ts      # API configuration
│   │   └── errors/        # Error utilities
│   └── package.json
├── shared/                 # Shared TypeScript types
│   └── types/
│       ├── users.types.ts
│       ├── orders.types.ts
│       ├── products.types.ts
│       ├── materials.types.ts
│       ├── machines.types.ts
│       └── index.ts
├── docs/                   # Documentation
│   └── ai-context/        # AI context files
├── CLAUDE.md              # Detailed development guide
└── package.json           # Workspace root
```

## Database Schema

```mermaid
erDiagram
    USERS ||--o{ ORDERS : creates
    USERS ||--o{ ORDERS : processes
    USERS ||--o{ REFRESH_TOKENS : has
    ORDERS ||--o{ PRODUCTS : contains
    PRODUCTS ||--o{ MATERIALS : requires
    PRODUCTS ||--o{ MACHINES : uses

    USERS {
        uuid id PK
        string id_number
        string name
        string phone
        string email
        string password
        enum role
    }

    ORDERS {
        uuid id PK
        uuid client_id FK
        uuid operator_id FK
        enum status
        jsonb products
        timestamp created_at
        timestamp updated_at
    }

    PRODUCTS {
        uuid id PK
        string name
        string description
        decimal price
        jsonb materials
        jsonb machines
    }

    MATERIALS {
        uuid id PK
        string name
        string description
        int stock
    }

    MACHINES {
        uuid id PK
        string name
        string description
        enum status
    }

    REFRESH_TOKENS {
        string token PK
        uuid id_user FK
        string user_agent
        timestamp created_at
        timestamp expires_at
        boolean revoked
    }
```

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "id_number": "12345678",
  "phone": "1234567890"
}
```

#### Login
```http
POST /users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

Response sets HTTP-only cookies:
- `access_token` (60 min)
- `refresh_token` (7 days)

#### Logout
```http
POST /users/logout
Cookie: access_token=...; refresh_token=...
```

### Protected Endpoints

All endpoints below require authentication cookies.

#### Users
```http
GET    /users              # Admin only - Get all users
GET    /users/me           # Get current user
GET    /users/clients      # Operator+ - Get all clients
PATCH  /users/:id          # Admin only - Promote to operator
DELETE /users/:id          # Admin only - Delete user
```

#### Orders
```http
GET    /orders                    # Client: own orders, Operator+: all
GET    /orders/pending            # Operator+ - Get pending orders
GET    /orders/preparation        # Operator+ - Get in-preparation orders
POST   /orders                    # Client - Create order
PATCH  /orders/:id/assign         # Operator+ - Assign to self
PATCH  /orders/:id/complete       # Operator+ - Mark complete
PATCH  /orders/:id/set-pending    # Client - Set to pending
```

#### Products
```http
GET    /products          # Operator+ - Get all products
GET    /products/:id      # Operator+ - Get product by ID
POST   /products          # Admin - Create product
PATCH  /products/:id      # Admin - Update product
DELETE /products/:id      # Admin - Delete product
```

#### Materials
```http
GET    /materials         # Admin - Get all materials
GET    /materials/:id     # Admin - Get material by ID
POST   /materials         # Admin - Create material
PATCH  /materials/:id     # Admin - Update material
DELETE /materials/:id     # Admin - Delete material
```

#### Machines
```http
GET    /machines          # Admin - Get all machines
GET    /machines/:id      # Admin - Get machine by ID
POST   /machines          # Admin - Create machine
PATCH  /machines/:id      # Admin - Update machine
DELETE /machines/:id      # Admin - Delete machine
```

## Development

### Backend Development

```bash
cd express

# Development with hot reload
npm run dev

# Compile TypeScript
npm run tsc

# Run compiled code
npm start

# Build for production
npm run build
```

### Frontend Development

```bash
cd react

# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Working with Shared Types

After modifying types in `shared/types/`:

1. Types are automatically available in development (linked)
2. Production builds automatically install the shared package
3. If you encounter issues:
```bash
cd express  # or cd react
npm install
```

### Code Quality

**Backend (Express):**
- Strict TypeScript mode enabled
- No unused locals or parameters
- No implicit returns
- No fallthrough cases in switches

**Frontend (React):**
- ESLint configured
- TypeScript strict mode
- Component-based architecture

## Deployment

### Backend (Vercel)

Currently deployed to: https://pawn-to-pawn-express.vercel.app

**Required Environment Variables:**
```env
DATABASE_URL=your_supabase_connection_string
SECRET_JWT_KEY=your_jwt_secret
FRONTEND_URL=https://your-frontend-url.com
ADMIN_ID_NUMBER=12345678
ADMIN_NAME=Administrator
ADMIN_EMAIL=admin@pawnshop.com
ADMIN_DEFAULT_PASSWORD=secure_password
```

**Build Settings:**
- Build Command: `npm run tsc`
- Output Directory: `build/`
- Install Command: `npm install`

### Frontend (Vercel/Netlify)

**Environment Variables:**
```env
VITE_API_URL=https://pawn-to-pawn-express.vercel.app
```

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `dist/`
- Install Command: `npm install`

## Order Workflow

```mermaid
stateDiagram-v2
    [*] --> Pending: Client creates order
    Pending --> Preparation: Operator assigns to self
    Preparation --> Completed: Operator marks complete
    Completed --> [*]

    Preparation --> Pending: Client sets to pending

    note right of Pending
        Visible to all operators
        Can be assigned by any operator
    end note

    note right of Preparation
        Assigned to specific operator
        Client can revert to pending
    end note

    note right of Completed
        Order finished
        Visible in history
    end note
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing MVC pattern
- Use Zod for all input validation
- Never return passwords in API responses
- Use React Query for all data fetching
- Follow TypeScript strict mode rules
- Write descriptive commit messages

## Troubleshooting

### CORS Errors
- Verify `FRONTEND_URL` matches exactly (no trailing slash)
- Check `withCredentials: true` in axios config
- Ensure `credentials: true` in CORS config

### Cookie Issues
- Use `sameSite: 'none'` with `secure: true` for production
- Development: use `sameSite: 'lax'`
- Verify cookies are `httpOnly`

### Module Not Found: @pawn-to-pawn/shared
```bash
cd express  # or cd react
npm install
```

### TypeScript Errors After Type Changes
1. Restart TypeScript server
2. Reinstall dependencies
3. Clear build cache: `rm -rf build/` or `rm -rf dist/`

## License

ISC

## Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/jrx-jms/pawn-to-pawn/issues) page.

---

**Built with ❤️ using TypeScript, React, and Express**
