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
echo "Delete options:"
echo "  1) Delete a user by email"
echo "  2) Delete users by ID range (e.g. 1-20)"
echo "  0) Do nothing"
read -p "Choose an option [0/1/2]: " OPTION

if [ "$OPTION" = "0" ] || [ -z "$OPTION" ]; then
  echo "✅ Done. No users deleted."
else
  case "$OPTION" in
    1)
      # Delete by email
      read -p "Enter email to delete: " DEL_EMAIL

      if [ -z "$DEL_EMAIL" ]; then
        echo "❌ No email entered. Aborting."
        exit 1
      fi

      echo ""
      echo "⚠️  About to DELETE user with email: $DEL_EMAIL"
      read -p "Type 'YES' to confirm: " CONFIRM

      if [ "$CONFIRM" != "YES" ]; then
        echo "❌ Cancelled."
        exit 1
      fi

      run_sql "DELETE FROM users WHERE email = '$DEL_EMAIL';"
      echo "✅ User '$DEL_EMAIL' deleted."
      ;;

    2)
      # Delete by ID range
      read -p "Enter ID range to delete (e.g. 1-20): " RANGE

      if [[ ! "$RANGE" =~ ^[0-9]+-[0-9]+$ ]]; then
        echo "❌ Invalid range format. Use: start-end (e.g. 1-20)."
        exit 1
      fi

      START_ID="${RANGE%-*}"
      END_ID="${RANGE#*-}"

      echo ""
      echo "⚠️  About to DELETE users with id BETWEEN $START_ID AND $END_ID"
      read -p "Type 'YES' to confirm: " CONFIRM_RANGE

      if [ "$CONFIRM_RANGE" != "YES" ]; then
        echo "❌ Cancelled."
        exit 1
      fi

      run_sql "DELETE FROM users WHERE id BETWEEN $START_ID AND $END_ID;"
      echo "✅ Users with id between $START_ID and $END_ID deleted."
      ;;

    *)
      echo "❌ Unknown option. Aborting."
      exit 1
      ;;
  esac
fi

echo ""
read -p "Do you want to run DB migration to prod via ./dbmigrator.sh now? [y/N]: " MIGRATE_ANSWER

if [[ "$MIGRATE_ANSWER" == "y" || "$MIGRATE_ANSWER" == "Y" ]]; then
  if [ -x "./dbmigrator.sh" ]; then
    echo "🚀 Running dbmigrator.sh ..."
    ./dbmigrator.sh
    echo "✅ dbmigrator.sh finished."
  else
    echo "❌ ./dbmigrator.sh not found or not executable."
    exit 1
  fi
else
  echo "✅ Skipped db migration."
fi
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
echo "Delete options:"
echo "  1) Delete a user by email"
echo "  2) Delete users by ID range (e.g. 1-20)"
echo "  0) Do nothing"
read -p "Choose an option [0/1/2]: " OPTION

if [ "$OPTION" = "0" ] || [ -z "$OPTION" ]; then
  echo "✅ Done. No users deleted."
else
  case "$OPTION" in
    1)
      # Delete by email
      read -p "Enter email to delete: " DEL_EMAIL

      if [ -z "$DEL_EMAIL" ]; then
        echo "❌ No email entered. Aborting."
        exit 1
      fi

      echo ""
      echo "⚠️  About to DELETE user with email: $DEL_EMAIL"
      read -p "Type 'YES' to confirm: " CONFIRM

      if [ "$CONFIRM" != "YES" ]; then
        echo "❌ Cancelled."
        exit 1
      fi

      run_sql "DELETE FROM users WHERE email = '$DEL_EMAIL';"
      echo "✅ User '$DEL_EMAIL' deleted."
      ;;

    2)
      # Delete by ID range
      read -p "Enter ID range to delete (e.g. 1-20): " RANGE

      if [[ ! "$RANGE" =~ ^[0-9]+-[0-9]+$ ]]; then
        echo "❌ Invalid range format. Use: start-end (e.g. 1-20)."
        exit 1
      fi

      START_ID="${RANGE%-*}"
      END_ID="${RANGE#*-}"

      echo ""
      echo "⚠️  About to DELETE users with id BETWEEN $START_ID AND $END_ID"
      read -p "Type 'YES' to confirm: " CONFIRM_RANGE

      if [ "$CONFIRM_RANGE" != "YES" ]; then
        echo "❌ Cancelled."
        exit 1
      fi

      run_sql "DELETE FROM users WHERE id BETWEEN $START_ID AND $END_ID;"
      echo "✅ Users with id between $START_ID and $END_ID deleted."
      ;;

    *)
      echo "❌ Unknown option. Aborting."
      exit 1
      ;;
  esac
fi

echo ""
read -p "Do you want to run DB migration to prod via ./dbmigrator.sh now? [y/N]: " MIGRATE_ANSWER

if [[ "$MIGRATE_ANSWER" == "y" || "$MIGRATE_ANSWER" == "Y" ]]; then
  if [ -x "./dbmigrator.sh" ]; then
    echo "🚀 Running dbmigrator.sh ..."
    ./dbmigrator.sh
    echo "✅ dbmigrator.sh finished."
  else
    echo "❌ ./dbmigrator.sh not found or not executable."
    exit 1
  fi
else
  echo "✅ Skipped db migration."
fi

