#!/bin/bash

echo "🛑 Stopping HashLab..."

pkill -f "python -m backend.wsgi"
pkill -f "celery"
pkill -f "vite"
brew services stop redis

echo "✅ HashLab stopped!"
