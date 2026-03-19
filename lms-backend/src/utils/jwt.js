const jwt = require('jsonwebtoken');

/**
 * Sign a JWT access token.
 * Uses JWT_SECRET from env. Expires in 1 hour.
 * @param {{ id: number, email: string, name: string }} payload
 * @returns {string}
 */
function signToken(payload) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verify and decode a JWT token.
 * @param {string} token
 * @returns {{ id: number, email: string, name: string }}
 */
function verifyToken(token) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { signToken, verifyToken };
