const proxmoxApi = require('proxmox-api').default;
const { ApiError } = require('../middleware/error.middleware');
const proxmoxConfig = require('../config/proxmox.config');

/**
 * ProxmoxService class to handle interactions with Proxmox API
 * Uses proxmox-api library version 1.1.1
 */
class ProxmoxService {
  constructor() {
    this.clusters = this.loadClusters();
    this.connections = {};
    this.initializeConnections();
  }

  /**
   * Load cluster configurations from config file
   */
  loadClusters() {
    const clusters = proxmoxConfig.clusters;

    if (clusters.length === 0) {
      console.warn('No Proxmox clusters configured');
    } else {
      console.log(`Loaded ${clusters.length} Proxmox cluster configurations`);
    }

    return clusters;
  }

  /**
   * Initialize connections to all configured clusters
   * Creates API clients for each Proxmox cluster
   */
  initializeConnections() {
    this.clusters.forEach(cluster => {
      try {
        // Use proxmoxApi for the API client factory (updated for proxmox-api v1.1.1)
        this.connections[cluster.id] = proxmoxApi({
          host: cluster.host.replace(/^https?:\/\//, ''), // Remove protocol if present
          username: cluster.user,
          password: cluster.tokenValue,
          insecure: !cluster.verifySSL // Disable TLS verification if verifySSL is false
        });

        console.log(`Initialized connection to Proxmox cluster: ${cluster.name}`);
      } catch (error) {
        console.error(`Failed to initialize connection to Proxmox cluster ${cluster.name}:`, error);
      }
    });
  }

  /**
   * Get a connection to a specific cluster
   * @param {Number} clusterId - Cluster ID
   * @returns {Object} Proxmox API connection
   */
  getConnection(clusterId) {
    const connection = this.connections[clusterId];

    if (!connection) {
      throw new ApiError(404, `Proxmox cluster with ID ${clusterId} not found or not connected`);
    }

    return connection;
  }

  /**
   * Get all configured clusters
   * @returns {Array} List of clusters
   */
  getClusters() {
    return this.clusters.map(cluster => ({
      id: cluster.id,
      name: cluster.name,
      host: cluster.host,
      user: cluster.user,
      connected: !!this.connections[cluster.id]
    }));
  }

  /**
   * Get nodes in a cluster
   * @param {Number} clusterId - Cluster ID
   * @returns {Promise<Array>} List of nodes
   */
  async getNodes(clusterId) {
    try {
      const connection = this.getConnection(clusterId);
      const response = await connection.nodes.$get();
      return response;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Get virtual machines on a node
   * @param {Number} clusterId - Cluster ID
   * @param {String} node - Node name
   * @returns {Promise<Array>} List of VMs
   */
  async getVMs(clusterId, node) {
    try {
      const connection = this.getConnection(clusterId);
      const response = await connection.nodes.$(node).qemu.$get();
      return response;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Get containers on a node
   * @param {Number} clusterId - Cluster ID
   * @param {String} node - Node name
   * @returns {Promise<Array>} List of containers
   */
  async getContainers(clusterId, node) {
    try {
      const connection = this.getConnection(clusterId);
      const response = await connection.nodes.$(node).lxc.$get();
      return response;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Get VM status
   * @param {Number} clusterId - Cluster ID
   * @param {String} node - Node name
   * @param {Number} vmid - VM ID
   * @returns {Promise<Object>} VM status
   */
  async getVMStatus(clusterId, node, vmid) {
    try {
      const connection = this.getConnection(clusterId);
      const response = await connection.nodes.$(node).qemu.$(vmid).status.current.$get();
      return response;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Get container status
   * @param {Number} clusterId - Cluster ID
   * @param {String} node - Node name
   * @param {Number} vmid - Container ID
   * @returns {Promise<Object>} Container status
   */
  async getContainerStatus(clusterId, node, vmid) {
    try {
      const connection = this.getConnection(clusterId);
      const response = await connection.nodes.$(node).lxc.$(vmid).status.current.$get();
      return response;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Start a VM
   * @param {Number} clusterId - Cluster ID
   * @param {String} node - Node name
   * @param {Number} vmid - VM ID
   * @returns {Promise<Object>} Task information
   */
  async startVM(clusterId, node, vmid) {
    try {
      const connection = this.getConnection(clusterId);
      const response = await connection.nodes.$(node).qemu.$(vmid).status.start.$post();
      return response;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Stop a VM
   * @param {Number} clusterId - Cluster ID
   * @param {String} node - Node name
   * @param {Number} vmid - VM ID
   * @returns {Promise<Object>} Task information
   */
  async stopVM(clusterId, node, vmid) {
    try {
      const connection = this.getConnection(clusterId);
      const response = await connection.nodes.$(node).qemu.$(vmid).status.stop.$post();
      return response;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Start a container
   * @param {Number} clusterId - Cluster ID
   * @param {String} node - Node name
   * @param {Number} vmid - Container ID
   * @returns {Promise<Object>} Task information
   */
  async startContainer(clusterId, node, vmid) {
    try {
      const connection = this.getConnection(clusterId);
      const response = await connection.nodes.$(node).lxc.$(vmid).status.start.$post();
      return response;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Stop a container
   * @param {Number} clusterId - Cluster ID
   * @param {String} node - Node name
   * @param {Number} vmid - Container ID
   * @returns {Promise<Object>} Task information
   */
  async stopContainer(clusterId, node, vmid) {
    try {
      const connection = this.getConnection(clusterId);
      const response = await connection.nodes.$(node).lxc.$(vmid).status.stop.$post();
      return response;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Get node statistics
   * @param {Number} clusterId - Cluster ID
   * @param {String} node - Node name
   * @returns {Promise<Object>} Node statistics
   */
  async getNodeStats(clusterId, node) {
    try {
      const connection = this.getConnection(clusterId);
      const response = await connection.nodes.$(node).status.$get();
      return response;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Test connection to a specific cluster
   * @param {Number} clusterId - Cluster ID
   * @returns {Promise<Object>} Connection test result
   */
  async testConnection(clusterId) {
    try {
      console.log(`Testing connection to Proxmox cluster ID: ${clusterId}`);
      const connection = this.getConnection(clusterId);

      // A simple API call to test the connection (updated for proxmox-api v1.1.1)
      const version = await connection.version.$get();
      console.log(`Connection successful. Proxmox version: ${JSON.stringify(version)}`);

      return {
        success: true,
        version: version
      };
    } catch (error) {
      console.error(`Connection test failed for cluster ID ${clusterId}:`, error);
      this.handleApiError(error);
    }
  }

  /**
   * Handle API errors
   * @param {Error} error - Error object
   * @throws {ApiError} - API error
   */
  handleApiError(error) {
    console.error('Proxmox API Error:', error);

    // Check for network errors
    if (error.message && (
      error.message.includes('EHOSTUNREACH') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('FaILED to call') ||
      error.message.includes('connect EHOSTUNREACH')
    )) {
      throw new ApiError(503, 'Cannot connect to Proxmox server. Please check if the server is running and accessible.');
    }

    // Handle other errors
    throw new ApiError(500, 'Failed to communicate with Proxmox API');
  }
}

// Create and export a singleton instance
const proxmoxService = new ProxmoxService();
module.exports = proxmoxService;