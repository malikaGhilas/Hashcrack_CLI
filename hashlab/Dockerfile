# ------------------------------
# 1) Base image
# ------------------------------
FROM python:3.12-slim

WORKDIR /app

# ------------------------------
# 2) Install system deps
# ------------------------------
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# ------------------------------
# 3) Copy requirements
# ------------------------------
COPY backend/requirements.txt /app/backend/requirements.txt

RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# ------------------------------
# 4) Copy all project files
# ------------------------------
COPY . .

# ------------------------------
# 5) Expose Flask port
# ------------------------------
EXPOSE 5000

# ------------------------------
# 6) Default command (for web service)
# ------------------------------
CMD ["python", "backend/wsgi.py"]
