const express = require('express');
const router = express.Router();
const { Notification } = require('../models');
const { authMiddleware } = require('../middlewares/authMiddleware');

// GET /api/notifications/my - Get notifications for the authenticated user
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20); // Limit to latest 20 notifications

    res.json({
      success: true,
      data: { notifications },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Error fetching notifications', error: error.message });
  }
});

// PATCH /api/notifications/:id/read - Mark a notification as read
router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found or not authorized' });
    }

    res.json({ success: true, message: 'Notification marked as read', data: { notification } });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Error marking notification as read', error: error.message });
  }
});

// PATCH /api/notifications/mark-all-read - Mark all notifications as read for the authenticated user
router.patch('/mark-all-read', authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, message: 'Error marking all notifications as read', error: error.message });
  }
});

module.exports = router;