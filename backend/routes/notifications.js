const express = require('express');
const webpush = require('web-push');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Configure web push (only if VAPID keys are provided)
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && 
    process.env.VAPID_PUBLIC_KEY !== 'your_vapid_public_key' && 
    process.env.VAPID_PRIVATE_KEY !== 'your_vapid_private_key') {
  try {
    webpush.setVapidDetails(
      process.env.VAPID_EMAIL || 'mailto:test@example.com',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  } catch (error) {
    console.warn('VAPID configuration failed:', error.message);
  }
}

// Configure email transporter (only if credentials are provided)
let emailTransporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS && 
    process.env.EMAIL_USER !== 'your_email@gmail.com' && 
    process.env.EMAIL_PASS !== 'your_app_password') {
  try {
    emailTransporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } catch (error) {
    console.warn('Email configuration failed:', error.message);
  }
}

// @desc    Subscribe to push notifications
// @route   POST /api/notifications/subscribe
// @access  Private
router.post('/subscribe', protect, async (req, res) => {
  try {
    const { subscription } = req.body;

    if (!subscription) {
      return res.status(400).json({
        success: false,
        message: 'Subscription object is required'
      });
    }

    // Update user's push subscription
    await User.findByIdAndUpdate(req.user._id, {
      subscription: {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth
        }
      }
    });

    res.json({
      success: true,
      message: 'Successfully subscribed to push notifications'
    });
  } catch (error) {
    console.error('Subscribe to notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while subscribing to notifications'
    });
  }
});

// @desc    Unsubscribe from push notifications
// @route   POST /api/notifications/unsubscribe
// @access  Private
router.post('/unsubscribe', protect, async (req, res) => {
  try {
    // Remove user's push subscription
    await User.findByIdAndUpdate(req.user._id, {
      $unset: { subscription: 1 }
    });

    res.json({
      success: true,
      message: 'Successfully unsubscribed from push notifications'
    });
  } catch (error) {
    console.error('Unsubscribe from notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while unsubscribing from notifications'
    });
  }
});

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, type, limit = 20, page = 1 } = req.query;

    const filter = { user: req.user._id };
    if (status) filter.status = status;
    if (type) filter.type = type;

    const notifications = await Notification.find(filter)
      .populate('alert', 'title type severity')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(filter);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notifications'
    });
  }
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.markAsRead();
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating notification'
    });
  }
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, status: { $in: ['sent', 'delivered'] } },
      { status: 'read', readAt: new Date() }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating notifications'
    });
  }
});

// @desc    Send test notification
// @route   POST /api/notifications/test
// @access  Private
router.post('/test', protect, async (req, res) => {
  try {
    const { type = 'push' } = req.body;

    if (type === 'push' && req.user.subscription) {
      const payload = JSON.stringify({
        title: 'Test Notification',
        body: 'This is a test notification from the Disaster Management System',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        data: {
          url: '/dashboard'
        }
      });

      await webpush.sendNotification(req.user.subscription, payload);

      res.json({
        success: true,
        message: 'Test push notification sent'
      });
    } else if (type === 'email') {
      if (!emailTransporter) {
        return res.status(400).json({
          success: false,
          message: 'Email service not configured'
        });
      }

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: req.user.email,
        subject: 'Test Notification - Disaster Management System',
        html: `
          <h2>Test Email Notification</h2>
          <p>This is a test email notification from the Disaster Management System.</p>
          <p>If you received this email, your email notifications are working correctly.</p>
          <p>Best regards,<br>Disaster Management Team</p>
        `
      };

      await emailTransporter.sendMail(mailOptions);

      res.json({
        success: true,
        message: 'Test email notification sent'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid notification type or no subscription found'
      });
    }
  } catch (error) {
    console.error('Send test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending test notification'
    });
  }
});

// @desc    Send emergency notification to all users
// @route   POST /api/notifications/emergency
// @access  Private (Admin only)
router.post('/emergency', protect, authorize('admin'), async (req, res) => {
  try {
    const { title, message, alertId, type = 'all' } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    // Get users based on type
    let users;
    if (type === 'all') {
      users = await User.find({ isActive: true });
    } else {
      // You can add more specific user filtering here
      users = await User.find({ isActive: true, role: type });
    }

    const notifications = [];

    for (const user of users) {
      // Create notification record
      const notification = new Notification({
        user: user._id,
        alert: alertId,
        type: 'push',
        title,
        message,
        priority: 'urgent',
        status: 'pending'
      });

      // Send push notification if user has subscription
      if (user.subscription) {
        try {
          const payload = JSON.stringify({
            title,
            body: message,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            data: {
              alertId,
              url: '/alerts'
            }
          });

          await webpush.sendNotification(user.subscription, payload);
          notification.markAsSent();
        } catch (error) {
          console.error('Push notification error for user:', user._id, error);
          notification.markAsFailed(error.message);
        }
      }

      // Send email notification if enabled and email is configured
      if (user.preferences?.emailNotifications && emailTransporter) {
        try {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: `URGENT: ${title}`,
            html: `
              <h2>${title}</h2>
              <p>${message}</p>
              <p>This is an emergency notification from the Disaster Management System.</p>
              <p>Please take appropriate action and stay safe.</p>
              <p>Best regards,<br>Disaster Management Team</p>
            `
          };

          await emailTransporter.sendMail(mailOptions);
        } catch (error) {
          console.error('Email notification error for user:', user._id, error);
        }
      }

      notifications.push(notification);
    }

    // Save all notifications
    await Notification.insertMany(notifications);

    res.json({
      success: true,
      message: `Emergency notification sent to ${users.length} users`,
      data: {
        sentTo: users.length,
        notifications: notifications.length
      }
    });
  } catch (error) {
    console.error('Send emergency notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending emergency notification'
    });
  }
});

// @desc    Get notification statistics
// @route   GET /api/notifications/stats
// @access  Private (Admin only)
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const stats = await Notification.aggregate([
      {
        $facet: {
          totalNotifications: [
            { $count: 'count' }
          ],
          notificationsByType: [
            {
              $group: {
                _id: '$type',
                count: { $sum: 1 }
              }
            }
          ],
          notificationsByStatus: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ],
          recentNotifications: [
            {
              $match: {
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
              }
            },
            { $count: 'count' }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      data: { stats: stats[0] }
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notification statistics'
    });
  }
});

module.exports = router;
