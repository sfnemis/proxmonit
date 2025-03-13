const express = require('express');
const { getSettings, updateProxmoxSettings } = require('../controllers/settings.controller');
const { authMiddleware, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(authMiddleware);

// Only admin users can modify settings
router.route('/')
  .get(getSettings);

router.route('/proxmox')
  .put(restrictTo('admin'), updateProxmoxSettings);

module.exports = router;