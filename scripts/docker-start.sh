#!/bin/sh
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy

if [ "$RUN_DB_SEED" = "true" ]; then
  echo "Running database seed..."
  npx prisma db seed
fi

echo "Starting Daganta..."
npm run start
