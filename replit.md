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

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (port 8080)
│   └── aonelazer/          # React + Vite frontend (port via $PORT)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
└── scripts/                # Utility scripts
```

## Features

- **Auth**: Session-based login/logout (express-session + connect-pg-simple)
  - Admin user: username `admin`, password `Admin@123`
  - SHA-256 hashing with salt `aonelazer_salt_2026`
- **Theme**: Dark / Light / System toggle (ThemeContext)
- **Dashboard**: Summary cards, spending trend chart, category breakdown, recent transactions, portfolio
- **Expenses**: CRUD with category, tags, date; INR formatting
- **Investments**: CRUD with types: Stock, Mutual Fund, ETF, Crypto, Bond, Real Estate, Gold, Fixed Deposit, PPF, NPS, Other
- **Budgets**: Monthly budget tracking by category; progress bars with color warnings (green/amber/red)
- **Transactions**: Combined view of expenses + investments
- **Analytics**: Net Worth Trend, Monthly Summary, Top Expense Categories charts
- **Account**: Update profile, change username, change password

## Key Files

- `artifacts/aonelazer/src/App.tsx` — Router + AuthProvider + ThemeProvider
- `artifacts/aonelazer/src/contexts/AuthContext.tsx` — Auth state management
- `artifacts/aonelazer/src/contexts/ThemeContext.tsx` — Theme state management
- `artifacts/aonelazer/src/lib/format.ts` — `formatINR`, `formatCurrency`, `formatDate`
- `artifacts/aonelazer/src/index.css` — CSS variables for light/dark themes
- `artifacts/api-server/src/app.ts` — Express + session middleware
- `artifacts/api-server/src/routes/auth.ts` — Login, logout, /me endpoints
- `artifacts/api-server/src/routes/analytics.ts` — Monthly summary, top expenses, net worth trend
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for codegen)
- `lib/db/src/schema/` — Drizzle schema (users, expenses, investments, budgets, transactions)

## Development

```bash
# Run codegen after updating openapi.yaml
pnpm --filter @workspace/api-spec run codegen

# Push DB schema changes
pnpm --filter @workspace/db run db:push

# Seed sample data
pnpm --filter @workspace/db run db:seed
```

## Monthly Income

₹85,000 (used for dashboard calculations and budget savings rate)
