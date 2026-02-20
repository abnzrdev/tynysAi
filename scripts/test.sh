#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# TynysAI — Playwright Local Test Runner (Interactive Menu)
# Save to: scripts/test-e2e.sh
# Make executable: chmod +x scripts/test-e2e.sh
# ─────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

is_interactive() {
  [[ -t 0 ]]
}

prompt_yes_no() {
  local prompt="$1"
  local default_yes="${2:-true}"
  local reply=""

  if is_interactive; then
    read -r -p "$prompt" reply || reply=""
  else
    reply=""
  fi

  if [ "$default_yes" = "true" ]; then
    [[ ! "$reply" =~ ^[Nn]$ ]]
  else
    [[ "$reply" =~ ^[Yy]$ ]]
  fi
}

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

log()     { echo -e "${CYAN}${BOLD}[tynys]${RESET} $1"; }
success() { echo -e "${GREEN}${BOLD}[✓]${RESET} $1"; }
warn()    { echo -e "${YELLOW}${BOLD}[!]${RESET} $1"; }
error()   { echo -e "${RED}${BOLD}[✗]${RESET} $1"; exit 1; }

echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${BOLD}  TynysAI — E2E Test Runner${RESET}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
log "Running pre-flight checks..."

# Node.js
if ! command -v node &>/dev/null; then
  error "Node.js not found. Install Node.js 20+ first."
fi
success "Node.js: $(node -v)"

# node_modules
if [ ! -d "node_modules" ]; then
  warn "node_modules not found — installing dependencies..."
  npm install && success "Dependencies installed"
fi

# Playwright package
if ! npx playwright --version &>/dev/null 2>&1; then
  warn "Playwright not found — installing @playwright/test..."
  npm install -D @playwright/test
  success "Playwright installed: $(npx playwright --version)"
else
  success "Playwright: $(npx playwright --version)"
fi

# Browsers
log "Checking Playwright browsers..."
for b in chrome firefox; do
  if npx playwright install "$b" --dry-run >/dev/null 2>&1; then
    success "Browser ready: $b"
  else
    warn "Browser not installed: $b"
    if prompt_yes_no "$(echo -e "${YELLOW}Install $b now? [Y/n]: ${RESET}")" true; then
      if npx playwright install "$b"; then
        success "$b installed"
      else
        warn "Could not install $b automatically. Continuing anyway."
      fi
    else
      warn "Skipping $b install"
    fi
  fi
done

# e2e/ folder
if [ ! -d "e2e" ]; then
  error "No e2e/ folder found. Create it and add *.spec.ts files."
fi
TEST_COUNT=$(find e2e -name "*.spec.ts" 2>/dev/null | wc -l | tr -d ' ')
if [ "$TEST_COUNT" -eq 0 ]; then
  error "No *.spec.ts files found in e2e/. Add test files first."
fi
success "Test files: $TEST_COUNT spec file(s) found"

# PostgreSQL
log "Checking PostgreSQL container..."
if command -v docker &>/dev/null; then
  DB_RUNNING=$(docker ps --filter "name=postgres" --format "{{.Names}}" 2>/dev/null || echo "")
  if [ -n "$DB_RUNNING" ]; then
    success "Postgres running: $DB_RUNNING"
  else
    warn "Postgres container not running."
    if prompt_yes_no "$(echo -e "${YELLOW}Start it now? [Y/n]: ${RESET}")" true; then
      docker compose up -d postgres
      sleep 3
      success "Postgres started"
    else
      warn "Skipping — DB-dependent tests may fail"
    fi
  fi
else
  warn "Docker not found — skipping DB check"
fi

# Next.js build
log "Checking Next.js build..."
if [ ! -d ".next" ]; then
  warn "No .next build found — building now..."
  npm run build && success "Build complete"
else
  success ".next build exists"
  warn "Tip: run 'npm run build' manually if you changed code"
fi

# ── Menu ──────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${BOLD}  Choose how to run tests:${RESET}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "  ${CYAN}1)${RESET} Headless   — fast, no browser window (like CI)"
echo -e "  ${CYAN}2)${RESET} Headed     — browser opens, you can watch it run"
echo -e "  ${CYAN}3)${RESET} UI mode    — interactive picker (run tests one by one)"
echo -e "  ${CYAN}4)${RESET} Report     — open last HTML report in browser"
echo -e "  ${CYAN}5)${RESET} Exit"
echo ""

DEFAULT_CHOICE="${TYNYS_TEST_CHOICE:-3}"
if is_interactive; then
  read -r -p "$(echo -e "${BOLD}Enter choice [1-5] (default: ${DEFAULT_CHOICE}): ${RESET}")" CHOICE || CHOICE="$DEFAULT_CHOICE"
  CHOICE="${CHOICE:-$DEFAULT_CHOICE}"
else
  CHOICE="$DEFAULT_CHOICE"
  log "Non-interactive shell detected — using default choice: $CHOICE"
fi
echo ""

case $CHOICE in
  1)
    log "Running HEADLESS..."
    npx playwright test --reporter=list
    ;;
  2)
    log "Running HEADED (browser visible)..."
    npx playwright test --headed --reporter=list
    ;;
  3)
    log "Opening Playwright UI mode..."
    npx playwright test --ui
    ;;
  4)
    if [ ! -d "playwright-report" ]; then
      error "No report found. Run tests first (option 1 or 2)."
    fi
    npx playwright show-report
    ;;
  5)
    log "Exiting."
    exit 0
    ;;
  *)
    error "Invalid choice. Enter 1–5."
    ;;
esac

EXIT_CODE=$?
echo ""
if [ "${EXIT_CODE:-0}" -eq 0 ]; then
  success "All tests passed!"
  log "View full report: run script → option 4"
else
  warn "Some tests failed. Run script → option 4 for screenshots and traces."
fi
