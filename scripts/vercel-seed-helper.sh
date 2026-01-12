#!/usr/bin/env bash
set -euo pipefail

# Simple, colorful helper to wire the Vercel deploy flow to run migrations + seed.
# It does not change Vercel settings for you; it shows the exact steps and can
# optionally run the seed against the DB_URL in your environment.

cyan="\033[1;36m"
green="\033[1;32m"
yellow="\033[1;33m"
red="\033[1;31m"
bold="\033[1m"
reset="\033[0m"

step() { echo -e "${cyan}➜${reset} ${bold}$1${reset}"; }
info() { echo -e "${yellow}•${reset} $1"; }
ok() { echo -e "${green}✔${reset} $1"; }
warn() { echo -e "${red}⚠${reset} $1"; }

clear
cat <<'BANNER'
 _   _                 _ _           _       _             
| | | | ___  _ __ ___ (_) |__   ___ | | __ _| |_ ___  _ __ 
| |_| |/ _ \| '_ ` _ \| | '_ \ / _ \| |/ _` | __/ _ \| '__|
|  _  | (_) | | | | | | | |_) | (_) | | (_| | || (_) | |   
|_| |_|\___/|_| |_| |_|_|_.__/ \___/|_|\__,_|\__\___/|_|   
                                                           
BANNER

echo -e "${bold}Vercel deploy + seed helper${reset}"
echo -e "This walks you through wiring the prod/preview build to run migrations + seed."

echo
step "Check local prerequisites"
if command -v vercel >/dev/null 2>&1; then
  ok "Vercel CLI detected ($(vercel --version 2>/dev/null || true))"
else
  warn "Vercel CLI not found. Install: npm i -g vercel"
fi
ok "Package.json already defines vercel-build: npm run migrate && npm run seed:deploy && next build"
info "Ensure your git working tree is clean before deploying."

echo
step "Configure Vercel environment variables"
info "Required: DB_URL (Production + Preview)"
info "Optional: SEED_EMAIL, SEED_PASSWORD, SEED_NAME (default: test@example.com / password123 / Test Account)"
info "Vercel Dashboard → Project → Settings → Environment Variables: add the above for Production and Preview."
info "If you prefer CLI: vercel env add DB_URL production  # repeat for preview"

echo
step "Build command"
info "Vercel will auto-use the vercel-build script if present."
info "If you override Build Command in the dashboard, set it to: npm run vercel-build"
info "Output directory remains .next (default)."

echo
step "Kick off a deploy"
info "Push to your main/preview branch or click Deploy in Vercel."
info "During build Vercel will run migrations then seed, so test@example.com gets chart data."

echo
step "(Optional) Seed the remote DB right now from your terminal"
if [[ -n "${DB_URL:-}" ]]; then
  info "DB_URL is present in your shell."
  read -r -p "Run npm run seed:deploy against this DB_URL now? [y/N] " answer
  case "$answer" in
    [yY][eE][sS]|[yY])
      echo
      ok "Seeding remote database..."
      npm run seed:deploy
      ok "Done."
      ;;
    *)
      info "Skipped seeding. You can run manually with: DB_URL=... npm run seed:deploy"
      ;;
  esac
else
  warn "DB_URL is not set in this shell; export it before running the seed locally."
  info "Example: DB_URL=postgres://user:pass@host/db npm run seed:deploy"
fi

echo
ok "All steps outlined. Update Vercel envs, confirm build command, redeploy, then log in as test@example.com."
