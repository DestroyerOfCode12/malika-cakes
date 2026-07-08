# Deploying Malika's Cake Boutique

The app is split across two hosts:

- **Frontend** (`client/`) → **Netlify** — a static Vite/React build.
- **Backend** (`server/`) → **Railway or Render** — a real Node/Express
  process. Netlify's serverless functions don't support this without a
  rewrite (no persistent server, no local disk), so the backend needs a
  host that runs long-lived Node processes.
- **Database** → any hosted **PostgreSQL** (Neon, Supabase, or the
  Postgres add-on Railway/Render both offer).

Deploy in this order: **database → backend → frontend**, since the
frontend needs the backend's URL and the backend needs the database's
connection string.

## 1. Database (Postgres)

Pick one — all have generous free tiers and take under 5 minutes:

- **[Neon](https://neon.tech)** — fastest signup, no credit card.
- **[Supabase](https://supabase.com)** — also gives you a dashboard/table
  editor for free.
- **Railway's own Postgres** — convenient if you're already deploying the
  backend there (one dashboard for both).

Whichever you pick, copy the connection string — it looks like:
```
postgresql://user:password@host:5432/dbname?sslmode=require
```

## 2. Backend (Railway or Render)

1. Push this repo to GitHub if you haven't already.
2. Create a new Railway/Render project from the repo.
3. Set the **root/base directory** to `server`.
4. **Build command:**
   ```
   npm install && npx prisma generate
   ```
5. **Start command:**
   ```
   npx prisma migrate deploy && npm run build && npm start
   ```
   (`migrate deploy` applies the schema to your Postgres database on
   every deploy — safe to run repeatedly, it's a no-op once up to date.)
6. **Environment variables** — set these in the host's dashboard (never
   commit them):
   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | your Postgres connection string from step 1 |
   | `NODE_ENV` | `production` |
   | `JWT_SECRET` | a long random string (e.g. `openssl rand -hex 32`) |
   | `CORS_ORIGIN` | your Netlify URL, e.g. `https://malikas-cakes.netlify.app` (add your custom domain too, comma-separated, once you have one) |
   | `ADMIN_EMAIL` / `ADMIN_PASSWORD` | credentials for the seeded admin login |
   | `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | your email provider, or leave `SMTP_HOST` empty to log emails to the server console instead of sending |
   | `EMAIL_FROM` / `EMAIL_FROM_NAME` | sender identity for outgoing emails |
   | `FRONTEND_URL` | your Netlify URL (needed once you know it — see step 3; PayFast redirects use this) |
   | `BACKEND_URL` | this backend's own public URL (PayFast's payment-confirmation webhook needs to reach it) |
   | `PAYFAST_MODE` | `sandbox` for testing, `live` to go live |
   | `PAYFAST_MERCHANT_ID` / `PAYFAST_MERCHANT_KEY` / `PAYFAST_PASSPHRASE` | from your PayFast (sandbox or live) merchant account — see **PayFast setup** below. Leave unset and "Pay Now" just returns a clear error instead of breaking, so it's safe to deploy before these are ready. |
7. Deploy. Once it's live, run the seed script once (Railway/Render both
   let you run one-off commands against the deployed environment):
   ```
   npm run db:seed
   ```
8. Note the backend's public URL (e.g. `https://malika-api.up.railway.app`)
   — you'll need it in the next step.

## 3. Frontend (Netlify)

The repo already has `netlify.toml` at the root configured for this
monorepo (base directory `client`, build command, and the SPA redirect
React Router needs).

1. In Netlify: **Add new site → Import an existing project**, pick this
   repo. It should auto-detect the settings from `netlify.toml`.
2. **Environment variable** (Site settings → Environment variables):
   | Variable | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://<your-backend-url>/api` |
3. Deploy.
4. Go back to your backend host and set `CORS_ORIGIN` to the Netlify URL
   you were just given (e.g. `https://malikas-cakes.netlify.app`), then
   redeploy the backend so the new origin takes effect.

## PayFast setup (online payments)

PayFast retired anonymous public sandbox credentials — a free sandbox
account (still no real bank/business details needed) is required even for
test payments:

1. Sign up at **[sandbox.payfast.co.za](https://sandbox.payfast.co.za)**.
2. In the sandbox merchant dashboard, find your **Merchant ID** and
   **Merchant Key**, and set a **Passphrase** (Settings → Integration) —
   without a passphrase, signature verification will fail.
3. Set `PAYFAST_MERCHANT_ID`, `PAYFAST_MERCHANT_KEY`, and
   `PAYFAST_PASSPHRASE` on your backend host to those values, with
   `PAYFAST_MODE=sandbox`.
4. Test with PayFast's published sandbox test card numbers (available on
   their sandbox docs) — no real money moves in sandbox mode.
5. When ready to accept real payments: register a live PayFast merchant
   account, generate live Merchant ID/Key/Passphrase, and change
   `PAYFAST_MODE=live` plus the three credential variables to the live
   ones.

Until these are set, the "Pay Now with PayFast" button on the order
confirmation screen shows a friendly "not set up yet" message instead of
breaking — customers can still be told to arrange payment manually via
the order's contact details in the meantime.

## 4. Verify

- Visit your Netlify URL — the homepage should load.
- Go to `/order` and confirm the catalog (sizes/flavors/etc.) loads —
  this proves the frontend can reach the backend and CORS is correct.
- Log in at `/admin/login` with the `ADMIN_EMAIL`/`ADMIN_PASSWORD` you
  set, and confirm the dashboard loads real data.
- Place a test order and check the backend logs for the confirmation
  email (or your inbox, if SMTP is configured).

## Local development after this change

The Prisma schema now targets PostgreSQL only (SQLite doesn't support
this app's `Decimal` money fields or `Time` columns properly). For local
dev, either:

- Point your local `.env` `DATABASE_URL` at the same free Neon/Supabase
  database you set up above, or
- Create a second free Neon/Supabase project just for local dev, so you
  don't touch production data while testing.

Then:
```bash
cd server
npx prisma migrate deploy   # first time only, creates the tables
npm run db:seed
npm run dev
```
