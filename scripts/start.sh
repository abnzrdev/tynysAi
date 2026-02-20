#!/bin/bash

set -e

ENV_FILE="../.env.local"
ROOT_DIR="$(dirname "$0")/.."

echo "🚀 Tynys AI — Dev Startup"
echo "─────────────────────────────────"

# ── 1. Check .env.local exists ──────────────────────────────
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ .env.local not found in project root."
  exit 1
fi
echo "✅ .env.local found"

# ── 2. Check required env vars ──────────────────────────────
if ! grep -q "NEXTAUTH_SECRET=." "$ENV_FILE"; then
  echo "❌ NEXTAUTH_SECRET is missing or empty in .env.local"
  echo "   Run: openssl rand -base64 32"
  exit 1
fi

if ! grep -q "DB_URL=." "$ENV_FILE"; then
  echo "❌ DB_URL is missing or empty in .env.local"
  exit 1
fi

if ! grep -q "NEXTAUTH_URL=." "$ENV_FILE"; then
  echo "❌ NEXTAUTH_URL is missing or empty in .env.local"
  exit 1
fi
echo "✅ Env vars OK"

# ── 3. Move to project root ──────────────────────────────────
cd "$ROOT_DIR"

# ── 4. Check Docker is running ──────────────────────────────
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker first."
  exit 1
fi
echo "✅ Docker is running"

# ── 5. Ask run mode ──────────────────────────────────────────
echo ""
echo "How do you want to run the app?"
echo "  1) DB in Docker + npm run dev  (recommended for development)"
echo "  2) Full Docker                 (production-like)"
echo ""
read -p "Enter choice [1/2]: " MODE

# ── 6. Free port 3000 if occupied ───────────────────────────
echo ""
echo "🔍 Checking port 3000..."
PORT_PID=$(lsof -ti :3000 2>/dev/null || true)
if [ -n "$PORT_PID" ]; then
  echo "⚠️  Port 3000 is in use by PID $PORT_PID — killing it..."
  kill -9 $PORT_PID
  sleep 1
  echo "✅ Port 3000 is now free"
else
  echo "✅ Port 3000 is free"
fi

# ── 7. Run based on choice ───────────────────────────────────
if [ "$MODE" = "1" ]; then

  # ── Mode 1: DB only in Docker + npm run dev ───────────────
  echo ""
  echo "📦 Starting Postgres in Docker..."
  docker compose up -d postgres

  echo "⏳ Waiting for Postgres to be ready..."
  until docker compose exec postgres pg_isready -U admin -d tynysdb > /dev/null 2>&1; do
    sleep 1
  done
  echo "✅ Postgres is ready"

  # Install deps if missing
  if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
  fi
  echo "✅ Dependencies OK"

  # Push schema
  echo "🗄️  Pushing DB schema..."
  npx drizzle-kit push
  echo "✅ Database ready"

  echo ""
  echo "✅ All good! Starting dev server..."
  echo "🌐 Open http://localhost:3000"
  echo ""
  npm run dev

elif [ "$MODE" = "2" ]; then

  # ── Mode 2: Full Docker stack ─────────────────────────────
  echo ""
  echo "🐳 Starting full Docker stack..."
  docker compose up -d --build

  echo "⏳ Waiting for Postgres to be ready..."
  until docker compose exec postgres pg_isready -U admin -d tynysdb > /dev/null 2>&1; do
    sleep 1
  done
  echo "✅ Postgres is ready"

  echo "⏳ Waiting for app container to start..."
  sleep 5

  echo ""
  echo "✅ All good! App is running in Docker."
  echo "🌐 Open http://localhost:3000"
  echo ""
  echo "📋 Useful commands:"
  echo "   docker compose logs -f app      # watch app logs"
  echo "   docker compose logs -f postgres # watch DB logs"
  echo "   docker compose down             # stop everything"

else
  echo "❌ Invalid choice. Run the script again and enter 1 or 2."
  exit 1
fi
