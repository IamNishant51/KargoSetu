# KargoSetu — Agent Instructions

## Deployment map (canonical)

| Layer    | Host                              | Identifier / URL                                                                 |
|----------|-----------------------------------|----------------------------------------------------------------------------------|
| Frontend | Vercel (Next.js 15)               | `https://kargosetu.vercel.app`                                                   |
| Backend  | Hugging Face Spaces (Gradio SDK, ZeroGPU) | Space `Nishant51/kargosetu_api` → `https://nishant51-kargosetu-api.hf.space` (underscore in ID becomes hyphen in URL) |
| Database | Supabase Postgres                 | Project ref `zbkngqoznqbduocpopzk` → `https://zbkngqoznqbduocpopzk.supabase.co`   |

Do NOT use Neon for this project (a Neon project/link exists locally from an
abandoned experiment — ignore `.neon`, root `.env.local` Neon vars).

## Backend (FastAPI on HF Spaces)

- Entry point is `backend/app.py`: a Gradio wrapper that mounts the FastAPI
  app (`gr.mount_gradio_app`). The Space MUST use the **Gradio SDK**
  (a Docker-SDK Space will not serve this correctly).
- App port `7860`. Routers live in `backend/app/api/routers/`, health at
  `/api/health/` (trailing slash).
- To redeploy: push to `main` — `.github/workflows/hf-sync.yml` uploads
  `backend/` automatically (code only; secrets and Space README untouched).
  It needs the repo secret `HF_TOKEN` (write token). Manual equivalent:
  `HF_TOKEN=<token> python deploy_hf.py` from the repo root.
  If the build needs system packages, add a root `packages.txt` with
  `build-essential`.
- Anti-sleep: `.github/workflows/keepalive.yml` pings `/api/health/` every
  10 min. It needs the repo Actions variable `BACKEND_URL` set to the Space
  URL (no trailing slash). Run the workflow once manually after any change.
- Frontend talks to the backend only via relative `/api/*`, proxied by
  `frontend/next.config.ts` rewrites from `NEXT_PUBLIC_API_URL`.

## Database (Supabase Postgres)

- Prisma schema: `backend/prisma/schema.prisma` (provider `postgresql`).
- Two URLs, same split Prisma expects:
  - `DATABASE_URL` → Supabase **pooled** connection (port `6543`, Transaction
    mode) for runtime queries.
  - `DIRECT_URL` → Supabase **direct** connection (port `5432`) for
    `prisma db push` / migrations.
  - Get both from Supabase Dashboard → Project Settings → Database →
    Connection string. Never paste them anywhere except the secret stores
    below.
- Seed data: `backend/scripts/seed.py` (15 ports, 5 vessel classes,
  500 requisitions). Tables: `Port, Vessel, Requisition, MLModel,
  UserSetting, User`.
- RLS caution: Prisma connects with full privileges. Do NOT expose these
  tables via the Supabase Data API to `anon`/`authenticated` without RLS
  policies; the app authorizes in FastAPI, not in Postgres.

## Environment variables (names only — values live in secret stores)

Backend (`backend/.env` locally; HF Space → Settings → Secrets in prod):

| Name                    | Required | Notes                                              |
|-------------------------|----------|----------------------------------------------------|
| `DATABASE_URL`          | yes      | Supabase pooled URL                                |
| `DIRECT_URL`            | yes      | Supabase direct URL                                |
| `JWT_SECRET_KEY`        | yes      | ≥32 chars: `python -c "import secrets; print(secrets.token_hex(32))"`. Same value on every backend copy or tokens break |
| `FRONTEND_URL`          | yes      | Exact Vercel origin (`https://kargosetu.vercel.app`), no trailing slash — CORS enforced |
| `GOOGLE_CLIENT_ID`      | yes      | Same Google OAuth client ID as the frontend        |
| `AISSTREAM_API_KEY`     | no       | Empty = demo vessel mode                           |
| `FIRMS_MAP_KEY`         | no       | Empty = degraded fire layer                        |
| `MARINETRAFFIC_API_KEY` | no       | Empty = disabled (commercial, opt-in)              |
| `*_DAILY_BUDGET`        | no       | Upstream safety ceilings, have defaults            |

Frontend (`.env.local` locally; Vercel → Project Settings → Environment
Variables in prod):

| Name                          | Notes                                                        |
|-------------------------------|--------------------------------------------------------------|
| `NEXT_PUBLIC_API_URL`         | Backend origin (Space URL). Decides where `/api/*` proxies to |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID`| Same Google OAuth client ID as the backend                   |

## Secrets discipline (hard rules)

1. All values come from `.env` files / host secret stores. Code reads them
   via `app/core/config.py` (pydantic-settings) and `process.env` — never
   hardcode a value.
2. Never write a secret VALUE into docs, chat, commits, Space READMEs, or
   `*.example` files. This file lists names only, deliberately.
3. Ignored by git (must stay that way): `backend/.env`, `frontend/.env.local`,
   root `.env.local`, `.neon/`. Verify with `git check-ignore <path>` before
   every commit, and `git status --short` must show no secret files staged.
4. Never put `service_role`/secret keys in frontend code or `NEXT_PUBLIC_*`
   vars (they ship to the browser).

## Verification before push

- Backend: `python -m ruff check app/ tests/` and `python -m pytest tests/ -q`
  from `backend/` (suite degrades without a live DB; `client`-fixture tests
  wait out a 15 s DB-connect cap per test — slow is normal).
- Frontend: `npx tsc --noEmit`, `npx eslint .` from `frontend/`.
- Pre-commit hook shells via `make` (missing on Windows) — if it blocks a
  commit, run the checks above by hand and use `--no-verify`, saying so.

## Agent tooling in this repo

- Supabase MCP: `~/.config/opencode/opencode.json` → `mcp.supabase`
  (project-scoped URL). First use needs `opencode mcp auth supabase`
  (browser OAuth). Docs lookup: MCP `search_docs`, or append `.md` to any
  `supabase.com/docs` URL.
- Skills: `.agents/skills/supabase/` (always follow its security checklist
  for auth/RLS/views/functions/storage) and
  `.agents/skills/supabase-postgres-best-practices/`.
- Schema changes: run SQL via MCP `execute_sql` to iterate, then commit via
  `supabase db pull <name>`; run advisors (`get_advisors`) and re-verify.
