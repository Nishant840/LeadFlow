# ── Backend Dockerfile ──────────────────────────────────────────────────────
FROM python:3.12-slim

# System deps (psycopg2-binary needs libpq, but binary wheel avoids it)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies first (layer-cache friendly)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
# The package is imported as `backend.*`, so we copy the whole backend dir
# into /app/backend so that `from backend.database import ...` works.
COPY . ./backend/

# Expose the API port
EXPOSE 8000

# Use a shell-form CMD so we can do a health-check wait inline if needed.
# The DATABASE_URL is injected at runtime via docker-compose.
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
