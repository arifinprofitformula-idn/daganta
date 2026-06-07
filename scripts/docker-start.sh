#!/bin/sh
set -e

if [ "$SKIP_MIGRATIONS" = "true" ]; then
  echo "Skipping Prisma migrations because SKIP_MIGRATIONS=true."
else
  MIGRATION_TIMEOUT_SECONDS="${MIGRATION_TIMEOUT_SECONDS:-60}"
  echo "Running Prisma migrations with ${MIGRATION_TIMEOUT_SECONDS}s timeout..."

  if command -v timeout >/dev/null 2>&1; then
    timeout "$MIGRATION_TIMEOUT_SECONDS" npx prisma migrate deploy
  else
    npx prisma migrate deploy
  fi
fi

if [ "$RUN_DB_SEED" = "true" ]; then
  echo "Running database seed..."
  npx prisma db seed
fi

echo "Starting Daganta..."
npm run start
