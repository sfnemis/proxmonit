const express = require('express');
const notificationController = require('../controllers/notification.controller');
const { authMiddleware, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply authentication middleware to all notification routes
router.use(authMiddleware);

// Routes for sending notifications (admin only)
router.post('/send', authorizeRoles('admin'), notificationController.sendNotification);
router.post('/test/:channel', authorizeRoles('admin'), notificationController.testNotification);

// Routes for retrieving notification settings (accessible to all authenticated users)
router.get('/settings', notificationController.getSettings);

module.exports = router;