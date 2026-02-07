#!/bin/sh
set -e

echo "Running database migrations..."
node migrate.mjs
echo "Starting server..."
exec node server.js
