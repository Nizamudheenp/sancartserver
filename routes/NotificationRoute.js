const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/AuthMiddleware');
const notificationController = require('../controllers/NotificationController');

// All notification endpoints require authenticated user or admin
router.get('/', verifyToken, notificationController.getNotifications);
router.get('/unread-count', verifyToken, notificationController.getUnreadCount);
router.patch('/mark-all-read', verifyToken, notificationController.markAllAsRead);
router.patch('/:id/read', verifyToken, notificationController.markAsRead);
router.delete('/clear-all', verifyToken, notificationController.clearAllNotifications);
router.delete('/:id', verifyToken, notificationController.deleteNotification);

// User notification preferences
router.get('/preferences', verifyToken, notificationController.getPreferences);
router.put('/preferences', verifyToken, notificationController.updatePreferences);

module.exports = router;
