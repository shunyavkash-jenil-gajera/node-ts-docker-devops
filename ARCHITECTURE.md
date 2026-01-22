# Architecture Diagram

## MVC Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT REQUEST                           │
│                   (HTTP JSON Request)                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXPRESS APP                                │
│                   (src/app.ts)                                  │
│  - JSON parser middleware                                       │
│  - Route matching                                               │
│  - Middleware chain execution                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                 ROUTES (src/routes/)                            │
│                                                                  │
│  GET  /auth/profile    ──▶ verifyToken middleware             │
│  POST /auth/login      ──▶ (no middleware - public)            │
│  POST /auth/signup     ──▶ (no middleware - public)            │
│  POST /auth/logout     ──▶ verifyToken middleware             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│         MIDDLEWARE (src/middleware/auth.middleware.ts)          │
│                                                                  │
│  verifyToken:                                                   │
│  1. Extract Bearer token from Authorization header             │
│  2. Call authService.verifyToken()                             │
│  3. Attach user to request object                              │
│  4. Call next() or return 401 error                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│         CONTROLLERS (src/controllers/auth.controller.ts)        │
│                                                                  │
│  signup(req, res):                                              │
│    1. Extract email, password from req.body                    │
│    2. Call authService.signUp()                                │
│    3. Catch errors and call SendResponse()                     │
│                                                                  │
│  login(req, res):                                               │
│    1. Extract credentials from req.body                        │
│    2. Call authService.login()                                 │
│    3. Return user + tokens via SendResponse()                  │
│                                                                  │
│  getProfile(req, res):                                          │
│    1. Extract user ID from req.user (set by middleware)        │
│    2. Call authService.getUserById()                           │
│    3. Return user data via SendResponse()                      │
│                                                                  │
│  logout(req, res):                                              │
│    1. Call authService.logout()                                │
│    2. Return success message via SendResponse()                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│         SERVICES (src/services/auth.service.ts)                 │
│                                                                  │
│  AuthService (Singleton):                                       │
│    - signUp(payload): Create user via Supabase Auth            │
│    - login(payload): Authenticate user                         │
│    - logout(): Sign out user                                   │
│    - getUserById(id): Fetch user by ID                         │
│    - verifyToken(token): Validate JWT token                    │
│                                                                  │
│  All methods interact with Supabase client                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│      SUPABASE CLIENT (src/config/supabase.config.ts)            │
│                                                                  │
│  createClient(SUPABASE_URL, SUPABASE_KEY)                       │
│    ├── supabase.auth.signUp()                                  │
│    ├── supabase.auth.signInWithPassword()                      │
│    ├── supabase.auth.signOut()                                 │
│    ├── supabase.auth.getUser()                                 │
│    └── supabase.auth.admin.getUserById()                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              SUPABASE BACKEND (Cloud)                           │
│                                                                  │
│  - User authentication                                          │
│  - JWT token generation                                         │
│  - Session management                                          │
│  - Metadata storage                                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│            RESPONSE via SendResponse()                          │
│         (src/handlers/responce.handler.ts)                      │
│                                                                  │
│  {                                                              │
│    "code": 200,                                                │
│    "success": true,                                            │
│    "message": "Success message",                               │
│    "data": { /* response data */ }                             │
│  }                                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              ERROR HANDLING                                     │
│                                                                  │
│  Unhandled errors → globalErrorHandler middleware              │
│  → SendResponse() with standardized error format               │
│                                                                  │
│  (src/handlers/globleError.handler.ts)                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CLIENT RESPONSE                               │
│                 (JSON with status code)                         │
└─────────────────────────────────────────────────────────────────┘
```

## File Dependency Graph

```
app.ts
├── routes/auth.routes.ts
│   ├── controllers/auth.controller.ts
│   │   ├── services/auth.service.ts
│   │   │   ├── config/supabase.config.ts
│   │   │   └── models/user.model.ts
│   │   └── handlers/responce.handler.ts
│   ├── middleware/auth.middleware.ts
│   │   ├── services/auth.service.ts
│   │   └── handlers/responce.handler.ts
│   └── models/user.model.ts
├── handlers/responce.handler.ts
├── handlers/globleError.handler.ts
├── config/environment.config.ts
└── config/supabase.config.ts
```

## Data Models

```typescript
// User Model
User {
  id: string (UUID)
  email: string
  firstName?: string
  lastName?: string
  password?: string
  createdAt: Date
  updatedAt: Date
}

// Request Models
SignUpPayload {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

LoginPayload {
  email: string
  password: string
}

// Response Model
SendResponse {
  code: number (HTTP status)
  success: boolean
  message: string
  data: any
}
```

## Authentication Flow

### Signup Flow
```
Client: POST /auth/signup
  ↓
Route: routes/auth.routes.ts
  ↓
Middleware: None (public endpoint)
  ↓
Controller: authController.signup()
  ├─ Validate input
  ├─ Call authService.signUp()
  │   ├─ supabase.auth.signUp()
  │   └─ Create user in Supabase
  ├─ Catch errors
  └─ SendResponse(201, { user, token, refreshToken })
  ↓
Client: Receives JWT tokens + user data
```

### Login Flow
```
Client: POST /auth/login
  ↓
Route: routes/auth.routes.ts
  ↓
Middleware: None (public endpoint)
  ↓
Controller: authController.login()
  ├─ Validate credentials
  ├─ Call authService.login()
  │   ├─ supabase.auth.signInWithPassword()
  │   └─ Return session with JWT
  ├─ Catch errors
  └─ SendResponse(200, { user, token, refreshToken })
  ↓
Client: Receives JWT tokens + user data
```

### Protected Endpoint Flow
```
Client: GET /auth/profile + Bearer Token
  ↓
Route: routes/auth.routes.ts
  ↓
Middleware: verifyToken
  ├─ Extract Bearer token
  ├─ Call authService.verifyToken(token)
  │   ├─ supabase.auth.getUser(token)
  │   └─ Validate token
  ├─ Attach user to request
  └─ Call next() or return 401
  ↓
Controller: authController.getProfile()
  ├─ Get user from (req as any).user
  ├─ Call authService.getUserById()
  └─ SendResponse(200, { user })
  ↓
Client: Receives user profile
```

## Deployment

```
Developer Environment
├── npm run dev (hot reload)
└── .env (with credentials)

Production Environment
├── docker build
├── docker run
│   ├── dist/ (compiled)
│   ├── node_modules (production only)
│   └── Environment variables
└── Listening on PORT 3000

Test Environment
├── npm test (Vitest)
├── NODE_ENV=test (skips server startup)
└── .env (can be empty or mock Supabase)
```
