const cron = require('node-cron');
const proxmoxService = require('./proxmox.service');
const Metric = require('../models/metric.model');

/**
 * MetricsService class to handle metrics collection and storage
 */
class MetricsService {
  constructor() {
    this.collectionInterval = process.env.METRICS_COLLECTION_INTERVAL || 5; // Default to 5 minutes
    this.isCollecting = false;
    this.collectionJob = null;
  }

  /**
   * Start metrics collection job
   */
  startCollection() {
    if (this.isCollecting) {
      console.log('Metrics collection is already running');
      return;
    }

    console.log(`Starting metrics collection job (every ${this.collectionInterval} minutes)`);

    // Schedule cron job to run at the specified interval
    this.collectionJob = cron.schedule(`*/${this.collectionInterval} * * * *`, async () => {
      try {
        console.log(`Running metrics collection at ${new Date().toISOString()}`);
        await this.collectAllMetrics();
      } catch (error) {
        console.error('Error in metrics collection job:', error);
      }
    });

    this.isCollecting = true;
  }

  /**
   * Stop metrics collection job
   */
  stopCollection() {
    if (!this.isCollecting || !this.collectionJob) {
      console.log('No metrics collection job is running');
      return;
    }

    this.collectionJob.stop();
    this.collectionJob = null;
    this.isCollecting = false;

    console.log('Metrics collection job stopped');
  }

  /**
   * Collect metrics from all clusters, nodes, VMs, and containers
   */
  async collectAllMetrics() {
    try {
      const clusters = proxmoxService.getClusters();

      for (const cluster of clusters) {
        try {
          // Get all nodes in the cluster
          const nodes = await proxmoxService.getNodes(cluster.id);

          for (const node of nodes) {
            try {
              // Collect node metrics
              await this.collectNodeMetrics(cluster.id, node.node);

              // Collect VM metrics
              const vms = await proxmoxService.getVMs(cluster.id, node.node);
              for (const vm of vms) {
                try {
                  await this.collectVMMetrics(cluster.id, node.node, vm.vmid, vm.name);
                } catch (vmError) {
                  console.error(`Error collecting VM metrics for ${vm.name} (${vm.vmid}):`, vmError);
                }
              }

              // Collect container metrics
              const containers = await proxmoxService.getContainers(cluster.id, node.node);
              for (const container of containers) {
                try {
                  await this.collectContainerMetrics(cluster.id, node.node, container.vmid, container.name);
                } catch (containerError) {
                  console.error(`Error collecting container metrics for ${container.name} (${container.vmid}):`, containerError);
                }
              }
            } catch (nodeError) {
              console.error(`Error collecting metrics for node ${node.node}:`, nodeError);
            }
          }
        } catch (clusterError) {
          console.error(`Error collecting metrics for cluster ${cluster.name}:`, clusterError);
        }
      }

      console.log('Metrics collection completed');
    } catch (error) {
      console.error('Error in collectAllMetrics:', error);
      throw error;
    }
  }

  /**
   * Collect metrics for a specific node
   * @param {Number} clusterId - Cluster ID
   * @param {String} nodeName - Node name
   */
  async collectNodeMetrics(clusterId, nodeName) {
    try {
      const nodeStats = await proxmoxService.getNodeStats(clusterId, nodeName);

      // Create metric document
      const metric = new Metric({
        clusterId,
        node: nodeName,
        type: 'node',
        name: nodeName,
        metrics: {
          cpu: {
            usage: nodeStats.cpu * 100, // Convert to percentage
            cores: nodeStats.cpuinfo?.cpus || 0
          },
          memory: {
            total: nodeStats.memory.total,
            used: nodeStats.memory.used,
            free: nodeStats.memory.free,
            usage: (nodeStats.memory.used / nodeStats.memory.total) * 100
          },
          disk: {
            total: nodeStats.rootfs.total,
            used: nodeStats.rootfs.used,
            free: nodeStats.rootfs.free,
            usage: (nodeStats.rootfs.used / nodeStats.rootfs.total) * 100
          },
          network: {
            in: 0, // Not available in node stats
            out: 0 // Not available in node stats
          },
          uptime: nodeStats.uptime,
          status: 'running' // Nodes are always running if we can get stats
        },
        timestamp: new Date()
      });

      await metric.save();
      console.log(`Saved metrics for node ${nodeName}`);
    } catch (error) {
      console.error(`Error collecting node metrics for ${nodeName}:`, error);
      throw error;
    }
  }

  /**
   * Collect metrics for a specific VM
   * @param {Number} clusterId - Cluster ID
   * @param {String} nodeName - Node name
   * @param {Number} vmid - VM ID
   * @param {String} vmName - VM name
   */
  async collectVMMetrics(clusterId, nodeName, vmid, vmName) {
    try {
      const vmStatus = await proxmoxService.getVMStatus(clusterId, nodeName, vmid);

      // Only collect metrics if VM is running
      if (vmStatus.status !== 'running') {
        // Save minimal metrics for non-running VMs
        const metric = new Metric({
          clusterId,
          node: nodeName,
          vmid,
          type: 'vm',
          name: vmName,
          metrics: {
            status: vmStatus.status
          },
          timestamp: new Date()
        });

        await metric.save();
        console.log(`Saved minimal metrics for VM ${vmName} (${vmid}) - status: ${vmStatus.status}`);
        return;
      }

      // Create metric document for running VM
      const metric = new Metric({
        clusterId,
        node: nodeName,
        vmid,
        type: 'vm',
        name: vmName,
        metrics: {
          cpu: {
            usage: vmStatus.cpu * 100, // Convert to percentage
            cores: vmStatus.cpus || 0
          },
          memory: {
            total: vmStatus.maxmem,
            used: vmStatus.mem,
            free: vmStatus.maxmem - vmStatus.mem,
            usage: (vmStatus.mem / vmStatus.maxmem) * 100
          },
          disk: {
            total: vmStatus.maxdisk,
            used: vmStatus.disk,
            free: vmStatus.maxdisk - vmStatus.disk,
            usage: (vmStatus.disk / vmStatus.maxdisk) * 100
          },
          network: {
            in: vmStatus.netin,
            out: vmStatus.netout
          },
          uptime: vmStatus.uptime,
          status: vmStatus.status
        },
        timestamp: new Date()
      });

      await metric.save();
      console.log(`Saved metrics for VM ${vmName} (${vmid})`);
    } catch (error) {
      console.error(`Error collecting VM metrics for ${vmName} (${vmid}):`, error);
      throw error;
    }
  }

  /**
   * Collect metrics for a specific container
   * @param {Number} clusterId - Cluster ID
   * @param {String} nodeName - Node name
   * @param {Number} vmid - Container ID
   * @param {String} containerName - Container name
   */
  async collectContainerMetrics(clusterId, nodeName, vmid, containerName) {
    try {
      const containerStatus = await proxmoxService.getContainerStatus(clusterId, nodeName, vmid);

      // Only collect metrics if container is running
      if (containerStatus.status !== 'running') {
        // Save minimal metrics for non-running containers
        const metric = new Metric({
          clusterId,
          node: nodeName,
          vmid,
          type: 'container',
          name: containerName,
          metrics: {
            status: containerStatus.status
          },
          timestamp: new Date()
        });

        await metric.save();
        console.log(`Saved minimal metrics for container ${containerName} (${vmid}) - status: ${containerStatus.status}`);
        return;
      }

      // Create metric document for running container
      const metric = new Metric({
        clusterId,
        node: nodeName,
        vmid,
        type: 'container',
        name: containerName,
        metrics: {
          cpu: {
            usage: containerStatus.cpu * 100, // Convert to percentage
            cores: containerStatus.cpus || 0
          },
          memory: {
            total: containerStatus.maxmem,
            used: containerStatus.mem,
            free: containerStatus.maxmem - containerStatus.mem,
            usage: (containerStatus.mem / containerStatus.maxmem) * 100
          },
          disk: {
            total: containerStatus.maxdisk,
            used: containerStatus.disk,
            free: containerStatus.maxdisk - containerStatus.disk,
            usage: (containerStatus.disk / containerStatus.maxdisk) * 100
          },
          network: {
            in: containerStatus.netin,
            out: containerStatus.netout
          },
          uptime: containerStatus.uptime,
          status: containerStatus.status
        },
        timestamp: new Date()
      });

      await metric.save();
      console.log(`Saved metrics for container ${containerName} (${vmid})`);
    } catch (error) {
      console.error(`Error collecting container metrics for ${containerName} (${vmid}):`, error);
      throw error;
    }
  }

  /**
   * Get metrics for a specific resource
   * @param {Object} query - Query parameters
   * @param {Number} limit - Maximum number of results to return
   * @returns {Promise<Array>} Metrics data
   */
  async getMetrics(query, limit = 100) {
    try {
      return await Metric.find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .exec();
    } catch (error) {
      console.error('Error getting metrics:', error);
      throw error;
    }
  }

  /**
   * Get aggregated metrics for a specific resource
   * @param {Object} query - Query parameters
   * @param {String} interval - Aggregation interval (hour, day, week)
   * @param {Number} duration - Duration in hours
   * @returns {Promise<Array>} Aggregated metrics data
   */
  async getAggregatedMetrics(query, interval = 'hour', duration = 24) {
    try {
      // Calculate start time based on duration
      const startTime = new Date();
      startTime.setHours(startTime.getHours() - duration);

      // Add timestamp filter to query
      const fullQuery = {
        ...query,
        timestamp: { $gte: startTime }
      };

      // Determine time grouping format based on interval
      let timeFormat;
      switch (interval) {
        case 'hour':
          timeFormat = { $dateToString: { format: '%Y-%m-%d %H:00', date: '$timestamp' } };
          break;
        case 'day':
          timeFormat = { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } };
          break;
        case 'week':
          timeFormat = {
            $dateToString: {
              format: '%Y-%U', // Year and week number
              date: '$timestamp'
            }
          };
          break;
        default:
          timeFormat = { $dateToString: { format: '%Y-%m-%d %H:00', date: '$timestamp' } };
      }

      // Perform aggregation
      return await Metric.aggregate([
        { $match: fullQuery },
        {
          $group: {
            _id: {
              timeGroup: timeFormat,
              clusterId: '$clusterId',
              node: '$node',
              vmid: '$vmid',
              type: '$type',
              name: '$name'
            },
            avgCpuUsage: { $avg: '$metrics.cpu.usage' },
            avgMemoryUsage: { $avg: '$metrics.memory.usage' },
            avgDiskUsage: { $avg: '$metrics.disk.usage' },
            avgNetworkIn: { $avg: '$metrics.network.in' },
            avgNetworkOut: { $avg: '$metrics.network.out' },
            lastStatus: { $last: '$metrics.status' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.timeGroup': 1 } }
      ]).exec();
    } catch (error) {
      console.error('Error getting aggregated metrics:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const metricsService = new MetricsService();
module.exports = metricsService;