#!/bin/bash

# This script runs the Supabase migrations using psql
# Make sure you have PostgreSQL client tools installed

POSTGRES_URL=$POSTGRES_URL

if [ -z "$POSTGRES_URL" ]; then
  echo "Error: POSTGRES_URL environment variable not set"
  exit 1
fi

echo "Applying Supabase migrations..."
echo ""

# Run each migration file
for migration in supabase/migrations/001_*.sql supabase/migrations/002_*.sql supabase/migrations/003_*.sql supabase/migrations/004_*.sql; do
  if [ -f "$migration" ]; then
    echo "Running $migration..."
    psql "$POSTGRES_URL" -f "$migration" -v ON_ERROR_STOP=1 2>&1 | head -10
    if [ $? -eq 0 ]; then
      echo "  ✓ Completed"
    else
      echo "  ⚠ May have errors (check Supabase dashboard)"
    fi
    echo ""
  fi
done

echo "Migrations applied!"
