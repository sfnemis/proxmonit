const proxmoxService = require('../services/proxmox.service');
const { ApiError } = require('../middleware/error.middleware');

/**
 * Get all configured Proxmox clusters
 * @route GET /api/proxmox/clusters
 */
const getClusters = async (req, res, next) => {
  try {
    const clusters = proxmoxService.getClusters();

    res.status(200).json({
      status: 'success',
      data: {
        clusters
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all nodes in a cluster
 * @route GET /api/proxmox/clusters/:clusterId/nodes
 */
const getNodes = async (req, res, next) => {
  try {
    const { clusterId } = req.params;

    if (!clusterId) {
      throw new ApiError(400, 'Cluster ID is required');
    }

    const nodes = await proxmoxService.getNodes(parseInt(clusterId, 10));

    res.status(200).json({
      status: 'success',
      data: {
        nodes
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all VMs on a node
 * @route GET /api/proxmox/clusters/:clusterId/nodes/:node/vms
 */
const getVMs = async (req, res, next) => {
  try {
    const { clusterId, node } = req.params;

    if (!clusterId || !node) {
      throw new ApiError(400, 'Cluster ID and node name are required');
    }

    const vms = await proxmoxService.getVMs(parseInt(clusterId, 10), node);

    res.status(200).json({
      status: 'success',
      data: {
        vms
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all containers on a node
 * @route GET /api/proxmox/clusters/:clusterId/nodes/:node/containers
 */
const getContainers = async (req, res, next) => {
  try {
    const { clusterId, node } = req.params;

    if (!clusterId || !node) {
      throw new ApiError(400, 'Cluster ID and node name are required');
    }

    const containers = await proxmoxService.getContainers(parseInt(clusterId, 10), node);

    res.status(200).json({
      status: 'success',
      data: {
        containers
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get VM status
 * @route GET /api/proxmox/clusters/:clusterId/nodes/:node/vms/:vmid/status
 */
const getVMStatus = async (req, res, next) => {
  try {
    const { clusterId, node, vmid } = req.params;

    if (!clusterId || !node || !vmid) {
      throw new ApiError(400, 'Cluster ID, node name, and VM ID are required');
    }

    const status = await proxmoxService.getVMStatus(
      parseInt(clusterId, 10),
      node,
      parseInt(vmid, 10)
    );

    res.status(200).json({
      status: 'success',
      data: {
        status
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get container status
 * @route GET /api/proxmox/clusters/:clusterId/nodes/:node/containers/:vmid/status
 */
const getContainerStatus = async (req, res, next) => {
  try {
    const { clusterId, node, vmid } = req.params;

    if (!clusterId || !node || !vmid) {
      throw new ApiError(400, 'Cluster ID, node name, and container ID are required');
    }

    const status = await proxmoxService.getContainerStatus(
      parseInt(clusterId, 10),
      node,
      parseInt(vmid, 10)
    );

    res.status(200).json({
      status: 'success',
      data: {
        status
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Start a VM
 * @route POST /api/proxmox/clusters/:clusterId/nodes/:node/vms/:vmid/start
 */
const startVM = async (req, res, next) => {
  try {
    const { clusterId, node, vmid } = req.params;

    if (!clusterId || !node || !vmid) {
      throw new ApiError(400, 'Cluster ID, node name, and VM ID are required');
    }

    const result = await proxmoxService.startVM(
      parseInt(clusterId, 10),
      node,
      parseInt(vmid, 10)
    );

    res.status(200).json({
      status: 'success',
      message: 'VM start operation initiated',
      data: {
        task: result
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Stop a VM
 * @route POST /api/proxmox/clusters/:clusterId/nodes/:node/vms/:vmid/stop
 */
const stopVM = async (req, res, next) => {
  try {
    const { clusterId, node, vmid } = req.params;

    if (!clusterId || !node || !vmid) {
      throw new ApiError(400, 'Cluster ID, node name, and VM ID are required');
    }

    const result = await proxmoxService.stopVM(
      parseInt(clusterId, 10),
      node,
      parseInt(vmid, 10)
    );

    res.status(200).json({
      status: 'success',
      message: 'VM stop operation initiated',
      data: {
        task: result
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Start a container
 * @route POST /api/proxmox/clusters/:clusterId/nodes/:node/containers/:vmid/start
 */
const startContainer = async (req, res, next) => {
  try {
    const { clusterId, node, vmid } = req.params;

    if (!clusterId || !node || !vmid) {
      throw new ApiError(400, 'Cluster ID, node name, and container ID are required');
    }

    const result = await proxmoxService.startContainer(
      parseInt(clusterId, 10),
      node,
      parseInt(vmid, 10)
    );

    res.status(200).json({
      status: 'success',
      message: 'Container start operation initiated',
      data: {
        task: result
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Stop a container
 * @route POST /api/proxmox/clusters/:clusterId/nodes/:node/containers/:vmid/stop
 */
const stopContainer = async (req, res, next) => {
  try {
    const { clusterId, node, vmid } = req.params;

    if (!clusterId || !node || !vmid) {
      throw new ApiError(400, 'Cluster ID, node name, and container ID are required');
    }

    const result = await proxmoxService.stopContainer(
      parseInt(clusterId, 10),
      node,
      parseInt(vmid, 10)
    );

    res.status(200).json({
      status: 'success',
      message: 'Container stop operation initiated',
      data: {
        task: result
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get node statistics
 * @route GET /api/proxmox/clusters/:clusterId/nodes/:node/stats
 */
const getNodeStats = async (req, res, next) => {
  try {
    const { clusterId, node } = req.params;

    if (!clusterId || !node) {
      throw new ApiError(400, 'Cluster ID and node name are required');
    }

    const stats = await proxmoxService.getNodeStats(
      parseInt(clusterId, 10),
      node
    );

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Test connection to a specific Proxmox cluster
 * @route GET /api/proxmox/clusters/:clusterId/test
 */
const testConnection = async (req, res, next) => {
  try {
    const { clusterId } = req.params;

    if (!clusterId) {
      throw new ApiError(400, 'Cluster ID is required');
    }

    const result = await proxmoxService.testConnection(parseInt(clusterId, 10));

    res.status(200).json({
      status: 'success',
      message: 'Connection successful',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};