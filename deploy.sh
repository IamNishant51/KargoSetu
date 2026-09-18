#!/usr/bin/env bash
set -e

MODE=${1:-"local"}

if [ "$MODE" = "prod" ]; then
    echo "Deploying to production..."
    python deploy_hf.py
    echo "Backend deployed to HF Spaces. Frontend is deployed via Vercel GitHub integration."
else
    echo "Deploying locally..."
    docker-compose up -d --build
    echo "Local stack started. Waiting for services to become healthy..."
    sleep 5
    docker-compose ps
fi
