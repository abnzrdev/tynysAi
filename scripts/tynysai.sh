#!/usr/bin/env bash
set -euo pipefail

echo "🚧 TynysAI one-shot commit helper"
echo "This will create multiple commits with conventional messages."
echo "Make sure you really want to do this on the CURRENT changes."
read -r -p "Continue? [y/N]: " CONFIRM
if [[ ! "${CONFIRM:-N}" =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 0
fi

# 1) chore: add and update project helper scripts
echo ""
echo "1/5 ➜ chore: add and update project helper scripts"
git reset HEAD -- scripts db-restore.sh db-user.sh dbmigrator.sh seed.ts start.sh test.sh || true

git add \
  scripts/db-restore.sh \
  scripts/db-user.sh \
  scripts/dbmigrator.sh \
  scripts/seed.ts \
  scripts/start.sh \
  scripts/test.sh \
  scripts/build_prod_image.sh \
  scripts/check-db-stats.js \
  scripts/check_db_stats.py \
  scripts/check_prod_db.sh \
  scripts/commit_docker_setup.sh \
  scripts/db_stats.py \
  scripts/migrate.ts \
  scripts/prod-docker-db-helper.sh \
  scripts/push_docker.sh 2>/dev/null || true

if git diff --cached --quiet; then
  echo "  (no matching script changes staged, skipping commit)"
else
  git commit -m "chore: add and update project helper scripts"
fi

# 2) test: add Playwright e2e tests
echo ""
echo "2/5 ➜ test: add Playwright e2e tests"
git reset HEAD -- e2e playwright.config.ts || true

git add \
  e2e/analytics.spec.ts \
  e2e/api.spec.ts \
  e2e/auth.setup.ts \
  e2e/auth.spec.ts \
  e2e/dashboard.spec.ts \
  e2e/home.spec.ts \
  e2e/navigation.spec.ts \
  playwright.config.ts 2>/dev/null || true

if git diff --cached --quiet; then
  echo "  (no e2e changes staged, skipping commit)"
else
  git commit -m "test: add Playwright e2e tests"
fi

# 3) chore: update package metadata and lockfile
echo ""
echo "3/5 ➜ chore: update package metadata and lockfile"
git reset HEAD -- package.json package-lock.json || true
git add package.json package-lock.json 2>/dev/null || true

if git diff --cached --quiet; then
  echo "  (no package changes staged, skipping commit)"
else
  git commit -m "chore: update package metadata and lockfile"
fi

# 4) feat: refine layout and hero UI
echo ""
echo "4/5 ➜ feat: refine layout and hero UI"
git reset HEAD -- app/[lang]/home-page-client.tsx app/layout.tsx components/HeroSection.tsx app/favicon.ico || true
git add \
  app/[lang]/home-page-client.tsx \
  app/layout.tsx \
  components/HeroSection.tsx \
  app/favicon.ico 2>/dev/null || true

if git diff --cached --quiet; then
  echo "  (no layout/UI changes staged, skipping commit)"
else
  git commit -m "feat: refine layout and hero UI"
fi

# 5) chore: update deploy workflow, docs, and DB migration
echo ""
echo "5/5 ➜ chore: update deploy workflow, docs, and DB migration"
git reset HEAD -- .github/workflows/deploy.yml docs/nextjs-system-architecture-overview.md drizzle/0008_reset_sensor_readings.sql drizzle/meta/_journal.json docker-compose.yml || true

git add \
  .github/workflows/deploy.yml \
  docs/nextjs-system-architecture-overview.md \
  drizzle/0008_reset_sensor_readings.sql \
  drizzle/meta/_journal.json \
  docker-compose.yml 2>/dev/null || true

if git diff --cached --quiet; then
  echo "  (no workflow/docs/db changes staged, skipping commit)"
else
  git commit -m "chore: update deploy workflow, docs, and DB migration"
fi

echo ""
echo "✅ Done. Run: git log --oneline --decorate -5  to review."
echo "Then push with: git push origin main"

