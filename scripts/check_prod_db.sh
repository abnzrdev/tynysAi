#!/usr/bin/env bash
# Simple, robust Docker diagnostic for TynysAi project
# Usage: ./scripts/docker-diagnose.sh [container_name]
set -euo pipefail

REPO_ROOT="/home/abenezer/Projects/tynysAi"
CONTAINER_ARG="${1:-}"

echo "STEP 1: Check Docker client"
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed or not in PATH. Install Docker and try again."
  exit 1
fi
echo "Docker is available."

echo
echo "STEP 2: List all containers (name | image | status):"
docker ps -a --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'

echo
# If user passed a container name, use it. Else try to auto-find likely containers.
if [ -n "$CONTAINER_ARG" ]; then
  TARGET="$CONTAINER_ARG"
  echo "Using container: $TARGET (from argument)"
else
  echo "Looking for containers that match 'tynys' (case-insensitive)..."
  CANDIDATES=$(docker ps -a --format '{{.Names}}|{{.Image}}|{{.Status}}' | grep -i 'tynys\|tynysai\|tynys-ai' || true)
  if [ -n "$CANDIDATES" ]; then
    echo "Found matching containers:"
    echo "$CANDIDATES" | awk -F'|' '{printf " - name: %s, image: %s, status: %s\n", $1, $2, $3}'
    echo
    # If exactly one candidate, pick it
    CNT=$(echo "$CANDIDATES" | wc -l | tr -d ' ')
    if [ "$CNT" -eq 1 ]; then
      TARGET=$(echo "$CANDIDATES" | cut -d'|' -f1)
      echo "Auto-selecting container: $TARGET"
    else
      echo "Multiple or ambiguous candidates found. Re-run the script with the exact container name:"
      echo "  ./scripts/docker-diagnose.sh <container_name>"
      exit 0
    fi
  else
    echo "No running/stopped container name or image matched 'tynys'."
    echo
    echo "STEP 3: Search repository for Docker-related files to find how Tynys is built/run:"
    echo " - Looking for Dockerfile(s) and docker-compose files in project..."
    find "$REPO_ROOT" -maxdepth 4 -type f \( -iname Dockerfile -o -iname 'docker-compose*.yml' -o -iname 'docker-compose*.yaml' \) -print || true
    echo
    echo " - Grep for 'image:', 'build:', 'container_name' in compose files (if any):"
    grep -RIn --exclude-dir=.git -E "image:|build:|container_name:" "$REPO_ROOT" || true
    echo
    echo "If you still can't find it, check where you built/deployed the image (CI, another machine, or different project folder)."
    exit 0
  fi
fi

echo
echo "STEP 4: Inspecting container '$TARGET' for environment and logs"

echo
echo "Environment variables (showing DB_URL and DATABASE_URL if present):"
docker inspect --format '{{range .Config.Env}}{{println .}}{{end}}' "$TARGET" 2>/dev/null | grep -Ei 'DB_URL|DATABASE_URL' || echo "No DB_URL / DATABASE_URL found in container env."

echo
echo "Container labels (may show compose project/name):"
docker inspect --format '{{json .Config.Labels}}' "$TARGET" 2>/dev/null || true

echo
echo "Showing last 200 lines of logs (if any):"
docker logs "$TARGET" --tail 200 || echo "Unable to fetch logs."

echo
echo "STEP 5: Try a quick DB check from inside the container (if psql is available)"
echo "This will attempt to run: psql \"\$DB_URL\" -c \"select count(*) from users;\""
docker exec -it "$TARGET" sh -c 'if command -v psql >/dev/null 2>&1; then echo "psql found"; psql "$DB_URL" -c "select count(*) from users;" || echo "psql ran but query failed (check DB_URL)"; else echo "psql not found inside container"; fi' || echo "Could not exec into container (it may be exited)."

echo
echo "DONE. Plain summary:"
echo " - If a container name with 'tynys' was shown above, that is the likely app container."
echo " - If no container matched, your Tynys app image may not be running on this Docker host or it was deployed from another folder/host."
echo " - To check where the app connects, look for DB_URL / DATABASE_URL in the container env or in your repo .env.production."
echo
echo "Next simple steps you can run:"
echo " - If a candidate container was shown, re-run with it: ./scripts/docker-diagnose.sh <container_name>"
echo " - If no container, search the machine/CI where you deployed the image or check your deployment scripts."