import pool from './index';
import fs from 'fs';
import path from 'path';

/**
 * Initialize database by running schema.sql
 * Run this once to set up your database tables
 */
export async function initDatabase() {
  try {
    const schemaPath = path.join(process.cwd(), 'lib/db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = schema
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement) {
        try {
          await pool.query(statement);
        } catch (err: any) {
          // Ignore "already exists" errors
          if (!err.message.includes('already exists') && !err.message.includes('duplicate')) {
            console.warn(`Warning executing statement: ${err.message}`);
          }
        }
      }
    }

    console.log('✅ Database initialized successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

