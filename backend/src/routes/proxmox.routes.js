const express = require('express');
const {
  getClusters,
  getNodes,
  getVMs,
  getContainers,
  getVMStatus,
  getContainerStatus,
  startVM,
  stopVM,
  startContainer,
  stopContainer,
  getNodeStats,
  testConnection
} = require('../controllers/proxmox.controller');
const { authMiddleware, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Cluster routes
router.get('/clusters', getClusters);
router.get('/clusters/:clusterId/test', testConnection);
router.get('/clusters/:clusterId/nodes', getNodes);

// VM routes
router.get('/clusters/:clusterId/nodes/:node/vms', getVMs);
router.get('/clusters/:clusterId/nodes/:node/vms/:vmid/status', getVMStatus);
router.post('/clusters/:clusterId/nodes/:node/vms/:vmid/start', authorizeRoles('admin'), startVM);
router.post('/clusters/:clusterId/nodes/:node/vms/:vmid/stop', authorizeRoles('admin'), stopVM);

// Container routes
router.get('/clusters/:clusterId/nodes/:node/containers', getContainers);
router.get('/clusters/:clusterId/nodes/:node/containers/:vmid/status', getContainerStatus);
router.post('/clusters/:clusterId/nodes/:node/containers/:vmid/start', authorizeRoles('admin'), startContainer);
router.post('/clusters/:clusterId/nodes/:node/containers/:vmid/stop', authorizeRoles('admin'), stopContainer);

// Node routes
router.get('/clusters/:clusterId/nodes/:node/stats', getNodeStats);

module.exports = router;