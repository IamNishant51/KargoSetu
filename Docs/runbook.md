# Operational Runbook

## Overview
This runbook covers operational procedures, monitoring, and troubleshooting for the KargoSetu platform in production.

## Monitoring & Health
- **Health Endpoint**: `/api/health/`
  - Monitors PostgreSQL connectivity and ML model readiness.
  - Returns `status: ok` when fully operational.
- **Readiness Endpoint**: `/api/health/ready`
  - Used for container orchestration to route traffic only when the service is fully ready.

## Common Issues & Resolutions

### 1. Database Connectivity Failure
- **Symptom**: `/api/health/` returns `database: disconnected`.
- **Action**: Check if the database host is reachable. Verify `DATABASE_URL` secret on Hugging Face Spaces.

### 2. ML Model Warming Up
- **Symptom**: High latency on first requests, or `/api/health/ready` returning 503.
- **Action**: This is expected during cold starts. The container handles health checks gracefully. To mitigate, keep the Hugging Face Space active or upgrade to a persistent tier.

### 3. Missing Live Vessel/Hazard Data
- **Symptom**: Globe displays demo data.
- **Action**: Verify API keys (`AISSTREAM_API_KEY`, etc.) in the environment. The system gracefully falls back to synthetic data when keys are missing or limits are exceeded.

## Incident Response
- **Secret Compromise**: Immediately rotate `JWT_SECRET_KEY` and database passwords. Update the secrets on Hugging Face Spaces and restart the Space.
- **Frontend Outage**: Check Vercel deployment logs and rollback to a previous working deployment if necessary.
- **Backend Outage**: Check Hugging Face Spaces build and container logs. Restart the Space from the UI if the container is stuck.
