const { verifyToken } = require('../utils/jwt');

/**
 * Auth middleware — protects routes by verifying the Bearer JWT.
 *
 * Usage:  router.get('/me', authMiddleware, controller)
 *
 * On success: attaches decoded user object to req.user
 * On failure: responds 401 immediately
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  // Expect: "Authorization: Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  const token = authHeader.slice(7); // strip "Bearer "

  try {
    const decoded = verifyToken(token);
    // Handle both JS auth ({ id, email, name }) and TS auth ({ sub: userId }) payloads
    req.user = { ...decoded, id: decoded.id ?? decoded.sub };
    console.log(`[authMiddleware] req.user.id=${req.user.id}`);
    next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Token has expired. Please log in again.'
        : 'Invalid token.';
    return res.status(401).json({ success: false, message });
  }
}

module.exports = authMiddleware;
