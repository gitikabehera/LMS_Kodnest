const pool = require('../../config/db');

/**
 * Get all sections for a given subject, ordered by order_index.
 * Also returns the total video count per section.
 * @param {number} subjectId
 * @returns {Promise<Array>}
 */
async function getSectionsBySubject(subjectId) {
  // Verify subject exists first
  const [subjectRows] = await pool.query(
    'SELECT id FROM subjects WHERE id = ? AND is_published = 1',
    [subjectId]
  );
  if (!subjectRows.length) {
    const err = new Error('Subject not found.');
    err.statusCode = 404;
    throw err;
  }

  const [rows] = await pool.query(
    `SELECT
       s.id,
       s.title,
       s.order_index,
       s.created_at,
       COUNT(v.id) AS video_count
     FROM sections s
     LEFT JOIN videos v ON v.section_id = s.id
     WHERE s.subject_id = ?
     GROUP BY s.id, s.title, s.order_index, s.created_at
     ORDER BY s.order_index ASC`,
    [subjectId]
  );

  return rows;
}

module.exports = { getSectionsBySubject };
