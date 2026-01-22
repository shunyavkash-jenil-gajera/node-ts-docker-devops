# Node.js + TypeScript + Docker + Supabase Authentication

A production-ready Node.js application with Express, TypeScript, Docker containerization, and Supabase authentication using MVC architecture.

## 🚀 Quick Start

### Prerequisites
- Node.js 22+ and npm
- Supabase account with project URL and API key

### Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your Supabase credentials
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_key

# Development
npm run dev

# Production
npm run build
npm start

# Tests
npm test
npm run test:watch
```

## 📋 Project Structure

```
src/
├── app.ts                 # Express app setup and middleware
├── config/
│   ├── environment.config.ts   # Environment variable management
│   ├── supabase.config.ts      # Supabase client initialization
│   └── vitest.config.ts        # Test configuration
├── controllers/
│   └── auth.controller.ts      # Auth request handlers
├── services/
│   └── auth.service.ts         # Supabase integration logic
├── middleware/
│   └── auth.middleware.ts      # JWT verification and auth guards
├── routes/
│   └── auth.routes.ts          # Auth endpoint definitions
├── models/
│   └── user.model.ts           # TypeScript interfaces
└── handlers/
    ├── responce.handler.ts     # Standardized response formatter
    └── globleError.handler.ts  # Global error middleware
```

## 🏗️ MVC Architecture

### Models (`src/models/`)
Defines TypeScript interfaces for type-safe data structures:
- `User`: User data structure
- `SignUpPayload`: Signup request payload
- `LoginPayload`: Login request payload

### Controllers (`src/controllers/`)
Handles HTTP requests and orchestrates business logic:
- `signup()`: Register new user
- `login()`: Authenticate user
- `logout()`: End user session
- `getProfile()`: Retrieve user information

### Services (`src/services/`)
Encapsulates Supabase integration and business logic:
- Direct interaction with Supabase Auth
- User data transformation
- Error handling

### Routes (`src/routes/`)
Maps HTTP endpoints to controller methods:
- Public endpoints: `/auth/signup`, `/auth/login`
- Protected endpoints: `/auth/logout`, `/auth/profile`

### Middleware (`src/middleware/`)
Cross-cutting concerns:
- `verifyToken`: Validates JWT tokens and requires authentication
- `optionalVerifyToken`: Optional token validation

## 🔐 Authentication API

### Signup
```bash
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password",
  "firstName": "John",
  "lastName": "Doe"
}

Response:
{
  "code": 201,
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}

Response:
{
  "code": 200,
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

### Get Profile (Protected)
```bash
GET /auth/profile
Authorization: Bearer jwt_access_token

Response:
{
  "code": 200,
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "createdAt": "2026-01-22T...",
      "updatedAt": "2026-01-22T..."
    }
  }
}
```

### Logout (Protected)
```bash
POST /auth/logout
Authorization: Bearer jwt_access_token

Response:
{
  "code": 200,
  "success": true,
  "message": "Logout successful"
}
```

## 🧪 Testing

Tests use Vitest with supertest for HTTP testing:

```bash
npm test              # Run tests once
npm run test:watch    # Watch mode for TDD
```

Example test:
```typescript
describe('GET /', () => {
  it('should return hello message', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
  });
});
```

## 🐳 Docker

### Build
```bash
docker build -t node-ts-app .
```

### Run
```bash
docker run -p 3000:3000 \
  -e SUPABASE_URL=<your_url> \
  -e SUPABASE_KEY=<your_key> \
  -e PORT=3000 \
  node-ts-app
```

The Dockerfile uses multi-stage build for minimal production image.

## 📝 Response Format

All endpoints return standardized JSON:

```typescript
{
  code: number;        // HTTP status code
  success: boolean;    // Operation success flag
  message: string;     // Human-readable message
  data: any;          // Response payload
}
```

## 🔑 Key Features

- ✅ **MVC Architecture**: Clear separation of concerns
- ✅ **TypeScript**: Full type safety with strict mode
- ✅ **Supabase Auth**: Production-grade authentication
- ✅ **Docker**: Multi-stage build for optimized images
- ✅ **Error Handling**: Global middleware for consistent error responses
- ✅ **Testing**: Vitest + supertest setup
- ✅ **ESM Modules**: Native ES modules with Node.js

## 🛠️ Development Tips

### Adding New Endpoints

1. **Create Model** - Define types in `src/models/`
2. **Create Service** - Add business logic in `src/services/`
3. **Create Controller** - Add handler in `src/controllers/`
4. **Create Route** - Add endpoint in `src/routes/`
5. **Import Route** - Add to `src/app.ts`

### Authentication Pattern
```typescript
// Protected endpoint
router.get("/protected", verifyToken, (req, res) =>
  controller.method(req, res)
);

// In controller
async method(req: Request, res: Response) {
  try {
    const user = (req as any).user; // From middleware
    // ... business logic ...
    SendResponse(res, 200, true, "Success", data);
  } catch (error: any) {
    SendResponse(res, 400, false, error.message);
  }
}
```

## 📚 Configuration

| Variable | Default | Required | Purpose |
|----------|---------|----------|---------|
| PORT | 3000 | No | Server port |
| SUPABASE_URL | - | Yes* | Supabase project URL |
| SUPABASE_KEY | - | Yes* | Supabase API key |
| NODE_ENV | development | No | Environment (test skips server startup) |

*Required only if using authentication features

## 🤝 Contributing

Follow the MVC pattern and ensure:
- All files compile: `npm run build`
- Tests pass: `npm test`
- TypeScript strict mode compliance
- Standardized response format via `SendResponse()`

## 📄 License

ISC
