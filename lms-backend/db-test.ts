/**
 * Standalone DB connection test script.
 * Run: npx ts-node db-test.ts
 * Requires DB_PASSWORD in environment (or .env file)
 */
import 'dotenv/config';
import { testConnection } from './src/config/db';

(async () => {
  try {
    await testConnection();
    process.exit(0);
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }
})();
