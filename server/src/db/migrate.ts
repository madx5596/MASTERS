import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Migration system
 * Tracks applied migrations in schema_migrations table
 */

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getAppliedMigrations(): Promise<string[]> {
  const result = await pool.query('SELECT version FROM schema_migrations ORDER BY version');
  return result.rows.map((r: any) => r.version);
}

async function runMigration(version: string, name: string, sql: string) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query(
      'INSERT INTO schema_migrations (version, name) VALUES ($1, $2)',
      [version, name]
    );
    await client.query('COMMIT');
    console.log(`✅ Applied migration: ${version} - ${name}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function migrate() {
  console.log('🔄 Running migrations...');

  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();

  // Read migrations directory
  const migrationsDir = path.join(__dirname, '..', '..', 'database', 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.log('📂 No migrations directory found, using schema.sql');
    // Fallback to schema.sql
    const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      await pool.query(schema);
      console.log('✅ Schema applied');
    }
    await pool.end();
    return;
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  let appliedCount = 0;

  for (const file of files) {
    const match = file.match(/^(\d+)_(.+)\.sql$/);
    if (!match) continue;

    const version = match[1];
    const name = match[2];

    if (applied.includes(version)) {
      continue;
    }

    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    await runMigration(version, name, sql);
    appliedCount++;
  }

  if (appliedCount === 0) {
    console.log('✅ All migrations are up to date');
  } else {
    console.log(`🎉 Applied ${appliedCount} migration(s)`);
  }

  await pool.end();
}

migrate().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
