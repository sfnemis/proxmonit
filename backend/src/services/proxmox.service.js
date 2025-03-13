const proxmox = require('proxmox-api');
const { ApiError } = require('../middleware/error.middleware');

/**
 * ProxmoxService class to handle interactions with Proxmox API
 */
class ProxmoxService {
  constructor() {
    this.clusters = this.loadClusters();
    this.connections = {};
    this.initializeConnections();
  }

  /**
   * Load cluster configurations from environment variables
   */
  loadClusters() {
    const clusters = [];
    let i = 1;

    // Look for cluster configurations in environment variables
    while (process.env[`PROXMOX_CLUSTER_${i}_NAME`]) {
      clusters.push({
        id: i,
        name: process.env[`PROXMOX_CLUSTER_${i}_NAME`],
        host: process.env[`PROXMOX_CLUSTER_${i}_HOST`],
        user: process.env[`PROXMOX_CLUSTER_${i}_USER`],
        tokenName: process.env[`PROXMOX_CLUSTER_${i}_TOKEN_NAME`],
        tokenValue: process.env[`PROXMOX_CLUSTER_${i}_TOKEN_VALUE`],
        verifySSL: process.env[`PROXMOX_CLUSTER_${i}_VERIFY_SSL`] === 'true'
      });
      i++;
    }

    if (clusters.length === 0) {
      console.warn('No Proxmox clusters configured in environment variables');
    } else {
      console.log(`Loaded ${clusters.length} Proxmox cluster configurations`);
    }

    return clusters;
  }

  /**
   * Initialize connections to all configured clusters
   */
  initializeConnections() {
    this.clusters.forEach(cluster => {
      try {
        // Updated to use the correct API based on proxmox-api documentation
        this.connections[cluster.id] = proxmox.default({
          host: cluster.host.replace(/^https?:\/\//, ''), // Remove protocol if present
          tokenID: `${cluster.user}!${cluster.tokenName}`,
          tokenSecret: cluster.tokenValue,
          insecure: true // Disable TLS verification for testing
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
      const response = await connection.get('/nodes');
      return response.data;
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
      const response = await connection.get(`/nodes/${node}/qemu`);
      return response.data;
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
      const response = await connection.get(`/nodes/${node}/lxc`);
      return response.data;
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
      const response = await connection.get(`/nodes/${node}/qemu/${vmid}/status/current`);
      return response.data;
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
      const response = await connection.get(`/nodes/${node}/lxc/${vmid}/status/current`);
      return response.data;
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
      const response = await connection.post(`/nodes/${node}/qemu/${vmid}/status/start`);
      return response.data;
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
      const response = await connection.post(`/nodes/${node}/qemu/${vmid}/status/stop`);
      return response.data;
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
      const response = await connection.post(`/nodes/${node}/lxc/${vmid}/status/start`);
      return response.data;
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
      const response = await connection.post(`/nodes/${node}/lxc/${vmid}/status/stop`);
      return response.data;
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
      const response = await connection.get(`/nodes/${node}/status`);
      return response.data;
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

      // A simple API call to test the connection
      const version = await connection.get('/version');
      console.log(`Connection successful. Proxmox version: ${JSON.stringify(version.data)}`);

      return {
        success: true,
        version: version.data
      };
    } catch (error) {
      console.error(`Connection test failed for cluster ID ${clusterId}:`, error);
      this.handleApiError(error);
    }
  }

  /**
   * Handle API errors
   * @param {Error} error - Error object
   */
  handleApiError(error) {
    console.error('Proxmox API Error:', error);

    if (error.response) {
      throw new ApiError(
        error.response.status || 500,
        error.response.data?.message || 'Proxmox API error'
      );
    }

    throw new ApiError(500, 'Failed to communicate with Proxmox API');
  }
}

// Create and export a singleton instance
const proxmoxService = new ProxmoxService();
module.exports = proxmoxService;