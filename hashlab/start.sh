#!/bin/bash

echo "🚀 Starting HashLab..."

cd "$(dirname "$0")"

source venv/bin/activate

echo "➡️ Starting Redis..."
brew services start redis

echo "➡️ Starting backend..."
python -m backend.wsgi &
BACK_PID=$!

echo "➡️ Starting Celery worker..."
celery -A backend.celery_app.celery worker --loglevel=info &
CELERY_PID=$!

echo "➡️ Starting frontend..."
cd frontend/hashlab-ui
npm run dev &
FRONT_PID=$!

cd ../..

echo "✅ All services started!"
echo "Backend PID: $BACK_PID"
echo "Celery PID: $CELERY_PID"
echo "Frontend PID: $FRONT_PID"
