#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/../.env.local"
ROOT_DIR="${SCRIPT_DIR}/.."

find_free_port() {
  local start_port="$1"
  local max_tries=50
  local candidate="$start_port"
  local i

  is_port_busy() {
    local port="$1"

    if command -v ss >/dev/null 2>&1; then
      if ss -H -ltn "( sport = :${port} )" | grep -q .; then
        return 0
      fi
    fi

    if lsof -iTCP:"${port}" -sTCP:LISTEN -t >/dev/null 2>&1; then
      return 0
    fi

    return 1
  }

  for ((i = 0; i < max_tries; i++)); do
    if ! is_port_busy "$candidate"; then
      echo "$candidate"
      return 0
    fi
    candidate=$((candidate + 1))
  done

  return 1
}

kill_existing_app_processes() {
  local pids=()
  local pid

  # Collect listeners on common app dev ports.
  while IFS= read -r pid; do
    [ -n "$pid" ] && pids+=("$pid")
  done < <(ss -ltnp 2>/dev/null | awk '/:30[0-9][0-9]/ { if (match($0, /pid=[0-9]+/)) { print substr($0, RSTART + 4, RLENGTH - 4) } }' | sort -u)

  # Collect Next.js dev processes even if they are not currently listening.
  while IFS= read -r pid; do
    [ -n "$pid" ] && pids+=("$pid")
  done < <(pgrep -f "next dev" || true)

  if [ ${#pids[@]} -eq 0 ]; then
    echo "ℹ️  No existing app/dev processes found."
    return 0
  fi

  # Deduplicate before kill.
  mapfile -t pids < <(printf '%s\n' "${pids[@]}" | sort -u)

  echo "⚠️  Found existing app/dev PIDs: ${pids[*]}"
  echo "🧹 Stopping existing app/dev processes..."

  for pid in "${pids[@]}"; do
    kill "$pid" 2>/dev/null || true
  done

  sleep 1

  for pid in "${pids[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill -9 "$pid" 2>/dev/null || true
    fi
  done

  echo "✅ Existing app/dev processes cleaned"
}

has_running_next_dev() {
  pgrep -f "next dev" >/dev/null 2>&1
}

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

echo "✅ Env vars OK"

# ── 3. Move to project root ──────────────────────────────────
cd "$ROOT_DIR"

# ── 4. Check Docker is running ──────────────────────────────
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker first."
  exit 1
fi
echo "✅ Docker is running"

# ── 4.5 Optional cleanup of existing dev processes ─────────
echo ""
read -p "Kill existing app/dev processes before starting? [y/N]: " KILL_OLD
if [[ "$KILL_OLD" =~ ^[Yy]$ ]]; then
  kill_existing_app_processes
fi

# ── 4.6 Guard cache cleanup against active next dev process ─────────────
if has_running_next_dev; then
  echo "❌ Detected a running 'next dev' process."
  echo "   Stopping now avoids corrupted .next artifacts (missing vendor chunks)."
  echo "   Re-run this script and choose 'y' when prompted to kill existing app/dev processes."
  exit 1
fi

# ── 4.7 Reset Next.js build cache only after process cleanup ─────────────
echo "🧹 Resetting Next.js build cache..."
find . -maxdepth 1 -type d -name '.next_stale_*' -exec rm -rf {} + 2>/dev/null || true
rm -rf .next
echo "✅ Next.js cache reset"

# ── Compose command detection (plugin v2 vs legacy docker-compose) ────────
# Use an array so commands with a space (`docker compose`) are executed correctly.
if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD=(docker-compose)
else
  echo "❌ Neither 'docker compose' (plugin) nor 'docker-compose' found."
  echo "   Install the Compose plugin: sudo apt install docker-compose-plugin -y"
  exit 1
fi

# ── 5. Ask run mode ──────────────────────────────────────────
echo ""
echo "How do you want to run the app?"
echo "  1) DB in Docker + npm run dev  (recommended for development)"
echo "  2) Full Docker                 (production-like)"
echo ""
read -p "Enter choice [1/2]: " MODE

# ── 6. Resolve app port (auto-fallback if busy) ─────────────
echo ""
echo "🔍 Finding available app port (starting at 3000)..."
APP_PORT="$(find_free_port 3000 || true)"

if [ -z "$APP_PORT" ]; then
  echo "❌ Could not find a free port in range 3000-3049."
  exit 1
fi

export APP_PORT
export NEXTAUTH_URL="http://localhost:${APP_PORT}"
echo "✅ Using app port: ${APP_PORT}"

# ── 7. Run based on choice ───────────────────────────────────
if [ "$MODE" = "1" ]; then

  # ── Mode 1: DB only in Docker + npm run dev ───────────────
  echo ""
  echo "📦 Starting Postgres in Docker..."
  "${COMPOSE_CMD[@]}" up -d postgres

  echo "⏳ Waiting for Postgres to be ready..."
  until "${COMPOSE_CMD[@]}" exec postgres pg_isready -U admin -d tynysdb > /dev/null 2>&1; do
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

  # Re-check port after setup steps because another process may bind in the meantime.
  RUNTIME_PORT="$(find_free_port "$APP_PORT" || true)"
  if [ -z "$RUNTIME_PORT" ]; then
    echo "❌ Could not find a free runtime port in range ${APP_PORT}-$((APP_PORT + 49))."
    exit 1
  fi

  if [ "$RUNTIME_PORT" != "$APP_PORT" ]; then
    APP_PORT="$RUNTIME_PORT"
    export APP_PORT
    export NEXTAUTH_URL="http://localhost:${APP_PORT}"
    echo "ℹ️  Port changed during setup. Switching to ${APP_PORT}."
  fi

  echo ""
  echo "✅ All good! Starting dev server..."
  echo "🌐 Open http://localhost:${APP_PORT}"
  echo ""
  npm run dev -- --port "$APP_PORT"

elif [ "$MODE" = "2" ]; then

  # ── Mode 2: Full Docker stack ─────────────────────────────
  echo ""
  echo "🐳 Starting full Docker stack..."
  "${COMPOSE_CMD[@]}" up -d --build

  echo "⏳ Waiting for Postgres to be ready..."
  until "${COMPOSE_CMD[@]}" exec postgres pg_isready -U admin -d tynysdb > /dev/null 2>&1; do
    sleep 1
  done
  echo "✅ Postgres is ready"

  echo "⏳ Waiting for app container to start..."
  sleep 5

  echo ""
  echo "✅ All good! App is running in Docker."
  echo "🌐 Open http://localhost:${APP_PORT}"
  echo ""
  echo "📋 Useful commands:"
  echo "   ${COMPOSE_CMD[0]} ${COMPOSE_CMD[1]:+${COMPOSE_CMD[1]}} logs -f app      # watch app logs"
  echo "   ${COMPOSE_CMD[0]} ${COMPOSE_CMD[1]:+${COMPOSE_CMD[1]}} logs -f postgres # watch DB logs"
  echo "   ${COMPOSE_CMD[0]} ${COMPOSE_CMD[1]:+${COMPOSE_CMD[1]}} down             # stop everything"

else
  echo "❌ Invalid choice. Run the script again and enter 1 or 2."
  exit 1
fi
