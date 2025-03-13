const mongoose = require('mongoose');

const metricSchema = new mongoose.Schema({
  clusterId: {
    type: Number,
    required: true,
    index: true
  },
  node: {
    type: String,
    required: true,
    index: true
  },
  vmid: {
    type: Number,
    required: false, // Not required for node metrics
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['node', 'vm', 'container'],
    index: true
  },
  name: {
    type: String,
    required: true
  },
  metrics: {
    // CPU metrics
    cpu: {
      usage: Number, // Percentage (0-100)
      cores: Number
    },
    // Memory metrics
    memory: {
      total: Number, // In bytes
      used: Number, // In bytes
      free: Number, // In bytes
      usage: Number // Percentage (0-100)
    },
    // Disk metrics
    disk: {
      total: Number, // In bytes
      used: Number, // In bytes
      free: Number, // In bytes
      usage: Number // Percentage (0-100)
    },
    // Network metrics
    network: {
      in: Number, // Bytes/s
      out: Number // Bytes/s
    },
    // Uptime in seconds
    uptime: Number,
    // Status (running, stopped, etc.)
    status: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Create compound index for efficient querying
metricSchema.index({ clusterId: 1, node: 1, vmid: 1, type: 1, timestamp: -1 });

// Create TTL index for automatic data cleanup based on retention policy
// This will automatically delete documents older than the retention period
metricSchema.index({ timestamp: 1 }, {
  expireAfterSeconds: process.env.METRICS_RETENTION_DAYS * 24 * 60 * 60 || 90 * 24 * 60 * 60 // Default to 90 days
});

const Metric = mongoose.model('Metric', metricSchema);

module.exports = Metric;