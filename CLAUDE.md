# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pawn-to-Pawn is a full-stack TypeScript monorepo application designed for managing pawn shop operations. The system handles user management, order processing, product catalog, materials, and machine inventory with role-based access control.

### Tech Stack

**Backend:**
- Express.js 4.21.2
- TypeScript 5.8.2
- PostgreSQL (via Supabase)
- Node.js pg driver 8.11.3
- JWT authentication (jsonwebtoken 9.0.2)
- bcrypt 5.1.1 for password hashing
- Zod 3.24.2 for validation
- cookie-parser 1.4.7
- CORS 2.8.5

**Frontend:**
- React 19.0.0
- React Router 7.6.2
- Vite 6.3.5 (with SWC plugin)
- TypeScript 5.7.2
- styled-components 6.1.18
- TanStack Query 5.67.1 (React Query)
- Radix UI colors 3.0.0
- axios 1.9.0

**Shared:**
- TypeScript types package (`@pawn-to-pawn/shared`)
- Shared via npm workspaces using `file:../shared`

## Repository Structure

```
/
├── express/              # Backend API
│   ├── src/
│   │   ├── index.ts     # Main entry point, Express app setup
│   │   ├── controllers/ # Business logic layer
│   │   ├── models/      # Database access layer
│   │   ├── routes/      # Express route definitions
│   │   ├── middlewares/ # Auth and other middleware
│   │   ├── schema/      # Zod validation schemas
│   │   ├── database/    # Database connection utilities
│   │   ├── errors/      # Custom error classes
│   │   └── types/       # Backend-specific types
│   ├── build/           # Compiled JavaScript output
│   └── package.json
├── react/               # Frontend application
│   ├── src/
│   │   ├── main.tsx    # Entry point with providers
│   │   ├── App.tsx     # Main app with role-based routing
│   │   ├── api/        # Axios API client functions
│   │   ├── contexts/   # React Context providers
│   │   ├── pages/      # Page components (organized by role)
│   │   ├── components/ # Reusable UI components
│   │   ├── config.ts   # API configuration
│   │   └── errors/     # Error handling utilities
│   └── package.json
├── shared/              # Shared TypeScript types
│   └── types/
│       ├── users.types.ts
│       ├── orders.types.ts
│       ├── products.types.ts
│       ├── materials.types.ts
│       ├── machines.types.ts
│       └── index.ts    # Re-exports all types
└── package.json         # Workspace root
```

## Development Commands

### Backend Development

```bash
# Navigate to backend
cd express

# Development with hot reload (ts-node-dev)
npm run dev

# Compile TypeScript to build/ directory
npm run tsc

# Run compiled JavaScript from build/
npm start
```

**Backend runs on:** Port specified in `.env` (default: 3000)

### Frontend Development

```bash
# Navigate to frontend
cd react

# Start Vite development server with hot reload
npm run dev

# Build for production (also installs shared package)
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

**Frontend dev server runs on:** http://localhost:5173 (Vite default)

### Shared Package Workflow

The `shared/` package contains TypeScript types used by both frontend and backend.

**After modifying types in `shared/`:**
1. No rebuild is needed for development (types are linked)
2. For production builds, the build script automatically installs the shared package
3. If you encounter type resolution issues, try reinstalling dependencies in the consuming package:
   ```bash
   cd express  # or cd react
   npm install
   ```

## Architecture Deep Dive

### Backend Architecture (Express)

#### Pattern: MVC (Model-View-Controller)

**Request Flow:**
```
HTTP Request
  → Express Middleware (CORS, JSON parser, cookies)
  → Route Handler
  → Auth Middleware (auth → authClient/authOperator/authAdmin)
  → Controller (business logic, validation)
  → Model (database queries)
  → Database (PostgreSQL via Supabase)
  ← Response
```

#### Core Components

**1. Database Layer (`express/src/database/`)**

The backend uses PostgreSQL via Supabase with connection pooling:

```typescript
// express/src/database/connect.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }  // Required for Supabase
});

export { pool as DB };
```

**All models import and use this `DB` pool instance.**

**2. Models (`express/src/models/`)**

Models encapsulate all database operations:

- `user.model.ts` - User CRUD operations
- `order.model.ts` - Order management
- `product.model.ts` - Product catalog
- `material.model.ts` - Materials inventory
- `machine.model.ts` - Machines inventory
- `refreshToken.model.ts` - Token management

**Pattern:**
```typescript
export const UserModel = {
  async getAll(): Promise<User[]> {
    const sql = 'SELECT * FROM users';
    const result = await DB.query(sql);
    return result.rows;
  },

  async getById(id: string): Promise<User> {
    const sql = 'SELECT * FROM users WHERE id = $1';
    const result = await DB.query(sql, [id]);
    return result.rows[0];
  },

  async create(id: string, user: RegisterUser): Promise<string> {
    const sql = `INSERT INTO users(...) VALUES(...)`;
    await DB.query(sql, [id, ...]);
    return id;
  }
}
```

**3. Controllers (`express/src/controllers/`)**

Controllers handle business logic, validation, and error handling:

- `users.controller.ts` - Registration, login, logout, user management
- `orders.controller.ts` - Order creation, status updates, assignments
- `products.controller.ts` - Product management
- `materials.controller.ts` - Materials CRUD
- `machines.controller.ts` - Machines CRUD
- `refreshTokens.controller.ts` - Token refresh logic

**Pattern:**
```typescript
export const UsersController = {
  async login(req: Request, res: Response): Promise<void> {
    try {
      // 1. Validate input with Zod schema
      const validated = await validateLogin(req.body);

      // 2. Query database via model
      const user = await UserModel.getByEmail(validated.data.email);

      // 3. Business logic (bcrypt password check)
      const isValid = await bcrypt.compare(password, user.password);

      // 4. Generate JWT tokens
      const accessToken = jwt.sign({ id_user, role }, SECRET, { expiresIn: '60m' });
      const refreshToken = await RefreshTokensController.create(user.id);

      // 5. Set HTTP-only cookies and respond
      res.cookie('access_token', accessToken, cookieOptions)
         .cookie('refresh_token', refreshToken, refreshOptions)
         .json({ email, name, role });
    } catch (e) {
      handleError(e as Error, res);
    }
  }
}
```

**4. Validation Schemas (`express/src/schema/`)**

Zod schemas validate incoming requests:

```typescript
// express/src/schema/users.schema.ts
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const validateLogin = async (data: unknown) => {
  return loginSchema.safeParseAsync(data);
};
```

**5. Routes (`express/src/routes/`)**

Routes define endpoints and apply middleware:

```typescript
// express/src/routes/users.route.ts
import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';
import { auth, authAdmin, authOperator } from '../middlewares/auth.middleware';

export const UsersRouter = Router();

// Public endpoints
UsersRouter.post('/register', UsersController.register);
UsersRouter.post('/login', UsersController.login);
UsersRouter.post('/logout', UsersController.logout);

// Protected endpoints - require authentication
UsersRouter.use(auth);
UsersRouter.get('/me', UsersController.getMyUser);

// Operator and admin endpoints
UsersRouter.use(authOperator);
UsersRouter.get('/clients', UsersController.getClients);

// Admin-only endpoints
UsersRouter.use(authAdmin);
UsersRouter.get('/', UsersController.getAll);
UsersRouter.patch('/:id', UsersController.setAsWorker);
UsersRouter.delete('/:id', UsersController.delete);
```

**Note:** Middleware stacking works sequentially. Once `.use(auth)` is called, all subsequent routes require authentication. Then `.use(authOperator)` further restricts to operators/admins.

**6. Middleware (`express/src/middlewares/`)**

**Authentication Middleware (`auth.middleware.ts`):**

```typescript
export function auth(req: Request, res: Response, next: NextFunction) {
  const accessToken = req.cookies.access_token;
  const refreshToken = req.cookies.refresh_token;

  req.session = { userSession: null };

  try {
    // Verify access token
    const data = jwt.verify(accessToken, SECRET) as AccessTokenEncryption;
    req.session.userSession = data;
    return next();
  } catch (e) {
    // If access token expired but refresh token exists, auto-refresh
    if (refreshToken) {
      return RefreshTokensController.refresh(req, res, next);
    }
    handleError(new JsonWebTokenError('Authentication required'), res);
  }
}

export function authOperator(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userSession ||
      (req.session.userSession.role !== 'operator' &&
       req.session.userSession.role !== 'admin')) {
    throw new UnauthorizedError('Unauthorized access as operator');
  }
  next();
}

export function authAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userSession ||
      req.session.userSession.role !== 'admin') {
    throw new UnauthorizedError('Unauthorized access as admin');
  }
  next();
}
```

**Key Features:**
- Automatic token refresh when access token expires but refresh token is valid
- Session stored in `req.session.userSession` (available to all subsequent middleware/controllers)
- Role hierarchy: `admin` can access everything, `operator` can access operator+client routes, `client` can only access client routes

**7. Main Entry Point (`express/src/index.ts`)**

```typescript
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { AdminManager } from './database/AdminManager';

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/users', UsersRouter);
app.use('/orders', OrdersRouter);
app.use('/products', ProductsRouter);
app.use('/materials', MaterialsRoute);
app.use('/machines', MachinesRoute);

// Initialize admin user and start server
async function initializeApp() {
  await AdminManager.getInstance().initializeAdmin();
  app.listen(port, () => console.log('Server running'));
}

initializeApp();
```

**Admin Initialization:**
On every server startup, `AdminManager.initializeAdmin()` checks if an admin user exists. If not, it creates one using environment variables (`ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_ID_NUMBER`, `ADMIN_DEFAULT_PASSWORD`).

### Frontend Architecture (React)

#### Pattern: Component-Based with Context API and React Query

**Data Flow:**
```
User Action
  → React Component
  → API Hook (axios + React Query)
  → HTTP Request to Backend
  ← Backend Response
  → React Query Cache Update
  → Component Re-render
```

#### Core Components

**1. Entry Point (`react/src/main.tsx`)**

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';
import { ThemeProvider } from 'styled-components';
import { UserContextProvider } from './contexts/UserContextProvider';
import App from './App';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <UserContextProvider>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </UserContextProvider>
  </QueryClientProvider>
);
```

**Provider Stack:**
1. `QueryClientProvider` - TanStack Query for data fetching/caching
2. `UserContextProvider` - Global user authentication state
3. `BrowserRouter` - React Router for navigation
4. `ThemeProvider` - styled-components theming (Radix UI colors)

**2. User Context (`react/src/contexts/`)**

**UserContext.tsx** (interface):
```typescript
interface UserContextType {
  getUserContext: () => PublicUser | null;
  setUserContext: (user: PublicUser | undefined) => void;
}
```

**UserContextProvider.tsx** (implementation):
```typescript
export const UserContextProvider: React.FC<UserContextProps> = ({ children }) => {
  const [user, setUser] = useState<PublicUser | undefined>(undefined);

  // Setter: saves to localStorage and state
  const setUserContext = useCallback((user: PublicUser | undefined) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    setUser(user);
  }, []);

  // Getter: retrieves from state or localStorage
  const getUserContext = useCallback(() => {
    const userStorage = localStorage.getItem('user');
    const parsedUser = userStorage ? JSON.parse(userStorage) : null;

    if (user) return user;
    if (parsedUser) {
      setUser(parsedUser);
      return parsedUser;
    }
    return null;
  }, [user]);

  return (
    <UserContext.Provider value={{ getUserContext, setUserContext }}>
      {children}
    </UserContext.Provider>
  );
}
```

**Usage:**
- After successful login, `setUserContext(user)` stores user data
- Components call `getUserContext()` to check authentication status
- Data persists across page refreshes via localStorage
- **Note:** Actual authentication relies on HTTP-only cookies (managed by backend), not localStorage

**3. Role-Based Routing (`react/src/App.tsx`)**

```typescript
const RouterMap = {
  "client":
    <Route path="client" element={<Client />}>
      <Route path="create-order" element={<CreateOrder />} />
      <Route path="show-orders" element={<ShowClientOrders />} />
      <Route path="me" element={<Profile />} />
    </Route>,

  "operator":
    <Route path="professional" element={<Professional />}>
      <Route path="show-orders" element={<ShowOperatorOrders />} />
      <Route path="preparation" element={<PreparationView />} />
      <Route path="products" element={<Products />} />
      <Route path="me" element={<Profile />} />
    </Route>,

  "admin":
    <Route path="admin" element={<Admin />}>
      <Route path="show-clients" element={<ShowClient />} />
      <Route path="show-orders" element={<ShowAdminOrders />} />
      <Route path="machines" element={<Machines />} />
      <Route path="materials" element={<Materials />} />
      <Route path="products" element={<Products />} />
      <Route path="me" element={<Profile />} />
    </Route>
}

function App() {
  const { getUserContext } = useContext(UserContext);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const user = getUserContext();
    setRole(user ? user.role : null);
  }, [getUserContext]);

  return (
    <Routes>
      <Route path="/" element={<Home />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>
      {role ? RouterMap[role] : null}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}
```

**Routing Strategy:**
- Public routes: `/login`, `/register`
- Role-specific routes: Dynamically rendered based on user's role
- Each role has its own base path (`/client`, `/professional`, `/admin`)
- Nested routes under each role

**4. API Layer (`react/src/api/`)**

API functions use axios with `withCredentials: true` to send cookies:

```typescript
// react/src/api/users.api.ts
import axios from 'axios';
import { API } from '../config';

const usersApi = axios.create({
  baseURL: API + '/users',
  withCredentials: true  // Sends cookies with every request
});

export const loginUser = (user: LoginUser) => {
  return usersApi.post('/login', user);
};

export const getMyUser = () => {
  return usersApi.get('/me');
};

export const getClients = () => {
  return usersApi.get('/clients');
};
```

**Similar API files:**
- `orders.api.ts` - Order operations
- `products.api.ts` - Product CRUD
- `materials.api.ts` - Materials CRUD
- `machines.api.ts` - Machines CRUD

**5. Configuration (`react/src/config.ts`)**

```typescript
export const API_LOCAL = "https://pawn-to-pawn-express.vercel.app";

export const API = import.meta.env.NODE_ENV === 'production'
  ? import.meta.env.VITE_API_URL
  : API_LOCAL;
```

**Environment Variables:**
- `VITE_API_URL` - Production API URL (set in Vercel or .env.production)
- Development uses `API_LOCAL` by default

## Domain Entities

### Users
- **Table:** `users`
- **Fields:** `id`, `id_number`, `name`, `phone`, `email`, `password`, `role`
- **Roles:** `client`, `operator`, `admin`
- **Operations:** Register, login, logout, get users, ascend client to operator, delete

### Orders
- **Table:** `orders`
- **Statuses:** `pending`, `preparation`, `completed`
- **Client Actions:** Create order, view own orders, set to pending
- **Operator Actions:** View pending/preparation orders, assign to self, mark complete
- **Admin Actions:** View all orders

### Products
- **Table:** `products`
- **Access:** Operators and admins can view/manage
- **Used in:** Order creation (clients select products)

### Materials
- **Table:** `materials`
- **Access:** Admin-only management
- **Related to:** Products (materials used in product creation)

### Machines
- **Table:** `machines`
- **Access:** Admin-only management
- **Related to:** Production workflow

### Refresh Tokens
- **Table:** `refresh_tokens`
- **Purpose:** Persistent authentication sessions
- **Fields:** `token`, `id_user`, `user_agent`, `created_at`, `expires_at`, `revoked`
- **Lifecycle:** Created on login, used for auto-refresh, can be revoked

## Authentication & Authorization Flow

### Registration Flow

1. User submits registration form (email, name, password, id_number, phone)
2. Frontend: `POST /users/register` with user data
3. Backend validates with Zod schema (`validateUser`)
4. Backend hashes password with bcrypt (10 salt rounds)
5. Backend creates user in database with role `client`
6. Backend returns user data (without password)

### Login Flow

1. User submits login form (email, password)
2. Frontend: `POST /users/login`
3. Backend validates with Zod schema (`validateLogin`)
4. Backend queries user by email
5. Backend compares password with bcrypt
6. Backend generates:
   - **Access Token**: JWT with `{ id_user, role }`, expires in 60 minutes
   - **Refresh Token**: UUID stored in database, expires in 7 days
7. Backend sets HTTP-only cookies:
   - `access_token` (60 min, httpOnly, sameSite: none, secure in production)
   - `refresh_token` (7 days, httpOnly, sameSite: none, secure in production)
8. Backend returns user data `{ email, name, role }`
9. Frontend stores user in Context and localStorage

### Protected Request Flow

1. User makes request to protected endpoint
2. Browser automatically sends cookies (`access_token`, `refresh_token`)
3. `auth` middleware extracts `access_token` from cookies
4. Middleware verifies JWT signature and expiration
5. If valid:
   - Sets `req.session.userSession = { id_user, role }`
   - Calls `next()` to proceed to route handler
6. If access token expired but refresh token exists:
   - Calls `RefreshTokensController.refresh()`
   - Generates new access token
   - Sets new cookie
   - Proceeds to route handler
7. If both tokens invalid:
   - Returns 401 Unauthorized
   - Frontend redirects to login

### Token Refresh Flow

1. Access token expires (after 60 minutes)
2. `auth` middleware catches JWT verification error
3. Checks for `refresh_token` cookie
4. Queries database for refresh token:
   - Verifies token exists and not revoked
   - Checks expiration (7 days)
   - Optionally validates user_agent
5. If valid:
   - Generates new access token (60 min)
   - Sets new `access_token` cookie
   - Updates `req.session.userSession`
   - Request continues normally
6. If invalid:
   - Returns 401 Unauthorized
   - User must re-login

### Logout Flow

1. User clicks logout
2. Frontend: `POST /users/logout`
3. Backend clears both cookies (`access_token`, `refresh_token`)
4. Backend (optional): Revoke refresh token in database
5. Frontend clears user from Context and localStorage
6. Frontend redirects to login page

### Role-Based Access Control

**Middleware Stacking:**

```typescript
// Anyone can access
router.post('/register', controller.register);

// Must be authenticated
router.use(auth);
router.get('/me', controller.getMe);

// Must be operator or admin
router.use(authOperator);
router.get('/clients', controller.getClients);

// Must be admin
router.use(authAdmin);
router.get('/', controller.getAll);
```

**Role Hierarchy:**
- `client`: Can only access client routes
- `operator`: Can access operator routes + client routes (checked in `authOperator`)
- `admin`: Can access all routes (checked in `authOperator` and `authAdmin`)

**Middleware Execution Order:**
1. CORS, JSON parser, cookie parser
2. Route matching
3. `auth` - Verifies authentication, sets `req.session`
4. `authClient` (if used) - Ensures user is authenticated (redundant with `auth`)
5. `authOperator` (if used) - Ensures user is operator or admin
6. `authAdmin` (if used) - Ensures user is admin
7. Controller function

## Adding New Features

When implementing a new domain entity (e.g., `payments`, `inventory`, `categories`), follow these steps:

### Step 1: Define Shared Types

**File:** `shared/types/[entity].types.ts`

```typescript
// shared/types/payments.types.ts
export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  method: 'cash' | 'card' | 'transfer';
  status: 'pending' | 'completed' | 'failed';
  created_at: Date;
}

export type CreatePayment = Omit<Payment, 'id' | 'created_at'>;
export type UpdatePayment = Partial<CreatePayment>;
```

**Export from index:**
```typescript
// shared/types/index.ts
export * from './payments.types';
```

### Step 2: Create Database Model

**File:** `express/src/models/[entity].model.ts`

```typescript
// express/src/models/payment.model.ts
import { DB } from '../database/connect';
import { Payment, CreatePayment } from '@pawn-to-pawn/shared';
import { QueryError } from '../errors/server.error';

export const PaymentModel = {
  async getAll(): Promise<Payment[]> {
    const sql = 'SELECT * FROM payments';
    try {
      const result = await DB.query(sql);
      return result.rows;
    } catch (error) {
      throw new QueryError('Could not get payments');
    }
  },

  async getById(id: string): Promise<Payment> {
    const sql = 'SELECT * FROM payments WHERE id = $1';
    try {
      const result = await DB.query(sql, [id]);
      if (result.rows.length === 0) {
        throw new QueryError('Payment not found');
      }
      return result.rows[0];
    } catch (error) {
      throw new QueryError('Could not get payment');
    }
  },

  async create(id: string, payment: CreatePayment): Promise<string> {
    const sql = `
      INSERT INTO payments(id, order_id, amount, method, status)
      VALUES($1, $2, $3, $4, $5)
    `;
    try {
      await DB.query(sql, [id, payment.order_id, payment.amount, payment.method, payment.status]);
      return id;
    } catch (error) {
      throw new QueryError('Could not create payment');
    }
  }
};
```

### Step 3: Create Zod Validation Schema

**File:** `express/src/schema/[entity].schema.ts`

```typescript
// express/src/schema/payments.schema.ts
import { z } from 'zod';

const createPaymentSchema = z.object({
  order_id: z.string().uuid(),
  amount: z.number().positive(),
  method: z.enum(['cash', 'card', 'transfer']),
  status: z.enum(['pending', 'completed', 'failed'])
});

export const validateCreatePayment = async (data: unknown) => {
  return createPaymentSchema.safeParseAsync(data);
};
```

### Step 4: Create Controller

**File:** `express/src/controllers/[entity].controller.ts`

```typescript
// express/src/controllers/payments.controller.ts
import { Request, Response } from 'express';
import { PaymentModel } from '../models/payment.model';
import { validateCreatePayment } from '../schema/payments.schema';
import { handleError } from '../errors/handleError';
import { ClientError } from '../errors/client.error';

export const PaymentsController = {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const payments = await PaymentModel.getAll();
      res.status(200).json(payments);
    } catch (e) {
      handleError(e as Error, res);
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const validated = await validateCreatePayment(req.body);
      if (!validated.success) {
        throw new ClientError('Validation failed');
      }

      const id = crypto.randomUUID();
      const paymentId = await PaymentModel.create(id, validated.data);
      const payment = await PaymentModel.getById(paymentId);

      res.status(201).json(payment);
    } catch (e) {
      handleError(e as Error, res);
    }
  }
};
```

### Step 5: Create Routes

**File:** `express/src/routes/[entity].route.ts`

```typescript
// express/src/routes/payments.route.ts
import { Router } from 'express';
import { PaymentsController } from '../controllers/payments.controller';
import { auth, authOperator, authAdmin } from '../middlewares/auth.middleware';

export const PaymentsRouter = Router();

// All payment routes require authentication
PaymentsRouter.use(auth);

// Operators and admins can view payments
PaymentsRouter.use(authOperator);
PaymentsRouter.get('/', PaymentsController.getAll);
PaymentsRouter.get('/:id', PaymentsController.getById);

// Only admins can create payments
PaymentsRouter.use(authAdmin);
PaymentsRouter.post('/', PaymentsController.create);
```

### Step 6: Register Routes in Main App

**File:** `express/src/index.ts`

```typescript
import { PaymentsRouter } from './routes/payments.route';

// ... existing code ...

app.use('/payments', PaymentsRouter);
```

### Step 7: Create Frontend API Client

**File:** `react/src/api/[entity].api.ts`

```typescript
// react/src/api/payments.api.ts
import axios from 'axios';
import { API } from '../config';
import { CreatePayment } from '@pawn-to-pawn/shared';

const paymentsApi = axios.create({
  baseURL: API + '/payments',
  withCredentials: true
});

export const getPayments = () => {
  return paymentsApi.get('/');
};

export const getPaymentById = (id: string) => {
  return paymentsApi.get(`/${id}`);
};

export const createPayment = (payment: CreatePayment) => {
  return paymentsApi.post('/', payment);
};
```

### Step 8: Create Frontend Components/Pages

**Example with React Query:**

```typescript
// react/src/pages/admin/Payments.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPayments, createPayment } from '../../api/payments.api';

export const Payments: React.FC = () => {
  const queryClient = useQueryClient();

  // Fetch payments
  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const response = await getPayments();
      return response.data;
    }
  });

  // Create payment mutation
  const createMutation = useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    }
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Payments</h1>
      {payments?.map(payment => (
        <div key={payment.id}>{payment.amount}</div>
      ))}
    </div>
  );
};
```

## Environment Configuration

### Backend Environment Variables

**File:** `express/.env`

```bash
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

**Required Variables:**
- `DATABASE_URL`: PostgreSQL connection string from Supabase (must include SSL)
- `SECRET_JWT_KEY`: Secret for signing JWT tokens (use long random string)
- `FRONTEND_URL`: Frontend origin for CORS (development: http://localhost:5173, production: your deployed URL)
- `PORT`: Server port (default 3000)
- `ADMIN_ID_NUMBER`, `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_DEFAULT_PASSWORD`: Admin user credentials (created on first startup)

### Frontend Environment Variables

**File:** `react/.env.production`

```bash
VITE_API_URL=https://your-backend-api.com
```

**Note:**
- Development uses `API_LOCAL` from `config.ts`
- Vite environment variables must be prefixed with `VITE_`

## TypeScript Configuration

### Backend (`express/tsconfig.json`)

**Key Settings:**
- `target`: ES2022
- `module`: commonjs (Node.js compatibility)
- `outDir`: ./build
- `strict`: true
- `noUnusedLocals`: true
- `noUnusedParameters`: true
- `noImplicitReturns`: true
- `noFallthroughCasesInSwitch`: true
- `esModuleInterop`: true

**Compilation:**
```bash
npm run tsc  # Compiles src/ → build/
```

### Frontend (`react/tsconfig.json`)

Uses project references:
- `tsconfig.app.json` - App source code configuration
- `tsconfig.node.json` - Vite config TypeScript settings

**Build:**
```bash
npm run build  # TypeScript check + Vite build
```

## Key Patterns and Best Practices

### 1. Error Handling

**Backend:**
```typescript
try {
  // business logic
} catch (e) {
  handleError(e as Error, res);
}
```

**Custom Errors:**
- `ClientError` - 400 Bad Request (user input errors)
- `ServerError` - 500 Internal Server Error
- `UnauthorizedError` - 401 Unauthorized
- `QueryError` - Database errors

### 2. Password Security

```typescript
// Registration
const salt = await bcrypt.genSalt(10);
const hash = await bcrypt.hash(password, salt);

// Login
const isValid = await bcrypt.compare(password, hashedPassword);
```

### 3. Never Return Passwords

```typescript
const { password: _, ...userWithoutPassword } = user;
res.json(userWithoutPassword);
```

### 4. React Query Patterns

```typescript
// GET request
const { data, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: async () => {
    const response = await getUsers();
    return response.data;
  }
});

// POST/PUT/DELETE request
const mutation = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  }
});
```

### 5. Styled Components with Theme

```typescript
import styled from 'styled-components';

const Button = styled.button`
  background-color: ${props => props.theme.accent9};
  color: white;

  &:hover {
    background-color: ${props => props.theme.accent10};
  }
`;
```

## Common Development Tasks

### Running the Full Stack Locally

**Terminal 1 - Backend:**
```bash
cd express
npm install
# Create .env file with required variables
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd react
npm install
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### Debugging Authentication Issues

**Check cookies:**
```typescript
console.log('Access Token:', req.cookies.access_token);
console.log('Refresh Token:', req.cookies.refresh_token);
console.log('Session:', req.session);
```

**Common issues:**
- CORS not allowing credentials: Check `FRONTEND_URL` matches exactly
- Cookies not being sent: Ensure `withCredentials: true` in axios
- Token expired: Check JWT expiration times
- SameSite cookie issues: Use `sameSite: 'none'` with `secure: true` in production

### Testing Role-Based Access

**Login as different roles:**
1. Register as client (default role)
2. Login as admin (created on startup)
3. Use admin to promote client to operator (`PATCH /users/:id`)

**Check middleware:**
- Client routes: Only require `auth`
- Operator routes: Require `auth` + `authOperator`
- Admin routes: Require `auth` + `authAdmin`

### Database Schema Management

**Currently no migrations system is in place.** Database schema is managed manually in Supabase.

**Tables needed:**
- `users` (id, id_number, name, phone, email, password, role)
- `orders` (id, client_id, operator_id, status, products, created_at, updated_at)
- `products` (id, name, description, price, materials, machines)
- `materials` (id, name, description, stock)
- `machines` (id, name, description, status)
- `refresh_tokens` (token, id_user, user_agent, created_at, expires_at, revoked)

## Deployment

### Backend Deployment (Vercel)

The backend is currently deployed to Vercel:
- URL: https://pawn-to-pawn-express.vercel.app
- Environment variables must be set in Vercel dashboard
- Build command: `npm run tsc`
- Output directory: `build/`
- Start command: `node build/index.js`

### Frontend Deployment (Vercel)

- Set `VITE_API_URL` environment variable to production backend URL
- Build command: `npm run build`
- Output directory: `dist/`

## Troubleshooting

### "Module not found: @pawn-to-pawn/shared"

**Solution:**
```bash
cd express  # or cd react
npm install
```

The shared package uses `file:../shared` linking and needs to be reinstalled.

### TypeScript errors after modifying shared types

**Solution:**
1. Restart TypeScript server in your IDE
2. Reinstall dependencies in affected package
3. Clear build cache: `rm -rf build/` (backend) or `rm -rf dist/` (frontend)

### CORS errors

**Solution:**
1. Check `FRONTEND_URL` in backend `.env` matches frontend URL exactly
2. Ensure no trailing slashes in URLs
3. Verify `credentials: true` in CORS config
4. Check `withCredentials: true` in axios config

### Cookies not persisting

**Solution:**
1. Check `sameSite` and `secure` cookie options
2. In development with localhost, use `sameSite: 'lax'` or 'none' with HTTPS
3. Ensure cookies are HTTP-only (prevents JavaScript access)
4. Verify cookie domain and path settings

## Additional Notes

- **No test suite currently exists** - Tests need to be implemented
- **DatabaseManager.ts singleton exists but is unused** - All models use `DB` from `connect.ts`
- **Admin user password should be changed** after first login via admin panel
- **Refresh token revocation** is partially implemented (commented out in logout)
- **User agent validation** can be added to refresh token flow for extra security
- i see you create a DOCKER.md file I wanna all this files about how works certains parts in the route ./docs/ai-context/how