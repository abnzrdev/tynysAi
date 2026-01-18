#!/usr/bin/env bash
# Build (and optionally run) the Tynys production Docker image.
# Prompts for a tag and DB_URL, warns if DB_URL uses localhost, and can start the container.
# Messages stay simple.
set -euo pipefail

say() { echo; echo "=== $1"; }
ask_yes_no() {
  while true; do
    read -r -p "$1 [y/n]: " yn
    case "$yn" in
      [Yy]*) return 0 ;;
      [Nn]*) return 1 ;;
      *) echo "Please answer y or n." ;;
    esac
  done
}

trap 'echo; echo "Stopped because a command failed. Read the message above."' ERR

say "1) Checking Docker"
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed or not in PATH. Install Docker first."; exit 1
fi

say "2) Pick image tag"
DEFAULT_TAG=${IMAGE_TAG:-tynys:latest}
read -r -p "Image tag to build [$DEFAULT_TAG]: " IMAGE_TAG
IMAGE_TAG=${IMAGE_TAG:-$DEFAULT_TAG}

say "3) Get DB_URL"
DEFAULT_DB_URL="${DB_URL:-$( [ -f .env.production ] && grep -E '^DB_URL=' .env.production | head -1 | cut -d= -f2- || true )}"
if [ -n "$DEFAULT_DB_URL" ]; then
  echo "Found default DB_URL from env or .env.production."
fi
read -r -p "DB_URL for build/runtime [${DEFAULT_DB_URL:-required}]: " INPUT_DB_URL
DB_URL=${INPUT_DB_URL:-$DEFAULT_DB_URL}
if [ -z "$DB_URL" ]; then
  echo "DB_URL is required to build (Next.js uses it at build time)."; exit 1
fi

if echo "$DB_URL" | grep -Eqi 'localhost|127\.0\.0\.1'; then
  echo "Warning: DB_URL points to localhost. Inside the container this usually fails unless Postgres is in the same container."
  echo "Use the Postgres container name or host.docker.internal instead."
fi

say "4) Building image $IMAGE_TAG"
docker build -t "$IMAGE_TAG" --build-arg DB_URL="$DB_URL" .

say "5) (Optional) Run container now"
if ask_yes_no "Run the container now?"; then
  DEFAULT_NAME=tynys-app
  read -r -p "Container name [$DEFAULT_NAME]: " APP_NAME
  APP_NAME=${APP_NAME:-$DEFAULT_NAME}

  # Stop/remove existing container with same name to avoid conflicts
  if docker ps -a --format '{{.Names}}' | grep -Fxq "$APP_NAME"; then
    if ask_yes_no "Container $APP_NAME exists. Remove it first?"; then
      docker rm -f "$APP_NAME"
    else
      echo "Cannot run with duplicate name. Exiting run step."; exit 1
    fi
  fi

  echo "Starting container $APP_NAME on port 3000..."
  docker run -d --name "$APP_NAME" -p 3000:3000 -e DB_URL="$DB_URL" "$IMAGE_TAG"
  echo "Container started. Check logs with: docker logs -f $APP_NAME"
else
  echo "Skipped running the container."
fi

say "Done"
