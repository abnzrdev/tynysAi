#!/usr/bin/env bash
# ============================================================================
# 🗄️  Local PostgreSQL Dump Helper
# ----------------------------------------------------------------------------
# Dumps a local Postgres database to a .dump file and optionally copies it
# to a remote server via scp.
#
# Works with both a native pg_dump and Docker-hosted PostgreSQL.
# Reusable for any project: it just asks for connection details.
# ============================================================================

set -euo pipefail

BOLD='\033[1m'; RESET='\033[0m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; RED='\033[0;31m'

say()  { echo -e "${CYAN}${BOLD}▶${RESET} $1"; }
ok()   { echo -e "${GREEN}✅${RESET} $1"; }
warn() { echo -e "${YELLOW}⚠️  ${RESET}$1"; }
err()  { echo -e "${RED}❌${RESET} $1"; exit 1; }

echo -e "${BOLD}Local PostgreSQL Dump Helper 🗄️${RESET}"
echo    "--------------------------------"
echo    "This will export your local Postgres DB to a .dump file."
echo    "You can reuse it for any project."
echo ""

# Ask for connection info (with defaults matching your Tynys setup)
read -r -p "DB name       [default: tynysdb]: " DB_NAME
DB_NAME=${DB_NAME:-tynysdb}

read -r -p "DB user       [default: admin]: " DB_USER
DB_USER=${DB_USER:-admin}

read -r -p "DB password   [default: password123]: " DB_PASS
DB_PASS=${DB_PASS:-password123}

read -r -p "Host          [default: localhost]: " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -r -p "Port          [default: 5433]: " DB_PORT
DB_PORT=${DB_PORT:-5433}

read -r -p "Dump filename [default: ${DB_NAME}.dump]: " DUMP_FILE
DUMP_FILE=${DUMP_FILE:-${DB_NAME}.dump}

echo ""
say "Creating dump file: ${DUMP_FILE}"

# ── Detect whether pg_dump is available locally or must go through Docker ──
if command -v pg_dump &>/dev/null; then
  say "Using local pg_dump"
  export PGPASSWORD="$DB_PASS"
  pg_dump \
    -U "$DB_USER" \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -F c \
    -b \
    -v \
    -f "$DUMP_FILE" \
    "$DB_NAME"
  unset PGPASSWORD
else
  warn "pg_dump not found locally — falling back to Docker container"

  # Find a running Postgres container (prefer tynys-postgres, then any postgres image)
  DOCKER_CONTAINER=$(docker ps --filter "name=tynys-postgres" --format "{{.Names}}" | head -1)
  if [[ -z "$DOCKER_CONTAINER" ]]; then
    DOCKER_CONTAINER=$(docker ps --filter "ancestor=postgres" --format "{{.Names}}" | head -1)
  fi
  [[ -z "$DOCKER_CONTAINER" ]] && err "No running PostgreSQL container found. Start Docker first."

  say "Using container: ${DOCKER_CONTAINER}"

  # Inside the container the port is always 5432 regardless of the host mapping
  docker exec \
    -e PGPASSWORD="$DB_PASS" \
    "$DOCKER_CONTAINER" \
    pg_dump \
      -U "$DB_USER" \
      -h "localhost" \
      -p "5432" \
      -F c \
      -b \
      -v \
      "$DB_NAME" > "$DUMP_FILE"
fi

ok "Dump created: $DUMP_FILE"

echo ""
read -r -p "Copy this dump to a remote server now? [y/N]: " COPY_REMOTE
if [[ "${COPY_REMOTE:-N}" =~ ^[Yy]$ ]]; then
  read -r -p "Remote user (e.g. administrator): " REMOTE_USER
  read -r -p "Remote host (IP or domain): " REMOTE_HOST
  read -r -p "Remote path [default: /home/${REMOTE_USER}/${DUMP_FILE}]: " REMOTE_PATH
  REMOTE_PATH=${REMOTE_PATH:-"/home/${REMOTE_USER}/${DUMP_FILE}"}

  [[ -z "$REMOTE_USER" || -z "$REMOTE_HOST" ]] && err "Remote user/host cannot be empty."

  say "Copying dump to ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH} ..."
  scp "$DUMP_FILE" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}"

  ok "Dump copied to remote server ✅"
else
  say "Skipping remote copy. You can scp the file yourself later."
fi

echo ""
ok "All done 🎉"
echo "Dump file is at: $(pwd)/${DUMP_FILE}"
