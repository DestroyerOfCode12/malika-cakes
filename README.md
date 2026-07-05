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

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Zustand, React Hook Form
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL
- **Hosting:** Vercel (frontend), Railway/Render (backend)
- **Email:** SendGrid
- **Auth:** JWT (24hr tokens, bcrypt passwords)

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (local or cloud)
- npm or yarn

### Backend Setup
```bash
cd server
npm install
cp .env.example .env.local
npm run db:migrate
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

Visit `http://localhost:5173` (frontend) and `http://localhost:3000` (backend).

## Phase 1 Deliverables (Sep–Oct 2026)

- [x] Database schema & migrations
- [x] Order form (7-step wizard)
- [x] Admin dashboard (order queue)
- [x] Authentication (JWT)
- [x] Email service (confirmations)
- [x] Pricing engine
- [x] Lead-time validation
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
