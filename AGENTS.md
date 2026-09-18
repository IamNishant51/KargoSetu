# AI Agent Guidelines (KargoSetu)

When working on this repository, all AI agents MUST adhere to the following rules to prevent CI/CD failures and production bugs.

## 1. Frontend (Next.js 16+ Canary)
* **`proxy.ts` vs `middleware.ts`**: The frontend is running Next.js 16.3.4 (Turbopack). The traditional `middleware.ts` file convention is **deprecated**. You must use `src/proxy.ts` and the exported function must be named `proxy` (e.g., `export function proxy(request: NextRequest)`). Reverting this to `middleware.ts` will break the Vercel build.
* **Google Authentication (COOP Header)**: If modifying `next.config.ts` headers, ensure the `Cross-Origin-Opener-Policy` is set to `unsafe-none`. Setting it to `same-origin-allow-popups` or `same-origin` will block `window.postMessage`, completely breaking the Google Sign-In popup flow.
* **Proxy Rewrites (Trailing Slashes)**: When configuring API rewrites to Hugging Face Spaces in `next.config.ts`, strictly ensure the base `NEXT_PUBLIC_API_URL` has trailing slashes stripped (e.g., `apiUrl = apiUrl.replace(/\/$/, "")`). Failure to do so will result in double-slash paths (like `//api/...`) and cause 404 Not Found errors on production.

## 2. Backend (FastAPI + Python)
* **Strict Ruff Linting (CI Requirement)**: The backend GitHub Actions CI pipeline enforces strict `ruff` linting (`ruff check app/ tests/`). 
  * Avoid `SIM102` (use combined `and` statements instead of nested `if` statements).
  * Avoid `E402` (all module-level imports must be at the very top of the file).
  * Use `datetime.UTC` instead of `timezone.utc` (`UP017`).
  * ALWAYS run `python -m ruff check app/ tests/` and resolve any errors before committing.
* **Requirements.txt Encoding**: Never use PowerShell commands like `Out-File` or `>` to write to `requirements.txt` as they may inject UTF-16LE null bytes (`\x00`). `pip` will instantly crash in the CI pipeline with `Invalid requirement`. Always read and write in pure UTF-8.
* **Pydantic Settings Strictness**: The backend config relies on `pydantic-settings`. Do not inject arbitrary extra environment variables into `.env` without declaring them in `app.core.config.Settings`, unless `extra="ignore"` is strictly configured in the model config, as it will cause a `ValidationError` on server boot.
* **Test Deadlocks (Pytest & Prisma)**: The FastAPI `lifespan` context connects to Prisma on startup. When writing Pytest fixtures to mock the DB, you must explicitly mock the import reference inside `app.main` (e.g., `patch("app.main.prisma")`) in addition to the dependency router, otherwise the test suite will hang indefinitely attempting to connect to a real PostgreSQL instance.

Always double-check these rules before executing a `git push` to `main`.
