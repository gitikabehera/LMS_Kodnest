'use strict';
const pool = require('../../config/db');

async function getAllSubjects(userId) {
  const [rows] = await pool.query(
    `SELECT s.id, s.title, s.slug, s.description,
            IF(e.id IS NOT NULL, 1, 0) AS enrolled,
            (SELECT COUNT(*) FROM videos v INNER JOIN sections sec ON sec.id = v.section_id WHERE sec.subject_id = s.id) AS video_count,
            (SELECT COUNT(*) FROM assessments a INNER JOIN sections sec ON sec.id = a.section_id WHERE sec.subject_id = s.id) AS assessment_count
     FROM subjects s
     LEFT JOIN enrollments e ON e.subject_id = s.id AND e.user_id = ?
     WHERE s.is_published = 1
     ORDER BY s.id ASC`,
    [userId]
  );
  // Normalize enrolled to boolean
  return rows.map((r) => ({ ...r, enrolled: r.enrolled === 1 || r.enrolled === true }));
}

async function getSubjectWithTree(subjectId, userId) {
  const [enrollment] = await pool.query(
    'SELECT id FROM enrollments WHERE subject_id = ? AND user_id = ?',
    [subjectId, userId]
  );
  if (!enrollment.length) {
    const err = new Error('Please enroll to access this course.');
    err.statusCode = 403;
    throw err;
  }

  const [subjectRows] = await pool.query(
    'SELECT id, title, slug, description FROM subjects WHERE id = ? AND is_published = 1',
    [subjectId]
  );
  if (!subjectRows.length) {
    const err = new Error('Subject not found.');
    err.statusCode = 404;
    throw err;
  }

  const subject = subjectRows[0];

  const [sections] = await pool.query(
    'SELECT id, title, order_index FROM sections WHERE subject_id = ? ORDER BY order_index ASC',
    [subjectId]
  );

  const [videos] = await pool.query(
    `SELECT v.id, v.section_id, v.title, v.description,
            v.youtube_url, v.order_index, v.duration_seconds,
            COALESCE(vp.is_completed, 0) AS is_completed
     FROM videos v
     INNER JOIN sections s ON s.id = v.section_id
     LEFT JOIN video_progress vp ON vp.video_id = v.id AND vp.user_id = ?
     WHERE s.subject_id = ?
     ORDER BY s.order_index ASC, v.order_index ASC`,
    [userId, subjectId]
  );

  const [assessments] = await pool.query(
    `SELECT a.id, a.section_id, a.title, a.description
     FROM assessments a
     INNER JOIN sections s ON s.id = a.section_id
     WHERE s.subject_id = ?
     ORDER BY s.order_index ASC`,
    [subjectId]
  );

  const videosBySection = {};
  for (const v of videos) {
    if (!videosBySection[v.section_id]) videosBySection[v.section_id] = [];
    videosBySection[v.section_id].push(v);
  }

  const assessmentsBySection = {};
  for (const a of assessments) {
    if (!assessmentsBySection[a.section_id]) assessmentsBySection[a.section_id] = [];
    assessmentsBySection[a.section_id].push(a);
  }

  subject.sections = sections.map((sec) => ({
    ...sec,
    videos:      videosBySection[sec.id]      || [],
    assessments: assessmentsBySection[sec.id] || [],
  }));

  return subject;
}

async function enrollUser(userId, subjectId) {
  const [subjectRows] = await pool.query(
    'SELECT id FROM subjects WHERE id = ? AND is_published = 1',
    [subjectId]
  );
  if (!subjectRows.length) {
    const err = new Error('Subject not found.');
    err.statusCode = 404;
    throw err;
  }

  await pool.query(
    'INSERT IGNORE INTO enrollments (user_id, subject_id) VALUES (?, ?)',
    [userId, subjectId]
  );

  // Return the full subject tree so the frontend can use it immediately
  return getSubjectWithTree(subjectId, userId);
}

async function getAwards(userId) {
  const [rows] = await pool.query(
    `SELECT a.id, a.title, a.issued_at, s.title AS subject_title, s.slug
     FROM awards a
     INNER JOIN subjects s ON s.id = a.subject_id
     WHERE a.user_id = ?
     ORDER BY a.issued_at DESC`,
    [userId]
  );
  return rows;
}

module.exports = { getAllSubjects, getSubjectWithTree, enrollUser, getAwards };
