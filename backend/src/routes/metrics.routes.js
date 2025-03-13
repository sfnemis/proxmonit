const express = require('express');
const metricsController = require('../controllers/metrics.controller');
const { authMiddleware, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply authentication middleware to all metrics routes
router.use(authMiddleware);

// Routes for metrics collection management (admin only)
router.post('/start', authorizeRoles('admin'), metricsController.startCollection);
router.post('/stop', authorizeRoles('admin'), metricsController.stopCollection);
router.post('/collect', authorizeRoles('admin'), metricsController.collectNow);

// Routes for retrieving metrics (accessible to all authenticated users)
router.get('/', metricsController.getMetrics);
router.get('/aggregated', metricsController.getAggregatedMetrics);
router.get('/latest', metricsController.getLatestMetrics);
router.get('/historical', metricsController.getHistoricalMetrics);

module.exports = router;