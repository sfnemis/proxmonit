const nodemailer = require('nodemailer');
const axios = require('axios');
const ApiError = require('../middleware/error.middleware').ApiError;

/**
 * NotificationService class to handle sending notifications through various channels
 */
class NotificationService {
  constructor() {
    // Initialize email transporter if email notifications are enabled
    if (process.env.EMAIL_ENABLED === 'true') {
      this.emailTransporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    }
  }

  /**
   * Send a notification through all enabled channels
   * @param {Object} notification - Notification object
   * @param {String} notification.title - Notification title
   * @param {String} notification.message - Notification message
   * @param {String} notification.level - Notification level (info, warning, error)
   * @param {String} notification.source - Source of the notification (e.g., 'vm', 'container', 'node')
   * @param {String} notification.sourceId - ID of the source (e.g., vmid, node name)
   * @param {Array} channels - Channels to send the notification through (email, discord, telegram, gotify)
   * @returns {Promise<Object>} Result of the notification sending
   */
  async sendNotification(notification, channels = ['email', 'discord', 'telegram', 'gotify']) {
    const results = {
      success: true,
      channels: {}
    };

    // Validate notification object
    if (!notification.title || !notification.message) {
      throw new ApiError(400, 'Notification title and message are required');
    }

    // Set default level if not provided
    notification.level = notification.level || 'info';

    // Send notifications through each enabled channel
    const promises = [];

    if (channels.includes('email') && process.env.EMAIL_ENABLED === 'true') {
      promises.push(
        this.sendEmailNotification(notification)
          .then(result => {
            results.channels.email = { success: true };
            return result;
          })
          .catch(error => {
            results.success = false;
            results.channels.email = { success: false, error: error.message };
            console.error('Error sending email notification:', error);
          })
      );
    }

    if (channels.includes('discord') && process.env.DISCORD_ENABLED === 'true') {
      promises.push(
        this.sendDiscordNotification(notification)
          .then(result => {
            results.channels.discord = { success: true };
            return result;
          })
          .catch(error => {
            results.success = false;
            results.channels.discord = { success: false, error: error.message };
            console.error('Error sending Discord notification:', error);
          })
      );
    }

    if (channels.includes('telegram') && process.env.TELEGRAM_ENABLED === 'true') {
      promises.push(
        this.sendTelegramNotification(notification)
          .then(result => {
            results.channels.telegram = { success: true };
            return result;
          })
          .catch(error => {
            results.success = false;
            results.channels.telegram = { success: false, error: error.message };
            console.error('Error sending Telegram notification:', error);
          })
      );
    }

    if (channels.includes('gotify') && process.env.GOTIFY_ENABLED === 'true') {
      promises.push(
        this.sendGotifyNotification(notification)
          .then(result => {
            results.channels.gotify = { success: true };
            return result;
          })
          .catch(error => {
            results.success = false;
            results.channels.gotify = { success: false, error: error.message };
            console.error('Error sending Gotify notification:', error);
          })
      );
    }

    // Wait for all notifications to be sent
    await Promise.all(promises);
    return results;
  }

  /**
   * Send an email notification
   * @param {Object} notification - Notification object
   * @returns {Promise<Object>} Result of the email sending
   */
  async sendEmailNotification(notification) {
    if (!this.emailTransporter) {
      throw new ApiError(500, 'Email transporter not initialized');
    }

    const recipients = process.env.EMAIL_RECIPIENTS.split(',').map(email => email.trim());
    if (recipients.length === 0) {
      throw new ApiError(500, 'No email recipients configured');
    }

    // Determine color based on notification level
    let levelColor = '#3498db'; // Default blue for info
    if (notification.level === 'warning') {
      levelColor = '#f39c12'; // Orange for warning
    } else if (notification.level === 'error') {
      levelColor = '#e74c3c'; // Red for error
    }

    // Create email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: ${levelColor}; color: white; padding: 10px 20px; border-radius: 5px 5px 0 0;">
          <h2 style="margin: 0;">${notification.title}</h2>
          <p style="margin: 5px 0 0 0; font-size: 14px;">
            Level: ${notification.level.toUpperCase()} |
            Source: ${notification.source || 'System'} ${notification.sourceId ? `(${notification.sourceId})` : ''}
          </p>
        </div>
        <div style="border: 1px solid #ddd; border-top: none; padding: 20px; border-radius: 0 0 5px 5px;">
          <p style="white-space: pre-line;">${notification.message}</p>
          <p style="color: #777; font-size: 12px; margin-top: 20px;">
            Sent from ProxMonX at ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    `;

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: recipients.join(','),
      subject: `[ProxMonX] ${notification.level.toUpperCase()}: ${notification.title}`,
      html: htmlContent,
      text: `${notification.title}\n\nLevel: ${notification.level.toUpperCase()}\nSource: ${notification.source || 'System'} ${notification.sourceId ? `(${notification.sourceId})` : ''}\n\n${notification.message}\n\nSent from ProxMonX at ${new Date().toLocaleString()}`
    };

    return await this.emailTransporter.sendMail(mailOptions);
  }

  /**
   * Send a Discord notification
   * @param {Object} notification - Notification object
   * @returns {Promise<Object>} Result of the Discord webhook
   */
  async sendDiscordNotification(notification) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      throw new ApiError(500, 'Discord webhook URL not configured');
    }

    // Determine color based on notification level
    let color = 0x3498db; // Default blue for info
    if (notification.level === 'warning') {
      color = 0xf39c12; // Orange for warning
    } else if (notification.level === 'error') {
      color = 0xe74c3c; // Red for error
    }

    // Create Discord embed
    const embed = {
      title: notification.title,
      description: notification.message,
      color: color,
      timestamp: new Date().toISOString(),
      footer: {
        text: 'ProxMonX Monitoring'
      },
      fields: [
        {
          name: 'Level',
          value: notification.level.toUpperCase(),
          inline: true
        }
      ]
    };

    // Add source field if available
    if (notification.source) {
      embed.fields.push({
        name: 'Source',
        value: `${notification.source} ${notification.sourceId ? `(${notification.sourceId})` : ''}`,
        inline: true
      });
    }

    // Send to Discord webhook
    return await axios.post(webhookUrl, {
      embeds: [embed]
    });
  }

  /**
   * Send a Telegram notification
   * @param {Object} notification - Notification object
   * @returns {Promise<Object>} Result of the Telegram API call
   */
  async sendTelegramNotification(notification) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      throw new ApiError(500, 'Telegram bot token or chat ID not configured');
    }

    // Create Telegram message
    let emoji = 'ℹ️'; // Default info emoji
    if (notification.level === 'warning') {
      emoji = '⚠️'; // Warning emoji
    } else if (notification.level === 'error') {
      emoji = '🚨'; // Error emoji
    }

    const message = `${emoji} *${notification.title}*\n\n` +
      `*Level:* ${notification.level.toUpperCase()}\n` +
      `*Source:* ${notification.source || 'System'} ${notification.sourceId ? `(${notification.sourceId})` : ''}\n\n` +
      `${notification.message}\n\n` +
      `_Sent from ProxMonX at ${new Date().toLocaleString()}_`;

    // Send to Telegram
    return await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    });
  }

  /**
   * Send a Gotify notification
   * @param {Object} notification - Notification object
   * @returns {Promise<Object>} Result of the Gotify API call
   */
  async sendGotifyNotification(notification) {
    const serverUrl = process.env.GOTIFY_SERVER_URL;
    const appToken = process.env.GOTIFY_APP_TOKEN;

    if (!serverUrl || !appToken) {
      throw new ApiError(500, 'Gotify server URL or app token not configured');
    }

    // Determine priority based on notification level
    let priority = 5; // Default normal priority
    if (notification.level === 'warning') {
      priority = 7; // Higher priority for warnings
    } else if (notification.level === 'error') {
      priority = 9; // Highest priority for errors
    }

    // Create Gotify message
    const message = {
      title: notification.title,
      message: `Level: ${notification.level.toUpperCase()}\nSource: ${notification.source || 'System'} ${notification.sourceId ? `(${notification.sourceId})` : ''}\n\n${notification.message}`,
      priority: priority
    };

    // Send to Gotify
    return await axios.post(`${serverUrl}/message`, message, {
      headers: {
        'X-Gotify-Key': appToken
      }
    });
  }
}

// Create and export a singleton instance
const notificationService = new NotificationService();
module.exports = notificationService;