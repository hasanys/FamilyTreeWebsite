# Family Tree Starter (Next.js + Prisma + Supabase + React Flow)

## Quick start
1) Unzip this project and `cd` into it.
2) Copy `.env.example` to `.env` and fill in your Supabase values.
3) Install deps: `pnpm install` (or `npm i`).
4) Run migrations: `npx prisma migrate dev --name init`.
5) Seed (optional): `pnpm seed`.
6) Start dev: `pnpm dev` → open http://localhost:3000

If you hit SSL/connection issues, ensure your DATABASE_URL ends with `?sslmode=require`.
