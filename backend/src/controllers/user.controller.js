const User = require('../models/user.model');
const ApiError = require('../middleware/error.middleware').ApiError;

/**
 * Get all users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password -passwordChangedAt -resetPasswordToken -resetPasswordExpire');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(new ApiError(500, 'Error retrieving users: ' + error.message));
  }
};

/**
 * Get user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -passwordChangedAt -resetPasswordToken -resetPasswordExpire');

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(new ApiError(500, 'Error retrieving user: ' + error.message));
  }
};

/**
 * Create a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.createUser = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return next(new ApiError(400, 'User with this email or username already exists'));
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'user'
    });

    // Remove sensitive fields
    user.password = undefined;
    user.passwordChangedAt = undefined;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(new ApiError(500, 'Error creating user: ' + error.message));
  }
};

/**
 * Update user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.updateUser = async (req, res, next) => {
  try {
    const { username, email, role, isActive, twoFactorEnabled } = req.body;

    // Build update object
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (twoFactorEnabled !== undefined) updateData.twoFactorEnabled = twoFactorEnabled;

    // Update user
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -passwordChangedAt -resetPasswordToken -resetPasswordExpire');

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(new ApiError(500, 'Error updating user: ' + error.message));
  }
};

/**
 * Delete user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    // Check if trying to delete the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return next(new ApiError(400, 'Cannot delete the last admin user'));
      }
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(new ApiError(500, 'Error deleting user: ' + error.message));
  }
};

/**
 * Update user profile (for current user)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { username, email } = req.body;

    // Build update object
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -passwordChangedAt -resetPasswordToken -resetPasswordExpire');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(new ApiError(500, 'Error updating profile: ' + error.message));
  }
};

/**
 * Enable/disable two-factor authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.toggleTwoFactor = async (req, res, next) => {
  try {
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return next(new ApiError(400, 'Enabled status must be a boolean'));
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { twoFactorEnabled: enabled },
      { new: true }
    ).select('-password -passwordChangedAt -resetPasswordToken -resetPasswordExpire');

    res.status(200).json({
      success: true,
      data: {
        twoFactorEnabled: user.twoFactorEnabled
      }
    });
  } catch (error) {
    next(new ApiError(500, 'Error updating two-factor authentication: ' + error.message));
  }
};