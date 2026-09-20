import fs from 'fs';
import path from 'path';
import { pool } from './pool.js';

async function migrate() {
  console.log('🔄 Running migrations...');

  const schemaPath = path.join(process.cwd(), '..', 'database', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  try {
    await pool.query(schema);
    console.log('✅ Migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

migrate().catch(console.error);
