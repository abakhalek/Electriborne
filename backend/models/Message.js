const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  content: {
    type: String,
    required: true,
  },
  mission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission',
    default: null, // For mission-specific chats
  },
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);