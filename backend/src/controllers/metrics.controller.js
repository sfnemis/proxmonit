const metricsService = require('../services/metrics.service');
const ApiError = require('../middleware/error.middleware').ApiError;

/**
 * Start metrics collection
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.startCollection = async (req, res, next) => {
  try {
    metricsService.startCollection();
    res.status(200).json({
      success: true,
      message: 'Metrics collection started'
    });
  } catch (error) {
    next(new ApiError(500, 'Error starting metrics collection: ' + error.message));
  }
};

/**
 * Stop metrics collection
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.stopCollection = async (req, res, next) => {
  try {
    metricsService.stopCollection();
    res.status(200).json({
      success: true,
      message: 'Metrics collection stopped'
    });
  } catch (error) {
    next(new ApiError(500, 'Error stopping metrics collection: ' + error.message));
  }
};

/**
 * Trigger immediate metrics collection
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.collectNow = async (req, res, next) => {
  try {
    await metricsService.collectAllMetrics();
    res.status(200).json({
      success: true,
      message: 'Metrics collection triggered successfully'
    });
  } catch (error) {
    next(new ApiError(500, 'Error collecting metrics: ' + error.message));
  }
};

/**
 * Get metrics for a specific resource
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getMetrics = async (req, res, next) => {
  try {
    const { clusterId, node, vmid, type, name, limit } = req.query;

    // Build query based on provided parameters
    const query = {};
    if (clusterId) query.clusterId = clusterId;
    if (node) query.node = node;
    if (vmid) query.vmid = parseInt(vmid);
    if (type) query.type = type;
    if (name) query.name = name;

    // Get metrics
    const metrics = await metricsService.getMetrics(
      query,
      limit ? parseInt(limit) : 100
    );

    res.status(200).json({
      success: true,
      count: metrics.length,
      data: metrics
    });
  } catch (error) {
    next(new ApiError(500, 'Error retrieving metrics: ' + error.message));
  }
};

/**
 * Get aggregated metrics for a specific resource
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getAggregatedMetrics = async (req, res, next) => {
  try {
    const { clusterId, node, vmid, type, name, interval, duration } = req.query;

    // Build query based on provided parameters
    const query = {};
    if (clusterId) query.clusterId = clusterId;
    if (node) query.node = node;
    if (vmid) query.vmid = parseInt(vmid);
    if (type) query.type = type;
    if (name) query.name = name;

    // Get aggregated metrics
    const metrics = await metricsService.getAggregatedMetrics(
      query,
      interval || 'hour',
      duration ? parseInt(duration) : 24
    );

    res.status(200).json({
      success: true,
      count: metrics.length,
      data: metrics
    });
  } catch (error) {
    next(new ApiError(500, 'Error retrieving aggregated metrics: ' + error.message));
  }
};

/**
 * Get latest metrics for all resources
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getLatestMetrics = async (req, res, next) => {
  try {
    const { clusterId, type } = req.query;

    // Build query based on provided parameters
    const query = {};
    if (clusterId) query.clusterId = clusterId;
    if (type) query.type = type;

    // Use aggregation to get the latest metric for each resource
    const Metric = require('../models/metric.model');
    const latestMetrics = await Metric.aggregate([
      { $match: query },
      {
        $sort: {
          clusterId: 1,
          node: 1,
          vmid: 1,
          type: 1,
          name: 1,
          timestamp: -1
        }
      },
      {
        $group: {
          _id: {
            clusterId: '$clusterId',
            node: '$node',
            vmid: '$vmid',
            type: '$type',
            name: '$name'
          },
          latestMetric: { $first: '$$ROOT' }
        }
      },
      { $replaceRoot: { newRoot: '$latestMetric' } },
      { $sort: { type: 1, name: 1 } }
    ]).exec();

    res.status(200).json({
      success: true,
      count: latestMetrics.length,
      data: latestMetrics
    });
  } catch (error) {
    next(new ApiError(500, 'Error retrieving latest metrics: ' + error.message));
  }
};

/**
 * Get historical metrics for a specific resource
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getHistoricalMetrics = async (req, res, next) => {
  try {
    const { clusterId, node, vmid, type, name, metric, duration } = req.query;

    if (!metric) {
      return next(new ApiError(400, 'Metric type is required (cpu, memory, disk, network)'));
    }

    // Build query based on provided parameters
    const query = {};
    if (clusterId) query.clusterId = clusterId;
    if (node) query.node = node;
    if (vmid) query.vmid = parseInt(vmid);
    if (type) query.type = type;
    if (name) query.name = name;

    // Calculate start time based on duration (default to 24 hours)
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - (duration ? parseInt(duration) : 24));

    // Add timestamp filter to query
    query.timestamp = { $gte: startTime };

    // Get metrics
    const Metric = require('../models/metric.model');
    const metrics = await Metric.find(query)
      .select(`timestamp metrics.${metric} metrics.status`)
      .sort({ timestamp: 1 })
      .exec();

    // Format the response data for easier consumption by charts
    const formattedData = metrics.map(m => {
      const result = {
        timestamp: m.timestamp,
        status: m.metrics.status
      };

      // Add the requested metric data
      switch (metric) {
        case 'cpu':
          result.usage = m.metrics.cpu?.usage || 0;
          result.cores = m.metrics.cpu?.cores || 0;
          break;
        case 'memory':
          result.total = m.metrics.memory?.total || 0;
          result.used = m.metrics.memory?.used || 0;
          result.free = m.metrics.memory?.free || 0;
          result.usage = m.metrics.memory?.usage || 0;
          break;
        case 'disk':
          result.total = m.metrics.disk?.total || 0;
          result.used = m.metrics.disk?.used || 0;
          result.free = m.metrics.disk?.free || 0;
          result.usage = m.metrics.disk?.usage || 0;
          break;
        case 'network':
          result.in = m.metrics.network?.in || 0;
          result.out = m.metrics.network?.out || 0;
          break;
        default:
          // If metric doesn't match any specific category, try to get it directly
          result[metric] = m.metrics[metric] || 0;
      }

      return result;
    });

    res.status(200).json({
      success: true,
      count: formattedData.length,
      metric: metric,
      data: formattedData
    });
  } catch (error) {
    next(new ApiError(500, 'Error retrieving historical metrics: ' + error.message));
  }
};