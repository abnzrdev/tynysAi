#!/usr/bin/env bash
# ============================================================================
# ♻️  PostgreSQL Restore Helper (Docker)
# ----------------------------------------------------------------------------
# Restores a PostgreSQL dump into a Dockerized Postgres instance.
#
# Automatically queries the server for available containers, roles, and
# databases, presenting them as numbered options at each step.
#
# It will:
#   1) Detect & list Postgres containers → pick one
#   2) Query & list available DB roles   → pick user
#   3) Query & list existing databases   → pick target DB
#   4) Detect & list .dump files         → pick dump path
#   5) Drop and recreate the DB (connects to 'postgres' to avoid the
#      "database <user> does not exist" bug)
#   6) Run pg_restore inside the container
# ============================================================================

set -euo pipefail

BOLD='\033[1m'; RESET='\033[0m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; RED='\033[0;31m'; BLUE='\033[0;34m'; DIM='\033[2m'

say()    { echo -e "${CYAN}${BOLD}▶${RESET} $1"; }
ok()     { echo -e "${GREEN}✅${RESET} $1"; }
warn()   { echo -e "${YELLOW}⚠️   ${RESET}$1"; }
err()    { echo -e "${RED}❌${RESET} $1"; exit 1; }
info()   { echo -e "${DIM}  $1${RESET}"; }
header() { echo -e "${BOLD}${BLUE}$1${RESET}"; }

# ── pick_from <label> item1 item2 … ──────────────────────────────────────────
# Displays a numbered list. Sets PICKED to the chosen item,
# or "" if the user pressed Enter to type manually.
pick_from() {
  local label="$1"; shift
  local items=("$@")
  local count=${#items[@]}
  [[ $count -eq 0 ]] && return 1

  echo ""
  header "  Available $label:"
  for i in "${!items[@]}"; do
    printf "    ${BOLD}%2d)${RESET} %s\n" $((i + 1)) "${items[$i]}"
  done
  echo ""

  while true; do
    read -r -p "  Pick a number (1-${count}), or press Enter to type manually: " CHOICE
    if [[ -z "$CHOICE" ]]; then
      PICKED=""; return 0
    fi
    if [[ "$CHOICE" =~ ^[0-9]+$ ]] && (( CHOICE >= 1 && CHOICE <= count )); then
      PICKED="${items[$((CHOICE - 1))]}"; return 0
    fi
    warn "Invalid choice — enter a number between 1 and ${count}."
  done
}

# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║   PostgreSQL Restore Helper ♻️   (Docker)         ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════════════╝${RESET}"
echo ""
echo    "  Replaces the data in a Postgres DB with a .dump file."
echo    "  The script auto-discovers containers, roles, and databases."
echo ""
warn "WARNING: This will DROP and recreate the target database."
echo ""
read -r -p "Continue? [y/N]: " CONFIRM
[[ ! "${CONFIRM:-N}" =~ ^[Yy]$ ]] && err "Aborting."

# ─── Step 1: Container ───────────────────────────────────────────────────────

echo ""
say "Step 1 — Docker container"

# Prefer containers whose image contains "postgres"
mapfile -t PG_CONTAINERS < <(
  docker ps --format "{{.Names}}\t{{.Image}}" 2>/dev/null \
    | grep -i "postgres" | awk '{print $1}' || true
)
mapfile -t ALL_CONTAINERS < <(docker ps --format "{{.Names}}" 2>/dev/null || true)

PG_CONTAINER=""

if [[ ${#PG_CONTAINERS[@]} -gt 0 ]]; then
  info "Detected Postgres containers:"
  pick_from "Postgres Containers" "${PG_CONTAINERS[@]}"
  PG_CONTAINER="$PICKED"
fi

# Fall back to all containers if nothing chosen yet
if [[ -z "$PG_CONTAINER" && ${#ALL_CONTAINERS[@]} -gt 0 ]]; then
  info "No Postgres-image container auto-detected. Showing all running containers:"
  pick_from "Running Containers" "${ALL_CONTAINERS[@]}"
  PG_CONTAINER="$PICKED"
fi

# Last resort: manual input
if [[ -z "$PG_CONTAINER" ]]; then
  read -r -p "  Container name: " PG_CONTAINER
fi
[[ -z "${PG_CONTAINER:-}" ]] && err "Container name cannot be empty."
ok "Container: $PG_CONTAINER"

# ─── Step 2: DB user / role ──────────────────────────────────────────────────

echo ""
say "Step 2 — PostgreSQL user / role"

# Auto-detect a working superuser to query the catalog
QUERY_USER=""
for TRY in postgres admin; do
  if docker exec -i "$PG_CONTAINER" \
       psql -U "$TRY" -d postgres -tAc "SELECT 1" &>/dev/null; then
    QUERY_USER="$TRY"
    break
  fi
done

DB_USER=""
FETCHED_USERS=()
if [[ -n "$QUERY_USER" ]]; then
  info "Querying roles from container (via '$QUERY_USER')…"
  mapfile -t FETCHED_USERS < <(
    docker exec -i "$PG_CONTAINER" \
      psql -U "$QUERY_USER" -d postgres -tAc \
      "SELECT rolname FROM pg_roles
       WHERE rolsuper = true OR rolcreatedb = true
       ORDER BY rolname;" 2>/dev/null || true
  )
fi

if [[ ${#FETCHED_USERS[@]} -gt 0 ]]; then
  pick_from "PostgreSQL Roles (superuser / createdb)" "${FETCHED_USERS[@]}"
  DB_USER="$PICKED"
fi

if [[ -z "$DB_USER" ]]; then
  read -r -p "  DB user [default: admin]: " DB_USER
  DB_USER="${DB_USER:-admin}"
fi
ok "DB user: $DB_USER"

# ─── Step 3: Target database ─────────────────────────────────────────────────

echo ""
say "Step 3 — Target database (will be dropped & recreated)"

DB_NAME=""
FETCHED_DBS=()
if [[ -n "$QUERY_USER" ]]; then
  info "Querying databases from container…"
  mapfile -t FETCHED_DBS < <(
    docker exec -i "$PG_CONTAINER" \
      psql -U "$QUERY_USER" -d postgres -tAc \
      "SELECT datname FROM pg_database
       WHERE datistemplate = false
         AND datname NOT IN ('postgres')
       ORDER BY datname;" 2>/dev/null || true
  )
  if [[ ${#FETCHED_DBS[@]} -eq 0 ]]; then
    info "(No user databases found — you will need to type one manually)"
  fi
fi

if [[ ${#FETCHED_DBS[@]} -gt 0 ]]; then
  pick_from "Existing Databases" "${FETCHED_DBS[@]}"
  DB_NAME="$PICKED"
fi

if [[ -z "$DB_NAME" ]]; then
  read -r -p "  DB name [default: tynysdb]: " DB_NAME
  DB_NAME="${DB_NAME:-tynysdb}"
fi

# Guard: never allow dropping a maintenance / system DB
for RESERVED in postgres template0 template1; do
  if [[ "$DB_NAME" == "$RESERVED" ]]; then
    err "'$DB_NAME' is a system/maintenance database and cannot be used as a restore target. Choose a user database."
  fi
done

ok "Database: $DB_NAME"

# ─── Step 4: Dump file ───────────────────────────────────────────────────────

echo ""
say "Step 4 — Dump file path"

DUMP_PATH=""
DUMP_SUGGESTIONS=()

# Search common locations for .dump files
while IFS= read -r -d $'\n' f; do
  DUMP_SUGGESTIONS+=("$f")
done < <(
  {
    find /home -maxdepth 4 -name "*.dump" 2>/dev/null
    find /tmp  -maxdepth 3 -name "*.dump" 2>/dev/null
    find /root -maxdepth 3 -name "*.dump" 2>/dev/null
    find "$PWD" -maxdepth 3 -name "*.dump" 2>/dev/null
  } | sort -u | head -20
)

if [[ ${#DUMP_SUGGESTIONS[@]} -gt 0 ]]; then
  pick_from ".dump files found on this filesystem" "${DUMP_SUGGESTIONS[@]}"
  DUMP_PATH="$PICKED"
fi

if [[ -z "$DUMP_PATH" ]]; then
  read -r -p "  Dump file path [default: /home/administrator/${DB_NAME}.dump]: " DUMP_PATH
  DUMP_PATH="${DUMP_PATH:-/home/administrator/${DB_NAME}.dump}"
fi

[[ ! -f "$DUMP_PATH" ]] && err "Dump file not found: $DUMP_PATH"
ok "Dump file: $DUMP_PATH"

# ─── Summary & final confirmation ────────────────────────────────────────────

echo ""
echo -e "${BOLD}┌─ Restore Summary ──────────────────────────────────┐${RESET}"
printf  "  %-12s %s\n" "Container:" "$PG_CONTAINER"
printf  "  %-12s %s\n" "DB user:"   "$DB_USER"
printf  "  %-12s %s  ${RED}← will be DROPPED & recreated${RESET}\n" "Database:" "$DB_NAME"
printf  "  %-12s %s\n" "Dump file:" "$DUMP_PATH"
echo -e "${BOLD}└────────────────────────────────────────────────────┘${RESET}"
echo ""
read -r -p "Proceed with restore? [y/N]: " FINAL
[[ ! "${FINAL:-N}" =~ ^[Yy]$ ]] && err "Aborting."

# ─── Execute ─────────────────────────────────────────────────────────────────

echo ""
say "Copying dump into container…"
docker cp "$DUMP_PATH" "$PG_CONTAINER:/tmp/db.dump" \
  || err "Failed to copy dump into container."
ok "Dump copied to /tmp/db.dump inside $PG_CONTAINER"

echo ""
# Always connect to the 'postgres' maintenance DB, NOT the target DB.
# Connecting to the default DB (same name as user) fails when that DB doesn't exist.
say "Dropping database '$DB_NAME' (connecting to 'postgres' maintenance DB)…"
docker exec -i "$PG_CONTAINER" \
  psql -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS \"$DB_NAME\";" \
  || err "Failed to drop '$DB_NAME'. Is '$DB_USER' a superuser?"

say "Creating fresh database '$DB_NAME'…"
docker exec -i "$PG_CONTAINER" \
  psql -U "$DB_USER" -d postgres -c "CREATE DATABASE \"$DB_NAME\";" \
  || err "Failed to create '$DB_NAME'."

echo ""
say "Restoring dump into '$DB_NAME' (this may take a while)…"
docker exec -i "$PG_CONTAINER" \
  pg_restore -U "$DB_USER" -d "$DB_NAME" --no-owner --role="$DB_USER" /tmp/db.dump \
  || warn "pg_restore finished with warnings (non-zero exit). Review output above."

echo ""
ok "Restore complete ✅"
echo ""
echo    "  Database '$DB_NAME' in container '$PG_CONTAINER' now matches the dump."
echo    "  Restart your app if needed:  docker compose up -d"
echo ""
