# AOneLazer Finance

## Overview

Premium Indian finance dashboard for managing expenses, investments, and budgets.
pnpm workspace monorepo using TypeScript. Currency: INR (₹), locale: en-IN.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui + Recharts
- **SEO**: react-helmet-async
- **Blog content**: react-markdown + remark-gfm

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (port 8080)
│   └── aonelazer/          # React + Vite frontend (port via $PORT)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   └── db/                 # Drizzle schema + DB client
```

## Key Features

- **Auth**: Register/login with session (express-session). `session.userId` + `session.isAdmin` set on login. Admin role check via `session.isAdmin`. Admin credentials: `admin` / `Admin@123`.
- **Per-user data isolation**: All data tables (expenses, investments, budgets, transactions) have `userId` FK, all API routes filter by session userId via `requireAuth` middleware.
- **Currency system**: `CurrencyContext.tsx` with 25 currencies (INR base). Exchange rates applied on display. `formatAmount()` hook used throughout all pages. Selection persisted in localStorage.
- **SEO system**: `SEO.tsx` component with full meta tags (title, description, keywords, canonical, OG, Twitter Card, JSON-LD). Used on landing, blog, and all blog post pages. Named + default export both available.
- **Blog system**: `blog_posts` DB table with slug, content, SEO fields, publish/draft workflow. Admin-only CRUD via `requireAdmin` middleware (`session.isAdmin`). Public blog list + individual post pages. Admin panel with markdown editor + SEO preview.
- **Theme**: dark/light/system via `ThemeContext`. Persisted to localStorage.
- **Responsive layout**: Desktop sidebar with currency picker + theme toggle. Mobile drawer sidebar + bottom tab bar. Currency picker available in both mobile header and desktop sidebar.

## API Routes

- `POST /api/auth/register` — register user (sets `session.userId`, `session.isAdmin`)
- `POST /api/auth/login` — login (sets `session.userId`, `session.isAdmin`)
- `POST /api/auth/logout` — clear session
- `GET /api/auth/me` — get current user
- `GET/POST /api/expenses` — expense CRUD (auth required)
- `GET/POST /api/investments` — investment CRUD (auth required)
- `GET/POST /api/budgets` — budget CRUD (auth required)
- `GET /api/transactions` — transactions list (auth required)
- `GET /api/dashboard/summary` — dashboard metrics (auth required)
- `GET /api/analytics/*` — analytics endpoints (auth required)
- `GET /api/blog/posts` — public blog list (published only)
- `GET /api/blog/posts/:slug` — public blog post
- `POST /api/blog/posts` — create post (admin only)
- `PUT /api/blog/posts/:id` — update post (admin only)
- `DELETE /api/blog/posts/:id` — delete post (admin only)

## Frontend Routes

- `/` — Landing page (public, SEO'd)
- `/login` — Login (public only, redirects to /dashboard if authed)
- `/register` — Register (public only)
- `/blog` — Blog list with search + tag filter (public)
- `/blog/:slug` — Blog post (public, SEO + JSON-LD)
- `/dashboard` — Overview dashboard (auth required)
- `/expenses` — Expense tracker (auth required)
- `/investments` — Investment portfolio (auth required)
- `/budgets` — Budget tracker (auth required)
- `/transactions` — Transaction history (auth required)
- `/analytics` — Analytics & charts (auth required)
- `/account` — Account settings (auth required)
- `/admin/blog` — Blog management panel (auth required, admin UI)

## DB Tables

- `users` — id, username, email, password (sha256+salt), name, mobile, role, isActive
- `expenses` — id, userId, title, amount (INR), category, date, notes
- `investments` — id, userId, name, type (11 types), buyPrice, currentPrice, quantity, date
- `budgets` — id, userId, category, limit (INR), period
- `transactions` — id, userId, title, amount, type (income/expense/transfer), category, date
- `blog_posts` — id, slug, title, content (markdown), excerpt, metaTitle, metaDescription, canonicalUrl, ogImage, tags, published, authorId

## Important Notes

- All amounts stored as INR in DB; `CurrencyContext` converts on display
- Investment types: Stocks, Mutual Funds, ETF, Gold, Fixed Deposit, PPF, NPS, Crypto, Bonds, Real Estate, Other
- Do NOT use emojis in app UI (flags in CurrencyContext are for the currency picker only)
- `useGetMe` uses `{ query: { retry: false } }` to avoid looping on 401
- Monthly income not tracked (shown as 0); savings rate = 0
