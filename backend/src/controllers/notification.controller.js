const notificationService = require('../services/notification.service');
const ApiError = require('../middleware/error.middleware').ApiError;

/**
 * Send a notification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.sendNotification = async (req, res, next) => {
  try {
    const { title, message, level, source, sourceId, channels } = req.body;

    if (!title || !message) {
      return next(new ApiError(400, 'Title and message are required'));
    }

    const notification = {
      title,
      message,
      level: level || 'info',
      source,
      sourceId
    };

    const result = await notificationService.sendNotification(notification, channels);

    res.status(200).json({
      success: result.success,
      message: 'Notification sent',
      channels: result.channels
    });
  } catch (error) {
    next(new ApiError(500, 'Error sending notification: ' + error.message));
  }
};

/**
 * Test notification channels
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.testNotification = async (req, res, next) => {
  try {
    const { channel } = req.params;

    // Validate channel
    if (!['email', 'discord', 'telegram', 'gotify', 'all'].includes(channel)) {
      return next(new ApiError(400, 'Invalid notification channel'));
    }

    // Create test notification
    const notification = {
      title: 'Test Notification',
      message: 'This is a test notification from ProxMonX. If you received this, your notification settings are working correctly.',
      level: 'info',
      source: 'System',
      sourceId: 'Test'
    };

    // Determine channels to test
    const channels = channel === 'all'
      ? ['email', 'discord', 'telegram', 'gotify']
      : [channel];

    const result = await notificationService.sendNotification(notification, channels);

    res.status(200).json({
      success: result.success,
      message: `Test notification sent to ${channel}`,
      channels: result.channels
    });
  } catch (error) {
    next(new ApiError(500, 'Error sending test notification: ' + error.message));
  }
};

/**
 * Get notification settings
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getSettings = async (req, res, next) => {
  try {
    // Get notification settings from environment variables
    const settings = {
      email: {
        enabled: process.env.EMAIL_ENABLED === 'true',
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true',
        user: process.env.EMAIL_USER,
        // Don't send password for security reasons
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        recipients: process.env.EMAIL_RECIPIENTS ? process.env.EMAIL_RECIPIENTS.split(',').map(email => email.trim()) : []
      },
      discord: {
        enabled: process.env.DISCORD_ENABLED === 'true',
        webhookUrl: process.env.DISCORD_WEBHOOK_URL ? '********' : '' // Mask the actual URL
      },
      telegram: {
        enabled: process.env.TELEGRAM_ENABLED === 'true',
        botToken: process.env.TELEGRAM_BOT_TOKEN ? '********' : '', // Mask the actual token
        chatId: process.env.TELEGRAM_CHAT_ID
      },
      gotify: {
        enabled: process.env.GOTIFY_ENABLED === 'true',
        serverUrl: process.env.GOTIFY_SERVER_URL,
        appToken: process.env.GOTIFY_APP_TOKEN ? '********' : '' // Mask the actual token
      }
    };

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(new ApiError(500, 'Error retrieving notification settings: ' + error.message));
  }
};