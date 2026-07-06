# Malika's Cake Boutique – Custom Order Platform

A full-stack web platform for custom cake orders with automated validation, owner dashboards, and email confirmations.

**Soft Launch:** September 2026 | **Full Production:** January 2027

## Project Structure

```
malika/
├── server/          # Node.js + Express backend
├── client/          # React + Vite frontend
└── docs/            # Documentation & architecture
```

## Tech Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Zustand
- **Backend:** Node.js, Express, TypeScript, Prisma ORM
- **Database:** SQLite in dev (zero install); PostgreSQL for production
- **Hosting:** Vercel (frontend), Railway/Render (backend)
- **Email:** Nodemailer (logs to console when SMTP is unconfigured)
- **Auth:** JWT (24hr tokens, bcrypt passwords)

## Quick Start

### Prerequisites
- Node.js 18+ and npm — that's it (dev DB is SQLite, no database server needed)

### Backend Setup
```bash
cd server
npm install
cp .env.example .env    # defaults work out of the box
npx prisma db push      # create SQLite dev.db from schema
npm run db:seed         # catalog + admin user
npm run dev             # http://localhost:3000
```

### Frontend Setup
```bash
cd client
npm install
npm run dev             # http://localhost:5173 (proxies /api to :3000)
```

### Default Admin Login
- Email: `admin@malikacakes.co.za`
- Password: `admin123` (change via ADMIN_PASSWORD in .env before re-seeding)

## Phase 1 Deliverables (Sep–Oct 2026)

- [x] Database schema & migrations
- [x] Order form (7-step wizard, live pricing, draft persistence)
- [x] Admin dashboard (stats, order queue with filters, order detail, status & payment updates, customers)
- [x] Customer order-status lookup (order # + email, status timeline)
- [x] Authentication (JWT)
- [x] Email service (confirmation + ready-for-pickup; console fallback without SMTP)
- [x] Pricing engine (base + add-ons + 15% VAT)
- [x] Lead-time validation (14 days, client + server)
- [x] Audit log on admin status changes
- [ ] Testing suite
- [ ] Deployment pipeline

## Phase 2 (Nov–Dec 2026)

- Payment integration (PayFast)
- Order status dashboard (customer view)
- Payment reminders (email + SMS)
- Refund automation

## Phase 3+ (Jan 2027+)

- Delivery integration (Uber Connect)
- Customer login & order history
- Reviews & ratings
- Multi-language support

## Key Features

### Customer Side
- 7-step order form with real-time pricing
- Draft persistence (localStorage)
- Order confirmation via email
- Order status tracking

### Admin Side
- Order queue dashboard (sorted by pickup date)
- Status management (draft → confirmed → paid → ready → picked up)
- Customer management
- Payment tracking & reminders
- Catalog management (sizes, flavors, fillings, toppers)

## Business Rules (Enforced)

- **Lead Time:** 14 days minimum
- **Payment Deadline:** 7 days before pickup
- **Refunds:** >14 days = full, 7–14 = 50%, <7 = none
- **Pickup Hours:** 8am–5pm (default 12pm)
- **Customization:** Single flavor, single filling, multiple toppers

## License

Private — Malika's Cake Boutique © 2026
