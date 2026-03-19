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

const DROP_ORDER = [
  'forum_replies', 'forum_posts', 'user_badges', 'badges',
  'user_points', 'quiz_attempts', 'awards', 'assessments',
  'video_progress', 'enrollments', 'refresh_tokens',
  'videos', 'sections', 'subjects', 'users',
];

const CREATE_TABLES = [
  `CREATE TABLE IF NOT EXISTS users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL,
    email         VARCHAR(100)  UNIQUE NOT NULL,
    password_hash VARCHAR(255)  NOT NULL,
    role          ENUM('student','teacher','admin') DEFAULT 'student',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS subjects (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(100)  NOT NULL,
    slug         VARCHAR(100)  UNIQUE NOT NULL,
    description  TEXT,
    is_published TINYINT(1)    DEFAULT 1,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS sections (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    subject_id  INT NOT NULL,
    title       VARCHAR(100) NOT NULL,
    order_index INT          DEFAULT 0,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS videos (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    section_id       INT          NOT NULL,
    title            VARCHAR(255) NOT NULL,
    description      TEXT,
    youtube_url      VARCHAR(255) NOT NULL,
    order_index      INT          DEFAULT 0,
    duration_seconds INT          DEFAULT NULL,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS assessments (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    section_id  INT NOT NULL,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS enrollments (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    subject_id  INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_enrollment (user_id, subject_id),
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS video_progress (
    id                    INT AUTO_INCREMENT PRIMARY KEY,
    user_id               INT NOT NULL,
    video_id              INT NOT NULL,
    is_completed          TINYINT(1) DEFAULT 0,
    last_position_seconds INT        DEFAULT 0,
    watched_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_progress (user_id, video_id),
    FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS awards (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    subject_id INT NOT NULL,
    title      VARCHAR(255) NOT NULL,
    issued_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_award (user_id, subject_id),
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS quiz_attempts (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    user_id      INT NOT NULL,
    assessment_id INT NOT NULL,
    score        INT DEFAULT 0,
    max_score    INT DEFAULT 100,
    passed       TINYINT(1) DEFAULT 0,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)       REFERENCES users(id)       ON DELETE CASCADE,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS user_points (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL UNIQUE,
    points     INT DEFAULT 0,
    streak_days INT DEFAULT 0,
    last_active DATE DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS badges (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    slug        VARCHAR(100) UNIQUE NOT NULL,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    icon        VARCHAR(50) DEFAULT 'star'
  )`,
  `CREATE TABLE IF NOT EXISTS user_badges (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    badge_id   INT NOT NULL,
    earned_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_badge (user_id, badge_id),
    FOREIGN KEY (user_id)  REFERENCES users(id)   ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(id)  ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS forum_posts (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    subject_id INT DEFAULT NULL,
    title      VARCHAR(255) NOT NULL,
    body       TEXT NOT NULL,
    likes      INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS forum_replies (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    post_id    INT NOT NULL,
    user_id    INT NOT NULL,
    body       TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)       ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS refresh_tokens (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    token_hash VARCHAR(64)  NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
];

(async () => {
  try {
    const conn = await pool.getConnection();
    await conn.ping(); conn.release();
    console.log('✅ Connected');

    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const t of DROP_ORDER) {
      await pool.query(`DROP TABLE IF EXISTS \`${t}\``);
      console.log(`  dropped: ${t}`);
    }
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');

    for (const sql of CREATE_TABLES) await pool.query(sql);
    console.log('✅ Tables created');

    // ── Subjects ──────────────────────────────────────────────
    await pool.query(`
      INSERT INTO subjects (id, title, slug, description, is_published) VALUES
        (1, 'Web Development',    'web-development',    'Learn HTML, CSS, JavaScript and React from scratch', 1),
        (2, 'Python Programming', 'python-programming', 'Master Python from basics to advanced topics', 1),
        (3, 'Data Science',       'data-science',       'Data analysis, machine learning and AI with Python', 1),
        (4, 'Cybersecurity',      'cybersecurity',      'Ethical hacking, network security and cyber defence', 1),
        (5, 'Cloud Computing',    'cloud-computing',    'AWS, Azure, Google Cloud and DevOps fundamentals', 1)
    `);

    // ── Sections ──────────────────────────────────────────────
    await pool.query(`
      INSERT INTO sections (id, subject_id, title, order_index) VALUES
        (1,  1, 'HTML & CSS Basics',          1),
        (2,  1, 'JavaScript Fundamentals',    2),
        (3,  1, 'React Introduction',         3),
        (4,  2, 'Python Basics',              1),
        (5,  2, 'Python Advanced',            2),
        (6,  3, 'Data Analysis with Pandas',  1),
        (7,  3, 'Machine Learning Intro',     2),
        (8,  4, 'Cybersecurity Fundamentals', 1),
        (9,  5, 'Cloud Concepts',             1),
        (10, 5, 'AWS Services Overview',      2),
        (11, 5, 'Azure Fundamentals',         3),
        (12, 5, 'Google Cloud Basics',        4)
    `);

    // ── Videos ────────────────────────────────────────────────
    await pool.query(`
      INSERT INTO videos (id, section_id, title, description, youtube_url, order_index, duration_seconds) VALUES
        (1,  1,  'HTML Crash Course',              'Full HTML tutorial for beginners',              'https://www.youtube.com/watch?v=pQN-pnXPaVg', 1, 3600),
        (2,  1,  'CSS Fundamentals',               'Styling web pages with CSS',                    'https://www.youtube.com/watch?v=yfoY53QXEnI', 2, 3600),
        (3,  2,  'JavaScript Basics',              'Learn JS fundamentals from scratch',            'https://www.youtube.com/watch?v=W6NZfCO5SIk', 1, 3600),
        (4,  2,  'DOM Manipulation',               'Interact with the browser DOM using JS',        'https://www.youtube.com/watch?v=5fb2aPlgoys', 2, 1800),
        (5,  3,  'React JS Tutorial',              'Build your first React app',                    'https://www.youtube.com/watch?v=Ke90Tje7VS0', 1, 3600),
        (6,  3,  'React Hooks Deep Dive',          'useState, useEffect and custom hooks',          'https://www.youtube.com/watch?v=O6P86uwfdR0', 2, 2700),
        (7,  4,  'Python for Beginners',           'Complete Python beginner course',               'https://www.youtube.com/watch?v=_uQrJ0TkZlc', 1, 3600),
        (8,  4,  'Python Functions & OOP',         'Functions, classes and objects in Python',      'https://www.youtube.com/watch?v=xUI5Tsl2JpY', 2, 2700),
        (9,  5,  'Python Advanced Topics',         'Decorators, generators and async Python',       'https://www.youtube.com/watch?v=HGOBQPFzWKo', 1, 3600),
        (10, 6,  'Data Analysis with Pandas',      'Pandas full course for data analysis',          'https://www.youtube.com/watch?v=vmEHCJofslg', 1, 3600),
        (11, 6,  'Data Visualisation',             'Matplotlib and Seaborn for charts',             'https://www.youtube.com/watch?v=a9UrKTVEeZA', 2, 2700),
        (12, 7,  'Machine Learning Intro',         'ML crash course with Python and scikit-learn',  'https://www.youtube.com/watch?v=Gv9_4yMHFhI', 1, 3600),
        (13, 8,  'Cybersecurity Intro',            'Ethical hacking and security basics',           'https://www.youtube.com/watch?v=inWWhr5tnEA', 1, 3600),
        (14, 8,  'Network Security Basics',        'Firewalls, VPNs and network defence',           'https://www.youtube.com/watch?v=E03gh1huvW4', 2, 2700),
        (15, 9,  'Introduction to Cloud',          'What is cloud computing? IaaS, PaaS, SaaS',    'https://www.youtube.com/watch?v=3e1GHCA3GP0', 1, 3600),
        (16, 9,  'Cloud Deployment Models',        'Public, private and hybrid cloud explained',    'https://www.youtube.com/watch?v=M988_fsOSWo', 2, 1800),
        (17, 10, 'AWS Full Overview',              'Amazon Web Services core services explained',   'https://www.youtube.com/watch?v=ulprqHHWlng', 1, 3600),
        (18, 10, 'AWS EC2 & S3',                   'Compute and storage on AWS',                    'https://www.youtube.com/watch?v=a9__D53WsUs', 2, 2700),
        (19, 11, 'Azure Fundamentals',             'Microsoft Azure core concepts and services',    'https://www.youtube.com/watch?v=8hly31xKli0', 1, 3600),
        (20, 11, 'Azure Virtual Machines',         'Deploy and manage VMs on Azure',                'https://www.youtube.com/watch?v=ipaaqT9udgI', 2, 2700),
        (21, 12, 'Google Cloud Basics',            'GCP core services and architecture',            'https://www.youtube.com/watch?v=O-2ZrYV9pOI', 1, 3600),
        (22, 12, 'GCP Compute & Storage',          'Compute Engine, Cloud Storage and BigQuery',    'https://www.youtube.com/watch?v=IeMYQ-qJeK4', 2, 2700)
    `);

    // ── Assessments ───────────────────────────────────────────
    await pool.query(`
      INSERT INTO assessments (section_id, title, description) VALUES
        (1,  'HTML & CSS Quiz',              'Test your knowledge of HTML tags and CSS styling'),
        (2,  'JavaScript Fundamentals Quiz', 'MCQs on variables, functions and DOM'),
        (3,  'React Concepts Quiz',          'Test your understanding of components and hooks'),
        (4,  'Python Basics Quiz',           'Variables, loops, functions in Python'),
        (5,  'Python Advanced Quiz',         'Decorators, generators and async/await'),
        (6,  'Pandas & Data Analysis Quiz',  'DataFrames, groupby and data cleaning'),
        (7,  'Machine Learning Quiz',        'Supervised vs unsupervised, model evaluation'),
        (8,  'Cybersecurity Quiz',           'Threats, vulnerabilities and defence strategies'),
        (9,  'Cloud Concepts Quiz',          'IaaS, PaaS, SaaS and deployment models'),
        (10, 'AWS Services Quiz',            'EC2, S3, RDS and IAM fundamentals'),
        (11, 'Azure Fundamentals Quiz',      'Azure compute, storage and networking'),
        (12, 'Google Cloud Quiz',            'GCP services and architecture basics')
    `);

    console.log('✅ Seed data inserted');

    // ── Badges ────────────────────────────────────────────────
    await pool.query(`
      INSERT INTO badges (slug, title, description, icon) VALUES
        ('first-enroll',  'First Step',       'Enrolled in first course',          'book'),
        ('first-video',   'First Lesson',     'Completed first video lesson',      'play'),
        ('streak-7',      '7-Day Streak',     'Learned 7 days in a row',           'flame'),
        ('streak-30',     '30-Day Streak',    'Learned 30 days in a row',          'fire'),
        ('perfect-quiz',  'Perfect Score',    'Scored 100% on a quiz',             'zap'),
        ('first-cert',    'Certified',        'Earned first certificate',          'award'),
        ('course-master', 'Course Master',    'Enrolled in all courses',           'star'),
        ('top-3',         'Top 3',            'Reached top 3 on leaderboard',      'trophy')
    `);
    console.log('✅ Badges seeded');

    // ── Verify ────────────────────────────────────────────────
    const counts: Record<string, number> = {};
    for (const t of ['users','subjects','sections','videos','assessments','enrollments','awards','badges','forum_posts']) {
      const [r] = await pool.query(`SELECT COUNT(*) AS c FROM \`${t}\``) as any[];
      counts[t] = r[0].c;
    }
    console.log('\n📊 Row counts:', counts);

  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('🔌 Pool closed.');
  }
})();
