const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // For system notifications
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['mission_assigned', 'status_update', 'new_message', 'system', 'quote_response'],
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  relatedEntity: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedEntity.type',
    },
    type: {
      type: String,
      enum: ['Mission', 'Quote', 'Request', 'Report'],
    },
  },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);