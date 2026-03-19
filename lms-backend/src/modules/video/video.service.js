const pool = require('../../config/db');

/**
 * Get all videos for a given section, ordered by order_index.
 * @param {number} sectionId
 * @returns {Promise<Array>}
 */
async function getVideosBySection(sectionId) {
  // Verify section exists
  const [sectionRows] = await pool.query(
    `SELECT s.id, s.title, s.subject_id, sub.title AS subject_title
     FROM sections s
     INNER JOIN subjects sub ON sub.id = s.subject_id
     WHERE s.id = ?`,
    [sectionId]
  );
  if (!sectionRows.length) {
    const err = new Error('Section not found.');
    err.statusCode = 404;
    throw err;
  }

  const section = sectionRows[0];

  const [videos] = await pool.query(
    `SELECT id, title, description, youtube_url,
            order_index, duration_seconds, created_at
     FROM videos
     WHERE section_id = ?
     ORDER BY order_index ASC`,
    [sectionId]
  );

  return {
    section_id:     section.id,
    section_title:  section.title,
    subject_id:     section.subject_id,
    subject_title:  section.subject_title,
    videos,
  };
}

module.exports = { getVideosBySection };
