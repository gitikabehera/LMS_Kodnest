import 'dotenv/config';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'mysql-29c3ab9d-gitika-9691.b.aivencloud.com',
  port:     Number(process.env.DB_PORT) || 23306,
  database: process.env.DB_NAME     || 'defaultdb',
  user:     process.env.DB_USER     || 'avnadmin',
  password: process.env.DB_PASSWORD || '',
  ssl: { rejectUnauthorized: false },
});

(async () => {
  const conn = await pool.getConnection();
  await conn.ping(); conn.release();
  console.log('✅ Connected');

  // Fix watch?v= → embed/
  const [r1]: any = await pool.query(
    `UPDATE videos SET youtube_url = REPLACE(youtube_url, 'watch?v=', 'embed/')
     WHERE youtube_url LIKE '%watch?v=%'`
  );
  console.log('watch?v= fixed:', r1.affectedRows, 'rows');

  // Fix youtu.be/ → youtube.com/embed/
  const [r2]: any = await pool.query(
    `UPDATE videos SET youtube_url = REPLACE(youtube_url, 'https://youtu.be/', 'https://www.youtube.com/embed/')
     WHERE youtube_url LIKE 'https://youtu.be/%'`
  );
  console.log('youtu.be fixed:', r2.affectedRows, 'rows');

  // Show all URLs after fix
  const [rows]: any = await pool.query('SELECT id, title, youtube_url FROM videos ORDER BY id');
  console.log('\nAll video URLs after fix:');
  for (const r of rows) {
    const ok = r.youtube_url.includes('/embed/');
    console.log(`  [${ok ? '✅' : '❌'}] id=${r.id} ${r.youtube_url}`);
  }

  await pool.end();
  console.log('\n✅ Done');
})().catch(e => { console.error(e); process.exit(1); });
