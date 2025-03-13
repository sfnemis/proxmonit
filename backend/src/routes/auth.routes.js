const express = require('express');
const {
  register,
  login,
  getMe,
  updatePassword,
  forgotPassword,
  resetPassword
} = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

// Protected routes
router.use(authMiddleware); // Apply auth middleware to all routes below
router.get('/me', getMe);
router.patch('/update-password', updatePassword);

module.exports = router;