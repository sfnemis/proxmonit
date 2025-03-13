const fs = require('fs');
const path = require('path');
const { ApiError } = require('../middleware/error.middleware');
const proxmoxConfig = require('../config/proxmox.config');

/**
 * Get application settings
 * @route GET /api/settings
 */
const getSettings = async (req, res, next) => {
  try {
    // Get the current settings from the config
    const settings = {
      proxmox: {
        clusters: proxmoxConfig.clusters.map(cluster => ({
          id: cluster.id,
          name: cluster.name,
          url: cluster.host,
          username: cluster.user,
          apiToken: '********', // Don't send actual token value
          verifySSL: cluster.verifySSL
        }))
      }
    };

    res.status(200).json({
      status: 'success',
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Proxmox settings
 * @route PUT /api/settings/proxmox
 */
const updateProxmoxSettings = async (req, res, next) => {
  try {
    const { clusters } = req.body;

    if (!clusters || !Array.isArray(clusters)) {
      throw new ApiError(400, 'Clusters array is required');
    }

    // Update clusters array with new configuration
    const updatedClusters = clusters.map((cluster, index) => {
      return {
        id: index + 1,
        name: cluster.name,
        host: cluster.url,
        user: cluster.username,
        tokenName: 'proxmonit', // Use a fixed token name
        tokenValue: cluster.apiToken,
        verifySSL: !!cluster.verifySSL
      };
    });

    // Create updated config object
    const updatedConfig = {
      clusters: updatedClusters
    };

    // Write the updated configuration to file
    const configPath = path.join(__dirname, '../config/proxmox.config.js');
    const configContent = `/**
 * Proxmox configuration for the application
 * Defined explicitly to avoid environment variable loading issues
 */
module.exports = ${JSON.stringify(updatedConfig, null, 2)};`;

    fs.writeFileSync(configPath, configContent);

    // Restart the Proxmox service to apply changes
    // In a production environment, you might want to use a more elegant solution
    const ProxmoxService = require('../services/proxmox.service');

    // Reinitialize connections with new configuration
    ProxmoxService.reload();

    res.status(200).json({
      status: 'success',
      message: 'Proxmox settings updated successfully',
      data: {
        clusters: ProxmoxService.getClusters()
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateProxmoxSettings
};