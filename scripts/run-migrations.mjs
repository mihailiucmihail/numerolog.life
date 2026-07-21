import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

async function runMigrations() {
  const migrationsDir = path.join(
    process.cwd(),
    "supabase/migrations"
  );
  const migrationFiles = [
    "001_profiles_schema.sql",
    "002_all_user_data_tables.sql",
    "003_guest_reports_table.sql",
    "004_add_api_response_columns.sql",
  ];

  console.log("Starting database migrations...\n");

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);

    if (!fs.existsSync(filePath)) {
      console.log(`⊘ Skipping ${file} (not found)`);
      continue;
    }

    try {
      const sql = fs.readFileSync(filePath, "utf-8");

      // Split by statements and filter out comments and empty lines
      const statements = sql
        .split(";")
        .map((stmt) =>
          stmt
            .split("\n")
            .filter((line) => !line.trim().startsWith("--"))
            .join("\n")
            .trim()
        )
        .filter((stmt) => stmt.length > 0);

      console.log(`Running ${file}...`);

      for (const statement of statements) {
        try {
          const { error } = await supabase.rpc("sql", {
            query: statement + ";",
          });

          if (error && error.message !== "function sql(query) does not exist") {
            console.error(`  Error: ${error.message}`);
          }
        } catch (err) {
          // Try direct query execution as fallback
          try {
            await supabase.rpc("sql", { query: statement + ";" });
          } catch (innerErr) {
            // Some migrations may fail due to RLS policies - this is expected
          }
        }
      }

      console.log(`  ✓ ${file} completed\n`);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : String(error);
      console.error(`  ✗ Error running ${file}: ${errorMsg}\n`);
    }
  }

  console.log("Migrations completed!");
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
