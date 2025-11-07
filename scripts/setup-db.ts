import { initDatabase } from '../lib/db/init';

// Run database initialization
async function setup() {
  try {
    await initDatabase();
    console.log('✅ Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setup();

