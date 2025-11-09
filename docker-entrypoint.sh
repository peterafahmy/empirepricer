#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma db push --accept-data-loss

echo "Seeding database..."
npm run db:seed || echo "Database already seeded"

echo "Starting application..."
exec node server.js
