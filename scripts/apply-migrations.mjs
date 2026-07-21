#!/usr/bin/env node

import { createConnection } from "postgres";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dbUrl = process.env.POSTGRES_URL;

if (!dbUrl) {
  console.error("Error: POSTGRES_URL environment variable not set");
  process.exit(1);
}

const sql = createConnection(dbUrl);

async function runMigrations() {
  console.log("Starting Supabase migrations...\n");

  const migrationsDir = path.join(__dirname, "../supabase/migrations");
  const migrationFiles = [
    "001_profiles_schema.sql",
    "002_all_user_data_tables.sql",
    "003_guest_reports_table.sql",
    "004_add_api_response_columns.sql",
  ];

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);

    if (!fs.existsSync(filePath)) {
      console.log(`⊘ Skipping ${file} (not found)`);
      continue;
    }

    try {
      const content = fs.readFileSync(filePath, "utf-8");
      console.log(`Running ${file}...`);

      // Execute the SQL file
      await sql.file(filePath);

      console.log(`  ✓ ${file} completed\n`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      // Some errors are expected (like duplicate tables)
      if (!errorMsg.includes("already exists") && !errorMsg.includes("duplicate")) {
        console.warn(`  ⚠ ${file}: ${errorMsg}\n`);
      } else {
        console.log(`  ✓ ${file} (already exists)\n`);
      }
    }
  }

  console.log("Migrations completed!");
  await sql.end();
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
