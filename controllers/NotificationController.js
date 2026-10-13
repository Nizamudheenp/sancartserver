const mongoose = require('mongoose');
const Notification = require('../models/NotificationModel');
const User = require('../models/UserModel');
const NotificationResponseDTO = require('../dtos/notificationdto/NotificationResponseDTO');
const UpdateNotificationPreferencesDTO = require('../dtos/notificationdto/UpdateNotificationPreferencesDTO');

/**
 * Fetch latest 20 notifications for logged-in user or admin
 */
exports.getNotifications = async (req, res, next) => {
  try {
    const isAdmin = Boolean(req.user?.isAdmin);
    const userId = req.user?.id || req.user?._id;

    const filter = isAdmin
      ? { $or: [{ forAdmin: true }, { recipient: userId }] }
      : { recipient: userId };

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      ...filter,
      isRead: false,
    });

    const dtoList = notifications.map((n) => new NotificationResponseDTO(n));

    res.status(200).json({
      notifications: dtoList,
      unreadCount,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Fetch unread count lightweight check
 */
exports.getUnreadCount = async (req, res, next) => {
  try {
    const isAdmin = Boolean(req.user?.isAdmin);
    const userId = req.user?.id || req.user?._id;

    const filter = isAdmin
      ? { $or: [{ forAdmin: true }, { recipient: userId }] }
      : { recipient: userId };

    const unreadCount = await Notification.countDocuments({
      ...filter,
      isRead: false,
    });

    res.status(200).json({ unreadCount });
  } catch (err) {
    next(err);
  }
};

/**
 * Mark a single notification as read
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid notification ID format' });
    }

    const isAdmin = Boolean(req.user?.isAdmin);
    const userId = req.user?.id || req.user?._id;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Verify ownership
    const isOwner =
      (isAdmin && notification.forAdmin) ||
      (notification.recipient && notification.recipient.toString() === userId.toString());

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Unauthorized to modify this notification' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      message: 'Notification marked as read',
      notification: new NotificationResponseDTO(notification),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Mark all notifications as read in bulk
 */
exports.markAllAsRead = async (req, res, next) => {
  try {
    const isAdmin = Boolean(req.user?.isAdmin);
    const userId = req.user?.id || req.user?._id;

    const filter = isAdmin
      ? { $or: [{ forAdmin: true }, { recipient: userId }], isRead: false }
      : { recipient: userId, isRead: false };

    await Notification.updateMany(filter, { $set: { isRead: true } });

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

/**
 * Clear/delete all notifications for user or admin
 */
exports.clearAllNotifications = async (req, res, next) => {
  try {
    const isAdmin = Boolean(req.user?.isAdmin);
    const userId = req.user?.id || req.user?._id;

    const filter = isAdmin
      ? { $or: [{ forAdmin: true }, { recipient: userId }] }
      : { recipient: userId };

    await Notification.deleteMany(filter);

    res.status(200).json({ message: 'All notifications cleared successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a single notification
 */
exports.deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid notification ID format' });
    }

    const isAdmin = Boolean(req.user?.isAdmin);
    const userId = req.user?.id || req.user?._id;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const isOwner =
      (isAdmin && notification.forAdmin) ||
      (notification.recipient && notification.recipient.toString() === userId.toString());

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Unauthorized to delete this notification' });
    }

    await Notification.findByIdAndDelete(id);

    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * Fetch user notification preferences
 */
exports.getPreferences = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId).select('notificationPreferences');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(
      user.notificationPreferences || {
        emailNotifications: true,
        inAppNotifications: true,
      }
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Update user notification preferences
 */
exports.updatePreferences = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const dto = new UpdateNotificationPreferencesDTO(req.body);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.notificationPreferences) {
      user.notificationPreferences = {
        emailNotifications: true,
        inAppNotifications: true,
      };
    }

    if (dto.emailNotifications !== undefined) {
      user.notificationPreferences.emailNotifications = dto.emailNotifications;
    }

    if (dto.inAppNotifications !== undefined) {
      user.notificationPreferences.inAppNotifications = dto.inAppNotifications;
    }

    await user.save();

    res.status(200).json({
      message: 'Preferences updated successfully',
      preferences: user.notificationPreferences,
    });
  } catch (err) {
    next(err);
  }
};
