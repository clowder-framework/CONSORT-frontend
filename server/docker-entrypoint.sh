#!/bin/sh
set -eu

MAX_ATTEMPTS="${DB_CONNECT_MAX_ATTEMPTS:-30}"
SLEEP_SECONDS="${DB_CONNECT_SLEEP_SECONDS:-2}"
attempt=1

echo "Checking PostgreSQL connectivity..."
while ! npm run --silent db:test; do
  if [ "$attempt" -ge "$MAX_ATTEMPTS" ]; then
    echo "Database is still unreachable after ${MAX_ATTEMPTS} attempts."
    exit 1
  fi

  echo "Database not ready (attempt ${attempt}/${MAX_ATTEMPTS}). Retrying in ${SLEEP_SECONDS}s..."
  attempt=$((attempt + 1))
  sleep "$SLEEP_SECONDS"
done

echo "Running database migrations..."
npm run --silent db:migrate

echo "Starting application..."
exec npm run start
