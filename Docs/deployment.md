# Deployment Guide

## Overview
This document outlines the deployment strategy for KargoSetu, targeting a hybrid deployment model utilizing Vercel for the frontend and Hugging Face Spaces for the backend.

## Architecture
- **Frontend**: Next.js deployed on Vercel.
- **Backend**: FastAPI with PostgreSQL deployed via Docker on Hugging Face Spaces.
- **Database**: PostgreSQL (managed service recommended for production, e.g., Supabase or Neon).

## Frontend Deployment (Vercel)
1. Push the repository to GitHub.
2. Link the repository to a new Vercel project.
3. Configure Environment Variables in the Vercel dashboard:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend-space.hf.space`
4. Deploy. Vercel's `vercel.json` will automatically configure static caching headers and rewrite `/api/*` to the backend.

## Backend Deployment (Hugging Face Spaces)
1. Set the following environment variables on your local machine:
   - `HF_TOKEN`: Your Hugging Face write token.
   - `DATABASE_URL`: Production database connection string.
   - `JWT_SECRET_KEY`: Secure secret key for authentication.
   - `FRONTEND_URL`: `https://your-frontend-project.vercel.app`
2. Run the deployment script:
   ```bash
   python deploy_hf.py
   ```
3. The script will create a Hugging Face Space using the Docker `space_sdk` and upload the backend code along with the secrets.

## Database Migrations
The `Dockerfile` is configured to run `prisma db push --accept-data-loss` upon container startup to ensure the schema is in sync with the database.

## Post-Deployment Smoke Test
Run the smoke test to verify all subsystems:
```bash
python deploy_smoke_test.py
```
This ensures:
- Frontend and backend reachability.
- Database and model readiness.
- Fallback data (demo mode) is functional when live feeds are unavailable.
