# === Stage 1: Builder ===
FROM python:3.11-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential python3-dev gcc libssl-dev curl \
    && rm -rf /var/lib/apt/lists/*

# Create virtualenv
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Generate Prisma Client
COPY prisma ./prisma
RUN prisma generate

# === Stage 2: Runtime ===
FROM python:3.11-slim

# Install minimal runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser -d /app appuser

WORKDIR /app

# Copy virtualenv and Prisma cache from builder
COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /root/.cache/prisma-python /root/.cache/prisma-python
ENV PATH="/opt/venv/bin:$PATH"

# Copy application code
COPY . .

# Create models directory for ONNX export
RUN mkdir -p /app/models && chown -R appuser:appuser /app

USER appuser

EXPOSE 7860

# Health check for Docker/Kubernetes orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
    CMD curl -f http://localhost:7860/api/health/ || exit 1

# Use 8 workers (optimized for 24GB ARM Ampere A1, 4 OCPUs)
# 24GB RAM easily supports 8 workers even with ML models loaded.
CMD ["sh", "-c", "prisma db push --accept-data-loss && gunicorn app.main:app -w 8 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:7860 --timeout 120 --graceful-timeout 30 --max-requests 1000 --max-requests-jitter 50"]
