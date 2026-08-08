# Baxi Brothers — Local Setup

This project contains the Baxi Brothers storefront, its API server, database schema, and generated API client, managed as a pnpm workspace.

Nothing in the frontend or backend source code has been changed. The only additions are root-level scripts that start both servers together and load your environment variables from one `.env` file, so you can run everything with a single `npm run dev`.

## Requirements

- Node.js 20 or newer
- pnpm (used to install packages — required because this repo uses pnpm workspace features that plain `npm install` can't resolve)
- PostgreSQL (either installed locally, or run via the included Docker Compose file)
- A free Clerk development application (for login/signup)

Install pnpm once:

```bash
npm install --global pnpm
```

## 1. Install packages

From the project root:

```bash
pnpm install
```

(This is the one step that must use `pnpm` — everything after this can be run with `npm run ...` or `pnpm run ...`, both work.)

## 2. Set up your database

**Option A — Docker (easiest):**

```bash
docker compose up -d
```

This starts a local Postgres on port `5432` with database `baxi_brothers`, user `postgres`, password `postgres`.

**Option B — Local PostgreSQL install:**

Create a database named `baxi_brothers` yourself. Your connection string will look like:

```text
postgresql://postgres:YOUR_PASSWORD@localhost:5432/baxi_brothers
```

## 3. Create Clerk development keys

Create a development application at https://clerk.com and copy its:

- Publishable key (`pk_test_...`)
- Secret key (`sk_test_...`)

Never commit the secret key or upload it publicly.

## 4. Configure environment variables

Copy the example file:

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/baxi_brothers
CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
CLERK_SECRET_KEY=sk_test_your_secret_key
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
```

(If you used Docker Compose from step 2, the `DATABASE_URL` above already matches it.)

## 5. Push the database schema

```bash
npm run db:push
```

## 6. Start both the API and the website

```bash
npm run dev
```

This runs the API server (port `8080`) and the Vite website (port `5173`) together in one terminal, using the values from your `.env` file. Press `Ctrl+C` to stop both.

Open the website at:

http://localhost:5173

The website is configured to forward `/api` requests to the local API at port `8080`.

### Running them separately (optional)

If you'd rather run each in its own terminal:

```bash
npm run dev:api   # API server on port 8080
npm run dev:web   # Website on port 5173
```

## Useful pages

- Storefront: http://localhost:5173
- Sign in: http://localhost:5173/sign-in
- Sign up: http://localhost:5173/sign-up
- My account: http://localhost:5173/account
- Admin dashboard: http://localhost:5173/admin
- Admin products: http://localhost:5173/admin/products
- Admin orders: http://localhost:5173/admin/orders

## Add local test data

The hosted database is not included in this download. Your local database starts empty, so add local categories and products from:

- http://localhost:5173/admin/categories
- http://localhost:5173/admin/products

You can then test multiple product images, account creation, checkout, order history, and admin order status updates.

## Troubleshooting

- `Use pnpm instead`: this appears only if you try to run `npm install` directly — use `pnpm install` for that one step instead.
- `DATABASE_URL must be set` / `must be provisioned`: make sure `.env` exists (copied from `.env.example`) and has a valid `DATABASE_URL`.
- Can't connect to Postgres: confirm Postgres is running (`docker compose up -d` or your local install) and the port/password match `DATABASE_URL`.
- The website shows no products: add categories and products to your local database via the admin pages above.
- Login does not load: confirm `VITE_CLERK_PUBLISHABLE_KEY` (frontend) and both `CLERK_PUBLISHABLE_KEY`/`CLERK_SECRET_KEY` (backend) are set correctly in `.env`.
- Port already in use: something else is using `8080` or `5173` — stop it, or edit the `PORT` values in the root `package.json`'s `dev:api`/`dev:web` scripts.
