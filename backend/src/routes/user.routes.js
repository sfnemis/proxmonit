const express = require('express');
const userController = require('../controllers/user.controller');
const { authMiddleware, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply authentication middleware to all user routes
router.use(authMiddleware);

// Routes for user management (admin only)
router.route('/')
  .get(authorizeRoles('admin'), userController.getAllUsers)
  .post(authorizeRoles('admin'), userController.createUser);

router.route('/:id')
  .get(authorizeRoles('admin'), userController.getUserById)
  .put(authorizeRoles('admin'), userController.updateUser)
  .delete(authorizeRoles('admin'), userController.deleteUser);

// Routes for user profile (accessible to the authenticated user)
router.put('/profile/update', userController.updateProfile);
router.put('/profile/two-factor', userController.toggleTwoFactor);

module.exports = router;