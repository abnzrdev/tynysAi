#!/bin/bash

set -e

CONTAINER="tynys-postgres"
DB="tynysdb"
USER="admin"

run_sql() {
  docker exec -i "$CONTAINER" psql -U "$USER" -d "$DB" -c "$1"
}

echo "🧩 Inspecting users table (local dev DB in Docker)"
echo "Container: $CONTAINER  DB: $DB  User: $USER"
echo "────────────────────────────────────────"

# 0) Check container is running
if ! docker ps --format '{{.Names}}' | grep -q "$CONTAINER"; then
  echo "❌ Container '$CONTAINER' is not running."
  echo "   Run: docker compose up -d postgres"
  exit 1
fi

# 1) List all users
run_sql "SELECT id, name, email, is_admin AS isAdmin, created_at FROM users ORDER BY id;"

echo ""
read -p "Delete a user by email? [y/N]: " ANSWER

if [[ "$ANSWER" != "y" && "$ANSWER" != "Y" ]]; then
  echo "✅ Done. No users deleted."
  exit 0
fi

read -p "Enter email to delete: " DEL_EMAIL

if [ -z "$DEL_EMAIL" ]; then
  echo "❌ No email entered. Aborting."
  exit 1
fi

echo ""
echo "⚠️  About to DELETE: $DEL_EMAIL"
read -p "Type 'YES' to confirm: " CONFIRM

if [ "$CONFIRM" != "YES" ]; then
  echo "❌ Cancelled."
  exit 1
fi

run_sql "DELETE FROM users WHERE email = '$DEL_EMAIL';"
echo "✅ User '$DEL_EMAIL' deleted."
