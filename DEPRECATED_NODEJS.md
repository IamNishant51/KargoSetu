# Deprecated Node.js Backend (Frozen Legacy)

The active KargoSetu backend is **Python/FastAPI** in `backend/app/` (see
`MIGRATION_PLAN.md`). It serves every live endpoint: requisitions, forecast,
market, vessels, hazards, ports, auth, settings and notifications.

The Node.js/Express tree in this repository is **frozen legacy** and is not
executed, deployed, imported or tested anywhere:

- `backend/index.js`
- `backend/routes/`
- `backend/services/*.js`
- `backend/middleware/`
- `backend/models/`

Rules:

1. Do not modify, extend or import these files. They exist only as migration
   reference so the Python port can be audited against the original logic.
2. Do not point any frontend, proxy, rewrite or deployment at them. The only
   live API base is `NEXT_PUBLIC_API_URL` (FastAPI, port 8000 locally).
3. Node.js remains in the project solely as frontend tooling (Next.js 16,
   Tailwind, Cesium asset copy). It is not a backend runtime.
4. If an AI assistant or audit claims "the backend runs on Node/Express",
   point it at this file: the claim is stale. Verify with
   `backend/app/main.py` (FastAPI lifespan and router registration).
