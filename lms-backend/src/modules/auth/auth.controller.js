const authService = require('./auth.service');
const { signToken } = require('../../utils/jwt');

// ── Helpers ──────────────────────────────────────────────────

/**
 * Basic input validation — returns an error message or null.
 * @param {object} fields
 * @returns {string|null}
 */
function validateRegisterInput({ name, email, password }) {
  if (!name || name.trim().length < 2)
    return 'Name must be at least 2 characters.';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return 'Please provide a valid email address.';
  if (!password || password.length < 8)
    return 'Password must be at least 8 characters.';
  return null;
}

function validateLoginInput({ email, password }) {
  if (!email || !password)
    return 'Email and password are required.';
  return null;
}

// ── Controllers ──────────────────────────────────────────────

/**
 * POST /api/auth/register
 */
async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    const validationError = validateRegisterInput({ name, email, password });
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const user = await authService.register({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Registration failed.',
    });
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    const validationError = validateLoginInput({ email, password });
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const { token, user } = await authService.login({
      email: email.toLowerCase().trim(),
      password,
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Login failed.',
    });
  }
}

/**
 * GET /api/auth/me  (protected)
 * req.user is attached by authMiddleware
 */
async function getMe(req, res) {
  try {
    // Fetch fresh data from DB rather than trusting the token payload alone
    const user = await authService.getUserById(req.user.id);
    return res.status(200).json({ success: true, user });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Could not fetch user.',
    });
  }
}

/**
 * PUT /api/auth/profile  (protected)
 */
async function updateProfile(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || name.trim().length < 2)
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters.' });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ success: false, message: 'Valid email required.' });
    if (password && password.length < 8)
      return res.status(400).json({ success: false, message: 'Password must be 8+ characters.' });

    const user = await authService.updateProfile(req.user.id, {
      name: name.trim(), email: email.toLowerCase().trim(), password: password || null,
    });
    // Issue a fresh token with updated name/email
    const token = signToken({ id: user.id, name: user.name, email: user.email });
    return res.status(200).json({ success: true, user, token });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/auth/dashboard  (protected)
 */
async function getDashboard(req, res) {
  try {
    const stats = await authService.getDashboardStats(req.user.id);
    return res.status(200).json({ success: true, data: stats });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
}

module.exports = { register, login, getMe, updateProfile, getDashboard };
