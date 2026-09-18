# KargoSetu — Agent Instructions

## Deployment map (canonical)

| Layer    | Host                              | Identifier / URL                                                                 |
|----------|-----------------------------------|----------------------------------------------------------------------------------|
| Frontend | Vercel (Next.js 15)               | `https://kargosetu.vercel.app`                                                   |
| Backend  | Render (Docker, free tier)        | Service `kargosetu-api-render` → `https://kargosetu-api-render.onrender.com`     |
| Database | Supabase Postgres                 | Project ref `zbkngqoznqbduocpopzk` → `https://zbkngqoznqbduocpopzk.supabase.co`   |

Do NOT use Neon for this project (a Neon project/link exists locally from an
abandoned experiment — ignore `.neon`, root `.env.local` Neon vars).
Do NOT use Hugging Face Spaces for the backend either (new Gradio/Docker
Spaces require PRO; ZeroGPU hardware rejects CPU-only apps) — `deploy_hf.py`
and `hf-sync.yml` are kept only as dormant references.

## Backend (FastAPI slim image on Render)

- Runtime is `backend/Dockerfile.light` (Blueprint: root `render.yaml`):
  no TF/training (`SKIP_ML_TRAINING=1`, `ML_ENABLE_RETRAINING=0`), single
  uvicorn worker on `$PORT`, `libatomic1` installed (Prisma's bundled node
  needs it), Prisma engines pre-generated at build and reused from
  `/app/.cache`.
- Routers live in `backend/app/api/routers/`, health at `/api/health/`
  (trailing slash), plus ultra-light `/api/health/ping` (no DB/ML).
- To redeploy: push to `main` (Blueprint `autoDeploy`). Env comes from the
  Render dashboard service settings.
- HARD RULE — never run migrations at container boot: Supabase direct
  (`db.*.supabase.co:5432`) is unreachable from Render egress (P1001), and a
  `prisma db push && uvicorn` chain kills the boot before any port binds.
  Schema changes run out-of-band (local/CI with `DIRECT_URL`).
- HARD RULE — Prisma engine paths are **baked in at `generate` time**: the
  generated client hardcodes the engine binary paths resolved during
  `prisma generate`, and no runtime env var can redirect them afterwards.
  Therefore the builder MUST generate with the final runtime location:
  `HOME=/app`, `PRISMA_HOME_DIR=/app`,
  `PRISMA_NODEENV_CACHE_DIR=/app/.cache/prisma-python/nodeenv`,
  `PRISMA_BINARY_CACHE_DIR=/app/.cache/prisma-python/binaries/<cli>/<hash>`
  set before `RUN prisma generate`, cache copied to `/app/.cache` and
  chowned to `appuser`. Symptoms of getting this wrong:
  `Permission denied: '/root/.cache/prisma-python/binaries/.../query-engine...'`
  (Docker does NOT update `$HOME` on `USER`, and Prisma ignores
  `XDG_CACHE_HOME`). Update the hash in `PRISMA_BINARY_CACHE_DIR` whenever
  the `prisma` package version changes (match `prisma --version` output).
- `libatomic1` MUST be in the runtime image: Prisma's bundled node binary
  links `libatomic.so.1`, which `python:3.11-slim` lacks (boot dies with
  `error while loading shared libraries` otherwise).
- When a deploy fails, read Render → Logs for `database_*` events first:
  `EACCES /root/.cache` = engine-path mismatch (see above);
  `P1001` at boot = something is migrating/connecting via direct URL;
  persistent `disconnected` with good URL = check `pgbouncer=true`.
- `main.py` lifespan: DB connect is capped at 15 s (degraded, never fatal)
  plus a 60 s `_db_watchdog` that reconnects in background (Supabase
  idle-pause / slow cold starts). Skipped under pytest.
- Anti-sleep (three layers): (1) `.github/workflows/render-keepalive.yml`
  pings `/api/health/ping` every 10 min — needs repo Actions variable
  `RENDER_BACKEND_URL` (no trailing slash), run once manually after setup;
  (2) frontend polls `/api/health` every 60 s while open (`useFeeds.ts`);
  (3) DB watchdog above. The old HF `keepalive.yml`/`BACKEND_URL` pair is
  dormant.
- Frontend talks to the backend only via relative `/api/*`, proxied by
  `frontend/next.config.ts` rewrites from `NEXT_PUBLIC_API_URL`.

## Database (Supabase Postgres)

- Prisma schema: `backend/prisma/schema.prisma` (provider `postgresql`).
- Two URLs, same split Prisma expects:
  - `DATABASE_URL` → Supabase **pooled** connection (port `6543`, Transaction
    mode) for runtime queries. MUST include `pgbouncer=true`
    (`...?sslmode=require&pgbouncer=true`) or queries through the pooler
    fail and health reports `disconnected`.
  - `DIRECT_URL` → Supabase **direct** connection (port `5432`) for
    `prisma db push` / migrations — local/CI only, never from Render.
  - Special chars in the DB password must be URL-encoded (`@` → `%40`).
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

Backend (`backend/.env` locally; Render service → Environment in prod):

| Name                    | Required | Notes                                              |
|-------------------------|----------|----------------------------------------------------|
| `DATABASE_URL`          | yes      | Supabase pooled URL **with `pgbouncer=true`**      |
| `DIRECT_URL`            | yes      | Supabase direct URL (migrations only)              |
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
| `NEXT_PUBLIC_API_URL`         | Backend origin (Render URL). Decides where `/api/*` proxies to |
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
