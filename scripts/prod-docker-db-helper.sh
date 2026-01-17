#!/usr/bin/env bash
# Interactive production Docker + Postgres helper for Tynys
# - Shows containers and statuses
# - Helps pick the app container (name contains "tynys" by default)
# - Shows DB env vars inside the app container and warns if they use localhost
# - Starts stopped Postgres containers if you agree
# - Can run a simple DB connectivity check with psql using the chosen URL
# Messages stay in simple English.
set -euo pipefail

APP_MATCH="${APP_MATCH:-tynys}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

say() {
  echo
  echo "=== $1"
}

ask_yes_no() {
  local prompt="$1"
  while true; do
    read -r -p "$prompt [y/n]: " yn
    case "$yn" in
      [Yy]*) return 0 ;;
      [Nn]*) return 1 ;;
      *) echo "Please answer y or n." ;;
    esac
  done
}

trap 'echo; echo "Stopped because a command failed. Read the message above."' ERR

say "1) Checking Docker availability"
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed or not in PATH. Install Docker first."
  exit 1
fi

say "2) Listing all containers (name | image | status)"
docker ps -a --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'

pick_app_container() {
  local candidates
  candidates=$(docker ps -a --format '{{.Names}}|{{.Image}}|{{.Status}}' | grep -i "$APP_MATCH" || true)
  if [ -z "$candidates" ]; then
    echo "No container name matched '$APP_MATCH'."
    read -r -p "Type the app container name (or leave empty to skip): " manual
    if [ -z "$manual" ]; then
      echo "No app container selected."; return 1
    fi
    APP_CONTAINER="$manual"
    return 0
  fi

  local count
  count=$(echo "$candidates" | wc -l | tr -d ' ')
  if [ "$count" -eq 1 ]; then
    APP_CONTAINER=$(echo "$candidates" | cut -d'|' -f1)
    echo "Picked app container: $APP_CONTAINER"
    return 0
  fi

  echo "Multiple matches. Pick by number:"
  nl -ba <<<"$candidates" | awk -F'|' '{printf "%s) name: %s  image: %s  status: %s\n", $1, $2, $3, $4}'
  read -r -p "Enter the number: " choice
  APP_CONTAINER=$(echo "$candidates" | sed -n "${choice}p" | cut -d'|' -f1)
  if [ -z "$APP_CONTAINER" ]; then
    echo "No valid choice."; return 1
  fi
  echo "Picked app container: $APP_CONTAINER"
}

say "3) Choosing the app container (looks for '$APP_MATCH')"
APP_CONTAINER=""
pick_app_container || echo "Continuing without an app container."

say "4) Checking Postgres containers"
POSTGRES_LIST=$(docker ps -a --format '{{.Names}}|{{.Image}}|{{.Status}}' | grep -Ei 'postgres|postgis' || true)
if [ -z "$POSTGRES_LIST" ]; then
  echo "No Postgres containers were found."
else
  echo "$POSTGRES_LIST" | awk -F'|' '{printf " - name: %s  image: %s  status: %s\n", $1, $2, $3}'
  echo
  echo "If status is Exited (like Exit 255), the DB is down."
  while IFS='|' read -r name image status; do
    [ -z "$name" ] && continue
    if echo "$status" | grep -qi "exited"; then
      if ask_yes_no "Start Postgres container '$name'?"; then
        if docker start "$name"; then
          echo "Started '$name'."
        else
          echo "Could not start '$name'."
        fi
      fi
    fi
  done <<<"$POSTGRES_LIST"
fi

if [ -n "$APP_CONTAINER" ]; then
  say "5) Reading DB env vars inside app container '$APP_CONTAINER'"
  ENV_LINES=$(docker inspect --format '{{range .Config.Env}}{{println .}}{{end}}' "$APP_CONTAINER" 2>/dev/null || true)
  DB_URL=$(echo "$ENV_LINES" | grep -E '^DB_URL=' | tail -1 | cut -d= -f2- || true)
  DATABASE_URL=$(echo "$ENV_LINES" | grep -E '^DATABASE_URL=' | tail -1 | cut -d= -f2- || true)

  if [ -z "$DB_URL" ] && [ -z "$DATABASE_URL" ]; then
    echo "No DB_URL or DATABASE_URL found in container env."
  else
    [ -n "$DB_URL" ] && echo "DB_URL: $DB_URL"
    [ -n "$DATABASE_URL" ] && echo "DATABASE_URL: $DATABASE_URL"
    if echo "${DB_URL}${DATABASE_URL}" | grep -Eqi 'localhost|127.0.0.1'; then
      echo "Warning: URL uses localhost. Inside a container this usually breaks unless Postgres is in the same container."
      echo "Use the Postgres container name or host.docker.internal instead."
    fi
  fi

  if ask_yes_no "Show last 100 log lines from '$APP_CONTAINER'?"; then
    docker logs "$APP_CONTAINER" --tail 100 || echo "Could not read logs."
  fi
fi

say "6) Optional DB connection test with psql"
default_url="${DB_URL:-${DATABASE_URL:-}}"
if [ -z "$default_url" ]; then
  echo "No DB url known yet."
fi
if ask_yes_no "Run a simple 'select 1' using psql?"; then
  if ! command -v psql >/dev/null 2>&1; then
    echo "psql is not installed on this host. Install PostgreSQL client first."
  else
    read -r -p "Enter DB url to test [${default_url:-skip}]: " user_url
    TEST_URL="${user_url:-$default_url}"
    if [ -z "$TEST_URL" ]; then
      echo "No URL provided. Skipping test."
    else
      echo "Running: psql <url> -c 'select 1;'"
      if psql "$TEST_URL" -c "select 1;"; then
        echo "DB is reachable and responded."
      else
        echo "Could not connect. Check host/port/user/password."
      fi
    fi
  fi
fi

say "7) Quick guidance"
echo " - If no app container was found, the image is not running on this host."
echo " - If Postgres was Exited 255, check its logs: docker logs <postgres-container>."
echo " - If DB_URL uses localhost inside the app container, change it to the Postgres container name or host.docker.internal."
echo " - After DB is reachable, run migrations from the app build pipeline or inside the container if tooling exists."

echo
echo "Done."
