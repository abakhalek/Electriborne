const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const Mission = require('../models/Mission');
const Report = require('../models/Report');
const Quote = require('../models/Quote');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

// @route   GET /api/dashboard/technician
// @desc    Get technician dashboard data
// @access  Private (technician)
router.get('/technician', authMiddleware, async (req, res) => {
  if (req.user.role !== 'technician') {
    return res.status(403).json({ msg: 'Access denied' });
  }

  try {
    const technicianId = req.user.id;

    // 1. Today's Missions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayMissions = await Mission.find({
      technicianId: technicianId,
      scheduledDate: { $gte: today, $lt: tomorrow },
      status: 'pending' // Only show pending missions for acceptance
    })
      .populate('clientId', 'firstName lastName address phone') // Populate address and phone
      .populate('quoteId', 'quoteNumber _id')
      .populate('serviceType', 'name') // Populate serviceType
      .sort({ scheduledDate: 1 });

    // 2. Stats
    const todayMissionsCount = todayMissions.length;
    const pendingMissionsCount = await Mission.countDocuments({ technicianId: technicianId, status: 'pending' });
    const completedMissionsCount = await Mission.countDocuments({ technicianId: technicianId, status: 'completed' });

    // 3. Recent Reports
    const recentReports = await Report.find()
      .populate({ 
        path: 'mission', 
        match: { technicianId: technicianId },
        select: 'type',
        populate: { 
          path: 'clientId', 
          select: 'firstName lastName' 
        } 
      })
      .sort({ createdAt: -1 })
      .limit(5);

    const filteredReports = recentReports.filter(report => report.mission);

    // 4. Pending Quotes
    const pendingQuotesCount = await Quote.countDocuments({ technicianId: technicianId, status: 'sent' });

    // 5. Unread Messages
    const conversations = await Conversation.find({ 'participants.user': technicianId });
    let unreadMessagesCount = 0;
    conversations.forEach(conv => {
      unreadMessagesCount += conv.unreadCounts.get(technicianId.toString()) || 0;
    });

    // 6. Availability
    const technician = await User.findById(technicianId).select('availability');
    const availabilityStatus = technician.availability ? technician.availability.status : 'unavailable';
    const nextDayOff = technician.availability ? technician.availability.nextDayOff : null;

    res.json({
      todayMissions,
      todayMissionsCount,
      pendingMissionsCount,
      completedMissionsCount,
      estimatedTime: 'N/A', // Placeholder
      satisfaction: 4.9, // Placeholder
      recentReports: filteredReports,
      pendingQuotesCount,
      unreadMessagesCount,
      availabilityStatus,
      nextDayOff,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;