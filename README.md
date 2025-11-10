# Kanny Kanban Backend

RESTful API backend for the Kanny Kanban Board application, built with Node.js, Express, TypeScript, and PostgreSQL.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (Access + Refresh tokens)
- **Testing**: Jest + Supertest
- **Deployment**: Render

## Features

- 🔐 JWT-based authentication with refresh tokens
- 📋 CRUD operations for boards, columns, and cards
- 🔄 Card drag & drop with position management
- 🔒 Route protection middleware
- ✅ Comprehensive error handling
- 🧪 Test coverage

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kanny-kanban-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/kanny_kanban?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
JWT_REFRESH_SECRET="your-refresh-secret-key-change-in-production"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

4. Set up the database:
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

5. Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:3001`

## Project Structure

```
src/
├── config/          # Configuration files
│   └── database.ts  # Prisma client
├── controllers/     # Route controllers
├── middleware/      # Express middleware
│   └── auth.middleware.ts
├── routes/          # API routes
├── services/        # Business logic
├── tests/           # Test files
└── server.ts        # Express app entry point
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user (protected)

### Boards

- `GET /api/boards` - Get all user's boards (protected)
- `GET /api/boards/:id` - Get board by ID (protected)
- `POST /api/boards` - Create a new board (protected)
- `PUT /api/boards/:id` - Update board (protected)
- `DELETE /api/boards/:id` - Delete board (protected)

### Columns

- `POST /api/boards/:boardId/columns` - Create column (protected)
- `PUT /api/boards/columns/:id` - Update column (protected)
- `DELETE /api/boards/columns/:id` - Delete column (protected)

### Cards

- `POST /api/columns/:columnId/cards` - Create card (protected)
- `PUT /api/cards/:id` - Update card (protected)
- `DELETE /api/cards/:id` - Delete card (protected)
- `PUT /api/cards/:id/move` - Move card to new position/column (protected)

## Authentication

The API uses JWT tokens for authentication:

- **Access Token**: Short-lived (15 minutes), sent in `Authorization: Bearer <token>` header
- **Refresh Token**: Long-lived (7 days), stored in HTTP-only cookie

### Example Request

```bash
curl -X GET http://localhost:3001/api/boards \
  -H "Authorization: Bearer <access-token>"
```

## Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Database Migrations

Create a new migration:
```bash
npm run prisma:migrate
```

Open Prisma Studio:
```bash
npm run prisma:studio
```

## Deployment

### Render

1. Connect your GitHub repository to Render
2. Set build command: `npm install && npm run build && npm run prisma:generate`
3. Set start command: `npm start`
4. Add environment variables in Render dashboard
5. Deploy!

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for access token signing
- `JWT_REFRESH_SECRET` - Secret for refresh token signing
- `JWT_ACCESS_EXPIRES_IN` - Access token expiration (default: 15m)
- `JWT_REFRESH_EXPIRES_IN` - Refresh token expiration (default: 7d)
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Comma-separated list of frontend origins allowed by CORS
