import 'dotenv/config';
import app from './app';
import pool from './config/db';

const PORT = Number(process.env.PORT) || 4000;

(async () => {
  try {
    // Verify DB connection without relying on named export
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('✅ Database connected successfully');

    app.listen(PORT, () => {
      console.log(`🚀 LMS Backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to database:', err);
    process.exit(1);
  }
})();
