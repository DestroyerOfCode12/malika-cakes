# Malika's Cake Boutique – Development Setup Guide

## Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ (download from https://nodejs.org)
- PostgreSQL 14+ (or use Docker/cloud: Supabase, Railway, etc.)
- Git

### 1. Clone & Install

```bash
# Backend setup
cd server
npm install
cp .env.example .env.local

# Frontend setup
cd ../client
npm install
cp .env.example .env.local
```

### 2. Configure Environment

**server/.env.local:**
```
DATABASE_URL="postgresql://user:password@localhost:5432/malika_cakes"
NODE_ENV="development"
PORT=3000
JWT_SECRET="dev-secret-key-change-in-production"
ADMIN_EMAIL="admin@malikacakes.co.za"
ADMIN_PASSWORD="admin123"
```

**client/.env.local:**
```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_NODE_ENV=development
```

### 3. Initialize Database

```bash
cd server

# Create tables
npm run db:push

# Seed initial data (catalog + admin user)
npm run db:seed
```

### 4. Start Dev Servers

Terminal 1 (Backend):
```bash
cd server
npm run dev
# Server runs on http://localhost:3000
```

Terminal 2 (Frontend):
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

### 5. Test the App

- **Home:** http://localhost:5173
- **Order Form:** http://localhost:5173/order
- **Admin Login:** http://localhost:5173/admin/login
  - Email: `admin@malikacakes.co.za`
  - Password: `admin123`
- **API Docs:** Check `server/schema.sql` for DB structure

---

## Database Setup (PostgreSQL)

### Option A: Local PostgreSQL

```bash
# macOS (with Homebrew)
brew install postgresql@15
brew services start postgresql@15
createdb malika_cakes

# Windows (installer)
# Download from https://www.postgresql.org/download/windows/

# Linux (Ubuntu/Debian)
sudo apt-get install postgresql postgresql-contrib
sudo -u postgres createdb malika_cakes
```

### Option B: Docker

```bash
docker run --name malika-postgres \
  -e POSTGRES_DB=malika_cakes \
  -e POSTGRES_PASSWORD=secret \
  -p 5432:5432 \
  -d postgres:15
```

### Option C: Cloud (Recommended for Production)

- **Supabase:** https://supabase.com (free tier available)
- **Railway:** https://railway.app
- **Neon:** https://neon.tech

---

## Project Structure

```
malika/
├── server/                    # Node.js + Express backend
│   ├── src/
│   │   ├── app.ts            # Express setup
│   │   ├── index.ts          # Entry point
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Business logic
│   │   ├── middleware/       # Auth, error handling
│   │   ├── types/            # TypeScript interfaces
│   │   └── utils/            # Helpers
│   ├── prisma/
│   │   ├── schema.prisma     # Database ORM
│   │   └── seed.ts           # Initial data
│   └── package.json
│
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   ├── store/            # Zustand state
│   │   ├── services/         # API clients
│   │   ├── types/            # TypeScript interfaces
│   │   ├── utils/            # Helpers
│   │   ├── App.tsx           # Main router
│   │   └── main.tsx          # Entry point
│   ├── index.html
│   └── package.json
│
├── README.md                  # Project overview
├── SETUP.md                   # This file
└── .gitignore
```

---

## Common Commands

### Backend

```bash
cd server

npm run dev                # Start dev server (watches for changes)
npm run build             # Build for production
npm run start             # Run production build
npm run db:push           # Sync Prisma schema to DB
npm run db:seed           # Populate catalog + admin user
npm run db:studio         # Open Prisma Studio (visual DB manager)
npm test                  # Run tests
```

### Frontend

```bash
cd client

npm run dev               # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run linter
```

---

## API Endpoints (Core)

### Public
- `GET /api/catalog/sizes` – List cake sizes
- `GET /api/catalog/flavors` – List flavors
- `GET /api/catalog/fillings` – List fillings
- `GET /api/catalog/toppers` – List toppers
- `POST /api/orders` – Create order
- `GET /api/orders/:id` – Fetch order
- `PATCH /api/orders/:id` – Update order (before payment)
- `DELETE /api/orders/:id` – Cancel order
- `POST /api/auth/login` – Admin login

### Admin (Protected)
- `GET /api/admin/orders` – List all orders
- `GET /api/admin/orders/:id` – Order detail
- `PATCH /api/admin/orders/:id/status` – Update status
- `GET /api/admin/dashboard` – Stats
- `GET /api/admin/customers` – Customer list

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000 (backend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### Database Connection Error
```bash
# Check .env.local has correct DATABASE_URL
# Verify PostgreSQL is running
psql postgres -c "SELECT 1"

# Reset database
npm run db:push --force
```

### Module Not Found
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## IDE Setup

### VS Code Extensions (Recommended)

- **Prisma:** `prisma.prisma`
- **ESLint:** `dbaeumer.vscode-eslint`
- **Prettier:** `esbenp.prettier-vscode`
- **Thunder Client:** `rangav.vscode-thunder-client` (for API testing)

### VS Code Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

---

## Next Steps

1. **Step into order form:** Implement Step 1-7 components (`client/src/components/OrderForm/`)
2. **Build admin dashboard:** Order queue, status updates, customer management
3. **Add email service:** Confirmation & reminder emails
4. **Integrate payments:** PayFast modal (Phase 2)
5. **Add tests:** Unit + integration + E2E

See `README.md` and the [Specification](./README.md) for full details.

---

## Support

- Docs: `README.md`
- API: `server/schema.sql`, `server/src/routes/`
- Database: `server/prisma/schema.prisma`
- Frontend types: `client/src/types/index.ts`

Happy coding! 🎂
