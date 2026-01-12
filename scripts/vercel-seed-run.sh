#!/usr/bin/env bash
set -euo pipefail

cyan="\033[1;36m"
green="\033[1;32m"
yellow="\033[1;33m"
red="\033[1;31m"
bold="\033[1m"
reset="\033[0m"

step() { echo -e "${cyan}➜${reset} ${bold}$1${reset}"; }
ok() { echo -e "${green}✔${reset} $1"; }
warn() { echo -e "${red}⚠${reset} $1"; }
info() { echo -e "${yellow}•${reset} $1"; }

step "Collecting connection + seed inputs"
read -r -p "DB_URL [${DB_URL:-empty}]: " __db
DB_URL="${__db:-${DB_URL:-}}"
if [[ -z "${DB_URL}" ]]; then
  warn "DB_URL is required."
  exit 1
fi

read -r -p "SEED_EMAIL [${SEED_EMAIL:-test@example.com}]: " __email
SEED_EMAIL="${__email:-${SEED_EMAIL:-test@example.com}}"

read -r -p "SEED_PASSWORD [${SEED_PASSWORD:-password123}]: " __pass
SEED_PASSWORD="${__pass:-${SEED_PASSWORD:-password123}}"

read -r -p "SEED_NAME [${SEED_NAME:-Test Account}]: " __name
SEED_NAME="${__name:-${SEED_NAME:-Test Account}}"

export DB_URL SEED_EMAIL SEED_PASSWORD SEED_NAME
info "Using DB_URL=${DB_URL}"
info "Using SEED_EMAIL=${SEED_EMAIL}, SEED_NAME=${SEED_NAME}"

step "Running migrations against remote DB"
npm run migrate

step "Seeding remote DB (idempotent)"
npm run seed:deploy

ok "Done. Remote database migrated and seeded."
