const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const proxmoxRoutes = require('./routes/proxmox.routes');
const metricsRoutes = require('./routes/metrics.routes');
const notificationRoutes = require('./routes/notification.routes');

// Import middleware
const { errorHandler } = require('./middleware/error.middleware');
const { authMiddleware } = require('./middleware/auth.middleware');

// Import services
const metricsService = require('./services/metrics.service');
const { initializeDatabase } = require('./config/db.init');

// Create Express app
const app = express();

// Set up middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(morgan('dev')); // HTTP request logger

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/proxmonx')
  .then(() => {
    console.log('Connected to MongoDB');

    // Initialize database with default admin user
    initializeDatabase()
      .then(initialized => {
        if (initialized) {
          console.log('Database initialization completed');
        } else {
          console.error('Database initialization failed');
        }
      });

    // Start metrics collection if enabled
    if (process.env.METRICS_COLLECTION_ENABLED === 'true') {
      metricsService.startCollection();
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/proxmox', proxmoxRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      metricsCollection: metricsService.isCollecting ? 'running' : 'stopped'
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // In production, you might want to exit the process
  // process.exit(1);
});

module.exports = app;