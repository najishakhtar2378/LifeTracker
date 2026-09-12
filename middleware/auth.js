const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes — verify JWT and attach user to request.
 * Usage: router.get('/protected', auth, controller)
 */
const auth = async (req, res, next) => {
  let token;

  // Extract token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // No token provided
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized — no token provided',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (exclude password)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — user not found',
      });
    }

    next();
  } catch (error) {
    // Token expired or invalid
    const message =
      error.name === 'TokenExpiredError'
        ? 'Not authorized — token expired'
        : 'Not authorized — invalid token';

    return res.status(401).json({
      success: false,
      message,
    });
  }
};

module.exports = auth;
