const jwt = require('jsonwebtoken');
const { ApiError } = require('./error.middleware');
const User = require('../models/user.model');

/**
 * Authentication middleware to protect routes
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication required. Please log in.');
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new ApiError(401, 'Authentication token missing');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by id
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      throw new ApiError(401, 'User not found or token invalid');
    }

    // Check if token is issued after password change
    if (user.passwordChangedAt) {
      const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);

      // If password was changed after token was issued
      if (decoded.iat < changedTimestamp) {
        throw new ApiError(401, 'Password recently changed. Please log in again.');
      }
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Invalid token. Please log in again.'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Your token has expired. Please log in again.'));
    }
    next(error);
  }
};

/**
 * Role-based authorization middleware
 * @param {...String} roles - Allowed roles
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action'));
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  authorizeRoles,
};