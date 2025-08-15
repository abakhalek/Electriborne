const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
  }],
  lastMessage: {
    content: String,
    sender: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: String,
      role: String,
    },
    timestamp: Date,
  },
  unreadCounts: {
    type: Map,
    of: Number,
    default: {},
  },
  type: { 
    type: String, 
    enum: ['general', 'quote', 'mission', 'report'], 
    default: 'general' 
  },
  relatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'type'
  },
}, { timestamps: true });

conversationSchema.statics.findByUser = function(userId) {
  return this.find({ 'participants.user': userId })
    .populate('participants.user', 'firstName lastName avatar')
    .sort({ 'lastMessage.timestamp': -1 });
};

conversationSchema.statics.findById = function(id) {
  return this.findOne({ _id: id })
    .populate('participants.user', 'firstName lastName avatar');
};

conversationSchema.methods.resetUnreadCount = function(userId) {
  this.unreadCounts.set(userId.toString(), 0);
  return this.save();
};

module.exports = mongoose.model('Conversation', conversationSchema);
