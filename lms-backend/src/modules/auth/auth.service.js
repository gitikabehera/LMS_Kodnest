const pool = require('../../config/db');
const { hashPassword, comparePassword } = require('../../utils/password');
const { signToken } = require('../../utils/jwt');

/**
 * Register a new user.
 * @param {{ name: string, email: string, password: string }} data
 * @returns {Promise<{ id: number, name: string, email: string }>}
 */
async function register({ name, email, password }) {
  // 1. Check if email already exists
  const [existing] = await pool.query(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );
  if (existing.length > 0) {
    const err = new Error('Email is already registered.');
    err.statusCode = 409;
    throw err;
  }

  // 2. Hash password
  const password_hash = await hashPassword(password);

  // 3. Insert user
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
    [name, email, password_hash]
  );

  return { id: result.insertId, name, email };
}

/**
 * Login an existing user.
 * @param {{ email: string, password: string }} data
 * @returns {Promise<{ token: string, user: object }>}
 */
async function login({ email, password }) {
  // 1. Find user by email
  const [rows] = await pool.query(
    'SELECT id, name, email, password_hash FROM users WHERE email = ?',
    [email]
  );
  const user = rows[0];

  // Use same error message for both cases to prevent user enumeration
  if (!user) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  // 2. Compare password
  const isMatch = await comparePassword(password, user.password_hash);
  if (!isMatch) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  // 3. Sign JWT — do NOT include password_hash in payload
  const token = signToken({ id: user.id, name: user.name, email: user.email });

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email },
  };
}

/**
 * Get a user by ID (used by /me route).
 * @param {number} userId
 * @returns {Promise<{ id: number, name: string, email: string, created_at: string }>}
 */
async function getUserById(userId) {
  const [rows] = await pool.query(
    'SELECT id, name, email, created_at FROM users WHERE id = ?',
    [userId]
  );
  if (!rows.length) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }
  return rows[0];
}

async function updateProfile(userId, { name, email, password }) {
  // Check email not taken by another user
  if (email) {
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]
    );
    if (existing.length) {
      const err = new Error('Email already in use by another account.');
      err.statusCode = 409; throw err;
    }
  }
  if (password) {
    const { hashPassword } = require('../../utils/password');
    const hash = await hashPassword(password);
    await pool.query(
      'UPDATE users SET name = ?, email = ?, password_hash = ? WHERE id = ?',
      [name, email, hash, userId]
    );
  } else {
    await pool.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, userId]);
  }
  return getUserById(userId);
}

async function getDashboardStats(userId) {
  // Enrolled courses with per-course progress
  const [enrolled] = await pool.query(
    `SELECT s.id, s.title, s.slug, s.description,
            COUNT(DISTINCT v.id)                                          AS total_videos,
            COUNT(DISTINCT CASE WHEN vp.is_completed = 1 THEN v.id END)  AS completed_videos
     FROM enrollments e
     JOIN subjects s  ON s.id = e.subject_id
     LEFT JOIN sections sec ON sec.subject_id = s.id
     LEFT JOIN videos v     ON v.section_id = sec.id
     LEFT JOIN video_progress vp ON vp.video_id = v.id AND vp.user_id = ?
     WHERE e.user_id = ?
     GROUP BY s.id, s.title, s.slug, s.description`,
    [userId, userId]
  );
  const [totalSubjects] = await pool.query('SELECT COUNT(*) AS c FROM subjects WHERE is_published = 1');
  const [awards]        = await pool.query('SELECT COUNT(*) AS c FROM awards WHERE user_id = ?', [userId]);
  return {
    totalCourses:    totalSubjects[0].c,
    enrolledCourses: enrolled.length,
    certificates:    awards[0].c,
    enrolled,
  };
}

module.exports = { register, login, getUserById, updateProfile, getDashboardStats };
