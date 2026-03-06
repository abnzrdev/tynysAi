#!/bin/bash
set -e

# Interactive prompts
read -p "Enter docker-compose file path (default: ../docker-compose.prod.yml): " COMPOSE_FILE
COMPOSE_FILE=${COMPOSE_FILE:-../docker-compose.prod.yml}

read -p "Enter app service name (default: app): " APP_SERVICE
APP_SERVICE=${APP_SERVICE:-app}

read -p "Enter app container name (default: tynys-app): " APP_CONTAINER
APP_CONTAINER=${APP_CONTAINER:-tynys-app}

read -p "Enter sign-in page URL (default: http://89.218.178.215:3010/en/sign-in): " SIGNIN_URL
SIGNIN_URL=${SIGNIN_URL:-http://89.218.178.215:3010/en/sign-in}

# Print current git commit
echo "Current commit: $(git rev-parse HEAD)"

# Print local Next.js build ID
if [ -f ../.next/BUILD_ID ]; then
  echo "Local Next.js BUILD_ID: $(cat ../.next/BUILD_ID)"
else
  echo "Local Next.js BUILD_ID: missing"
fi

# Rebuild Docker image (no cache)
echo "Building Docker image..."
if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD=(docker-compose)
else
  echo "❌ Neither 'docker compose' nor 'docker-compose' found. Install the Compose plugin or docker-compose."
  exit 1
fi

"${COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" build --no-cache "$APP_SERVICE"

# Restart app container with new image
echo "Restarting app container..."
"${COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" up -d --force-recreate "$APP_SERVICE"

# Wait for healthy startup
echo "Waiting for app logs..."
"${COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" logs -f "$APP_SERVICE" &
LOGS_PID=$!
sleep 10
kill $LOGS_PID || true

# Print running container info
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'

# Print deployed Next.js build ID from container
docker exec -it "$APP_CONTAINER" sh -lc "cat .next/BUILD_ID || echo 'missing'"

# Print deployed Node version and NODE_ENV
docker exec -it "$APP_CONTAINER" sh -lc "node -e \"console.log(process.version, process.env.NODE_ENV)\""

# Print deployed sign-in page buildId from HTML
curl -s "$SIGNIN_URL" | grep -o '"buildId":"[^\"]*"' || echo 'buildId not found'

echo "Redeploy complete. Hard refresh browser and retest sign-in."
