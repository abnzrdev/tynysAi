#!/bin/sh
set -e

echo "Running database migrations..."
MAX_RETRIES=${MIGRATE_RETRIES:-4}
attempt=0
while [ $attempt -le $MAX_RETRIES ]; do
	attempt=$((attempt+1))
	echo "Migration run attempt $attempt/$MAX_RETRIES"
	# run migrate (migrate.mjs already has retry/backoff). Capture exit code.
	node migrate.mjs
	rc=$?
	if [ $rc -eq 0 ]; then
		echo "Migrations succeeded"
		break
	fi

	if [ $attempt -ge $MAX_RETRIES ]; then
		echo "Migrations failed after $attempt attempts (rc=$rc)"
		exit $rc
	fi

	echo "Migration failed (rc=$rc), retrying in 5s..."
	sleep 5
done

echo "Starting server..."
exec node server.js
