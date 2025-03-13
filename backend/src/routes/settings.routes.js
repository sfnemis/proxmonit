const express = require('express');
const { getSettings, updateProxmoxSettings } = require('../controllers/settings.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(authMiddleware);

// Routes
router.route('/')
  .get(getSettings);

router.route('/proxmox')
  .put(updateProxmoxSettings);

module.exports = router;