const express = require('express');
const router = express.Router();
const { Message, User, Mission, Conversation } = require('../models');

const upload = require('../middlewares/uploadMiddleware');
const Notification = require('../models/Notification');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { body, validationResult } = require('express-validator');

// Validation for creating a conversation
const createConversationValidation = [
  body('recipients').isArray({ min: 1 }).withMessage('At least one recipient is required'),
  body('recipients.*').isMongoId().withMessage('Invalid recipient ID'),
  body('content').trim().notEmpty().withMessage('Message content cannot be empty'),
];

// POST /api/messages/conversations - Create a new conversation
router.post('/conversations', authMiddleware, createConversationValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Invalid data', errors: errors.array() });
    }

    const { recipients, content, subject } = req.body;
    const sender = req.user;

    const participants = [...new Set([sender.id, ...recipients])];

    const participantDetails = await User.find({ '_id': { $in: participants } }).select('firstName lastName email role');

    const newConversation = new Conversation({
      subject: subject || 'Nouvelle conversation',
      participants: participantDetails.map(p => ({ user: p._id, name: `${p.firstName} ${p.lastName}`, role: p.role })),
    });

    const newMessage = new Message({
      sender: sender.id,
      recipients: recipients,
      content: content,
      conversation: newConversation._id,
    });

    newConversation.lastMessage = {
      content: newMessage.content,
      sender: {
        id: sender.id,
        name: `${sender.firstName} ${sender.lastName}`,
        role: sender.role,
      },
      timestamp: new Date(),
    };

    await newMessage.save();
    await newConversation.save();

    res.status(201).json({ success: true, message: 'Conversation created successfully', data: { conversation: newConversation } });

  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ success: false, message: 'Error creating conversation', error: error.message });
  }
});

// GET /api/messages/conversations - Get conversations for the authenticated user
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const conversations = await Conversation.findByUser(req.user.id);
    res.json({ success: true, data: { conversations } });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ success: false, message: 'Error fetching conversations', error: error.message });
  }
});
  

// GET /api/messages/conversations/:id - Get a single conversation
router.get('/conversations/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findById(id)
      .lean(); // Use lean() to get plain JavaScript objects

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const messages = await Message.find({ conversation: id })
      .populate('sender', 'firstName lastName avatar')
      .lean() // Use lean() for messages as well
      .sort({ createdAt: 'asc' });

    // If using lean(), conversation is already a plain object, no need for .toObject()
    conversation.messages = messages;

    res.json({ success: true, data: { conversation: conversation } });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    // Send the actual error message and stack to the frontend for debugging
    res.status(500).json({
      success: false,
      message: `Server Error: ${error.message}`, // More prominent error message
      detailedError: error.message,
      stack: error.stack // Include stack for detailed debugging
    });
  }
});

// POST /api/messages/conversations/:id - Send a message in a conversation
router.post('/conversations/:id', authMiddleware, upload.fields([{ name: 'content', maxCount: 1 }, { name: 'attachments', maxCount: 10 }]), [
  body('content').trim().notEmpty().withMessage('Message content cannot be empty'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Invalid data', errors: errors.array() });
    }

    const { content } = req.body;
    const { id } = req.params;
    const sender = req.user;
    const attachments = req.files && req.files.attachments ? req.files.attachments : [];

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const newMessage = new Message({
      sender: sender.id,
      recipients: conversation.participants.map(p => p.user).filter(pId => pId.toString() !== sender.id.toString()),
      content: content,
      conversation: conversation._id,
      attachments: attachments.map(file => ({
        name: file.originalname,
        url: `/uploads/attachments/${file.filename}`,
        type: file.mimetype
      }))
    });

    conversation.lastMessage = {
      content: newMessage.content,
      sender: {
        id: sender.id,
        name: `${sender.firstName} ${sender.lastName}`,
        role: sender.role,
      },
      timestamp: new Date(),
    };

    await newMessage.save();
    await conversation.save();

    res.status(201).json({ success: true, message: 'Message sent successfully', data: { message: newMessage } });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Error sending message', error: error.message });
  }
});
// PATCH /api/messages/conversations/:id/read - Mark a conversation as read
router.patch('/conversations/:id/read', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    await conversation.resetUnreadCount(req.user.id);

    res.json({ success: true, message: 'Conversation marked as read' });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    res.status(500).json({ success: false, message: 'Error marking conversation as read', error: error.message });
  }
});


// The old routes are left below for now to avoid breaking other parts of the app

// POST /api/messages/send - Send a new message
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { content, recipients, mission } = req.body;

    const newMessage = new Message({
      sender: req.user.id,
      recipients,
      content,
      mission,
    });

    await newMessage.save();

    res.status(201).json({ success: true, message: 'Message sent successfully', data: { message: newMessage } });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Error sending message', error: error.message });
  }
});

// GET /api/messages/my - Get messages for the authenticated user
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ recipients: req.user.id })
      .populate('sender', 'firstName lastName email')
      .populate('recipients', 'firstName lastName email')
      .populate('mission', 'missionNumber')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { messages } });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Error fetching messages', error: error.message });
  }
});

module.exports = (ioInstance) => {
  return router;
};
