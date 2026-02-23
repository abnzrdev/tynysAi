#!/bin/sh
set -e

echo "Waiting for database to be reachable (parsed from DATABASE_URL)..."
if [ -n "$DATABASE_URL" ]; then
	DB_HOST=$(node -e "try{console.log(new URL(process.env.DATABASE_URL).hostname)}catch(e){process.exit(0)}")
	DB_PORT=$(node -e "try{const p=new URL(process.env.DATABASE_URL).port; console.log(p||5432)}catch(e){process.exit(0)}")
	if [ -n "$DB_HOST" ]; then
		MAX_WAIT=${DB_WAIT_SECONDS:-30}
		attempt=0
		echo "Will wait up to ${MAX_WAIT}s for $DB_HOST:$DB_PORT"
		while [ $attempt -lt $MAX_WAIT ]; do
			attempt=$((attempt+1))
			# try a short TCP connect using node's net module
			if node -e "const net=require('net'); const h=process.argv[1], p=+process.argv[2]; const s=net.createConnection({host:h,port:p,timeout:3000},()=>{s.end();process.exit(0)}); s.on('error',()=>process.exit(2));" "$DB_HOST" "$DB_PORT"; then
				echo "DB reachable at $DB_HOST:$DB_PORT (after $attempts attempts)"
				break
			fi
			echo "DB not ready yet ($attempt/$MAX_WAIT), retrying..."
			sleep 1
		done
		if [ $attempt -ge $MAX_WAIT ]; then
			echo "Timed out waiting for DB after $MAX_WAIT seconds"
			# continue to migrations anyway so existing migration retry logic can run,
			# but exit here if you prefer strict failure: exit 1
		fi
	fi
fi

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
