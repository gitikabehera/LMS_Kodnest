import 'dotenv/config';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'mysql-29c3ab9d-gitika-9691.b.aivencloud.com',
  port:               Number(process.env.DB_PORT) || 23306,
  database:           process.env.DB_NAME     || 'defaultdb',
  user:               process.env.DB_USER     || 'avnadmin',
  password:           process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit:    5,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('✅ Database connected successfully');

    await pool.query(`
      INSERT INTO subjects (id, title, slug, description, is_published) VALUES
        (1, 'Web Development',    'web-development',    'Learn HTML, CSS, JavaScript, React', 1),
        (2, 'Python Programming', 'python-programming', 'Learn Python from basics to advanced', 1),
        (3, 'Data Science',       'data-science',       'Learn data analysis, ML, and AI', 1),
        (4, 'Cybersecurity',      'cybersecurity',      'Basics of cyber security and ethical hacking', 1),
        (5, 'Cloud Computing',    'cloud-computing',    'AWS, Azure, Google Cloud fundamentals', 1)
      ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description)
    `);

    await pool.query(`
      INSERT INTO sections (id, subject_id, title, order_index) VALUES
        (1, 1, 'HTML & CSS Basics',         1),
        (2, 1, 'JavaScript Fundamentals',   2),
        (3, 1, 'React Introduction',        3),
        (4, 2, 'Python Basics',             1),
        (5, 2, 'Python Advanced',           2),
        (6, 3, 'Data Analysis with Pandas', 1),
        (7, 3, 'Machine Learning Intro',    2),
        (8, 4, 'Cybersecurity Fundamentals',1),
        (9, 5, 'Cloud Computing Basics',    1)
      ON DUPLICATE KEY UPDATE title = VALUES(title)
    `);

    await pool.query(`
      INSERT INTO videos (id, section_id, title, youtube_url, url, order_index) VALUES
        (1, 1, 'HTML Crash Course',         'https://www.youtube.com/watch?v=pQN-pnXPaVg', 'https://www.youtube.com/watch?v=pQN-pnXPaVg', 1),
        (2, 2, 'JavaScript Basics',         'https://www.youtube.com/watch?v=W6NZfCO5SIk', 'https://www.youtube.com/watch?v=W6NZfCO5SIk', 1),
        (3, 3, 'React JS Tutorial',         'https://www.youtube.com/watch?v=Ke90Tje7VS0', 'https://www.youtube.com/watch?v=Ke90Tje7VS0', 1),
        (4, 4, 'Python Basics',             'https://www.youtube.com/watch?v=_uQrJ0TkZlc', 'https://www.youtube.com/watch?v=_uQrJ0TkZlc', 1),
        (5, 5, 'Python Advanced Topics',    'https://www.youtube.com/watch?v=HGOBQPFzWKo', 'https://www.youtube.com/watch?v=HGOBQPFzWKo', 1),
        (6, 6, 'Data Analysis Pandas',      'https://www.youtube.com/watch?v=vmEHCJofslg', 'https://www.youtube.com/watch?v=vmEHCJofslg', 1),
        (7, 7, 'Machine Learning Intro',    'https://www.youtube.com/watch?v=Gv9_4yMHFhI', 'https://www.youtube.com/watch?v=Gv9_4yMHFhI', 1),
        (8, 8, 'Cybersecurity Intro',       'https://www.youtube.com/watch?v=inWWhr5tnEA', 'https://www.youtube.com/watch?v=inWWhr5tnEA', 1),
        (9, 9, 'Cloud Computing Overview',  'https://www.youtube.com/watch?v=2LaAJq1lBqY', 'https://www.youtube.com/watch?v=2LaAJq1lBqY', 1)
      ON DUPLICATE KEY UPDATE title = VALUES(title), youtube_url = VALUES(youtube_url)
    `);

    console.log('🔨 Database seeded with subjects, sections, and videos.');
  } catch (err) {
    console.error('❌ DB Seed Error:', err);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('🔌 Connection pool closed.');
  }
})();
