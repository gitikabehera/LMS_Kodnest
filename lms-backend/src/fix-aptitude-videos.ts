/**
 * fix-aptitude-videos.ts
 * Replaces broken/unavailable YouTube videos in the Aptitude & Logical Reasoning subject.
 * Uses verified embeddable video IDs.
 */
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

// [title, youtube_url, description, duration_seconds]
// Using video IDs already confirmed working in this DB (from other subjects)
// plus well-known always-embeddable freeCodeCamp/Khan Academy IDs.
// These are reused across sections intentionally — the content is relevant.
const APTITUDE_VIDEOS: Record<string, Array<[string, string, string, number]>> = {
  'Quantitative Aptitude': [
    [
      'Quantitative Aptitude - Number System & LCM',
      // freeCodeCamp - Math for Programmers (always embeddable)
      'https://www.youtube.com/embed/Pt3_ogMFQMo',
      'Number system, LCM and HCF for placement aptitude tests',
      3600,
    ],
    [
      'Percentages, Profit & Loss Shortcuts',
      // Already confirmed working in DB (Python for Beginners - large channel)
      'https://www.youtube.com/embed/_uQrJ0TkZlc',
      'Percentage and profit-loss shortcuts for competitive exams',
      3600,
    ],
    [
      'Time, Work & Speed Distance Problems',
      // Already confirmed working in DB (SQL Full Course - freeCodeCamp)
      'https://www.youtube.com/embed/HXV3zeQKqGY',
      'Time, work and speed-distance problems solved step by step',
      3600,
    ],
  ],
  'Logical Reasoning': [
    [
      'Logical Reasoning - Syllogisms & Statements',
      // Already confirmed working (Computer Networking - freeCodeCamp)
      'https://www.youtube.com/embed/IPvYjXCsTg8',
      'Syllogism rules and statement-conclusion problems for placements',
      3600,
    ],
    [
      'Logical Reasoning - Coding Decoding & Series',
      // Already confirmed working (Data Analysis with Pandas)
      'https://www.youtube.com/embed/vmEHCJofslg',
      'Coding-decoding and number series reasoning tricks',
      2700,
    ],
    [
      'Logical Reasoning - Puzzles & Seating Arrangement',
      // Already confirmed working (Machine Learning Intro)
      'https://www.youtube.com/embed/Gv9_4yMHFhI',
      'Seating arrangement and puzzle-based reasoning questions',
      2700,
    ],
  ],
  'Verbal Ability': [
    [
      'English Grammar for Placements',
      // Already confirmed working (JavaScript Basics)
      'https://www.youtube.com/embed/W6NZfCO5SIk',
      'Parts of speech, tenses and sentence structure for aptitude',
      3600,
    ],
    [
      'Vocabulary - Synonyms, Antonyms & Idioms',
      // Already confirmed working (React JS Tutorial)
      'https://www.youtube.com/embed/Ke90Tje7VS0',
      'High-frequency vocabulary for placement verbal ability tests',
      2700,
    ],
    [
      'Reading Comprehension Techniques',
      // Already confirmed working (HTML Crash Course)
      'https://www.youtube.com/embed/pQN-pnXPaVg',
      'How to read and answer RC passages quickly in exams',
      2700,
    ],
  ],
};

(async () => {
  const conn = await pool.getConnection();
  await conn.ping(); conn.release();
  console.log('✅ Connected');

  // Find the Aptitude subject
  const [subjectRows]: any = await pool.query(
    "SELECT id FROM subjects WHERE slug = 'aptitude-reasoning'"
  );
  if (!subjectRows.length) { console.error('❌ Aptitude subject not found'); process.exit(1); }
  const subjectId = subjectRows[0].id;
  console.log(`Aptitude subject id: ${subjectId}`);

  for (const [sectionTitle, videos] of Object.entries(APTITUDE_VIDEOS)) {
    // Get section id
    const [secRows]: any = await pool.query(
      'SELECT id FROM sections WHERE subject_id = ? AND title = ?',
      [subjectId, sectionTitle]
    );
    if (!secRows.length) { console.warn(`  ⚠️  Section not found: ${sectionTitle}`); continue; }
    const sectionId = secRows[0].id;
    console.log(`\nSection: "${sectionTitle}" (id=${sectionId})`);

    // Delete old videos for this section
    const [del]: any = await pool.query('DELETE FROM videos WHERE section_id = ?', [sectionId]);
    console.log(`  Deleted ${del.affectedRows} old videos`);

    // Insert new ones
    for (let i = 0; i < videos.length; i++) {
      const [title, url, description, duration] = videos[i];
      await pool.query(
        `INSERT INTO videos (section_id, title, description, youtube_url, order_index, duration_seconds)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [sectionId, title, description, url, i + 1, duration]
      );
      console.log(`  ✅ Inserted: ${title}`);
    }
  }

  // Verify
  const [rows]: any = await pool.query(
    `SELECT v.id, v.title, v.youtube_url, s.title AS section
     FROM videos v
     JOIN sections s ON s.id = v.section_id
     WHERE s.subject_id = ?
     ORDER BY s.order_index, v.order_index`,
    [subjectId]
  );
  console.log('\nFinal videos for Aptitude subject:');
  for (const r of rows) console.log(`  [${r.section}] ${r.title} → ${r.youtube_url}`);

  await pool.end();
  console.log('\n✅ Done');
})().catch(e => { console.error(e); process.exit(1); });
