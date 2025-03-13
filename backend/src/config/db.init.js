const mongoose = require('mongoose');
const User = require('../models/user.model');
require('dotenv').config();

/**
 * Initialize the database with an admin user if none exists
 */
const initializeDatabase = async () => {
  try {
    console.log('Checking for existing admin user...');

    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/proxmonx');
      console.log('Connected to MongoDB for initialization');
    }

    // Check if any admin user exists
    const adminExists = await User.findOne({ role: 'admin' });

    if (!adminExists) {
      console.log('No admin user found. Creating default admin user...');

      // Create default admin user
      const adminUser = new User({
        username: process.env.DEFAULT_ADMIN_USERNAME || 'admin',
        email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com',
        password: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123',
        role: 'admin',
        isActive: true
      });

      await adminUser.save();
      console.log('Default admin user created successfully');
    } else {
      console.log('Admin user already exists. Skipping creation.');
    }

    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};

module.exports = { initializeDatabase };