#!/bin/sh
set -e

if [ "$RUN_MIGRATIONS" = "true" ]; then
  MIGRATION_TIMEOUT_SECONDS="${MIGRATION_TIMEOUT_SECONDS:-60}"
  echo "Running Prisma migrations with ${MIGRATION_TIMEOUT_SECONDS}s timeout..."

  if command -v timeout >/dev/null 2>&1; then
    timeout "$MIGRATION_TIMEOUT_SECONDS" npx prisma migrate deploy
  else
    npx prisma migrate deploy
  fi
else
  echo "Skipping Prisma migrations. Run the dedicated migrator release step before deployment."
fi

if [ "$RUN_DB_SEED" = "true" ]; then
  if [ "$ALLOW_DB_SEED" != "true" ]; then
    echo "Refusing to seed because ALLOW_DB_SEED is not true."
    exit 1
  fi

  echo "Running database seed..."
  npx prisma db seed
fi

echo "Starting Daganta..."
npm run start
