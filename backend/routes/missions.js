const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Mission = require('../models/Mission');
const Invoice = require('../models/Invoice');
const Company = require('../models/Company');
const Quote = require('../models/Quote');
const User = require('../models/User');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');
const { body, validationResult } = require('express-validator');
const { io } = require('../server');
const Notification = require('../models/Notification');

// Validation rules
const createMissionValidation = [
  body('serviceType').notEmpty().withMessage('Le type de service est requis').isMongoId().withMessage('Service type invalide'),
  body('scheduledDate').isISO8601().toDate().withMessage('Date invalide'),
  body('address').trim().notEmpty().withMessage('L\'adresse est requise'),
  body('clientId').notEmpty().withMessage('Le client est requis').isMongoId().withMessage('Client invalide'),
  body('technicianId').notEmpty().withMessage('Le technicien est requis').isMongoId().withMessage('Technicien invalide'),
  body('quoteId').notEmpty().withMessage('Le devis est requis').isMongoId().withMessage('Devis invalide'),
];

const updateMissionValidation = [
  body('status').optional().isIn(['pending', 'accepted', 'in_progress', 'completed', 'cancelled']).withMessage('Statut invalide'),
  body('scheduledDate').optional().isISO8601().toDate().withMessage('Date invalide'),
  body('serviceType').optional().isMongoId().withMessage('Service type invalide'),
  body('address').optional().trim().notEmpty().withMessage('L\'adresse est requise'),
  body('clientId').optional().isMongoId().withMessage('Client invalide'),
  body('technicianId').optional().isMongoId().withMessage('Technicien invalide'),
  body('quoteId').optional().isMongoId().withMessage('Devis invalide'),
  body('details').optional().trim(),
];

// GET /api/missions - Get all missions
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const filter = {};
    if (req.user.role === 'client') {
      filter.clientId = req.user.id;
    } else if (req.user.role === 'technician') {
      filter.technicianId = req.user.id;
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      const users = await User.find({ $or: [{ firstName: searchRegex }, { lastName: searchRegex }] }).select('_id');
      const userIds = users.map(u => u._id);

      filter.$or = [
        { missionNumber: searchRegex },
        { address: searchRegex },
        { clientId: { $in: userIds } },
        { technicianId: { $in: userIds } },
      ];
    }

    const missions = await Mission.find(filter)
      .populate('clientId technicianId quoteId serviceType')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Mission.countDocuments(filter);

    res.json({
      success: true,
      data: {
        missions,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching missions:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// GET /api/missions/:id - Get a single mission
router.get('/:id', authMiddleware, async (req, res) => {
  console.log('GET /api/missions/:id - Received ID:', req.params.id);
  try {
    const mission = await Mission.findById(req.params.id).populate('clientId technicianId quoteId serviceType');
    if (!mission) {
      return res.status(404).json({ success: false, message: 'Mission non trouvée' });
    }

    if (req.user.role === 'client' && mission.clientId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Accès non autorisé' });
    }

    if (req.user.role === 'technician' && mission.technicianId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Accès non autorisé' });
    }

    res.json({ success: true, data: mission });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// POST /api/missions - Create a new mission
router.post('/', authMiddleware, roleMiddleware(['admin']), createMissionValidation, async (req, res) => {
  console.log('--- POST /api/missions ---');
  console.log('Request Body:', req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { missionNumber, ...missionData } = req.body;

    if (missionData.invoiceId && !mongoose.Types.ObjectId.isValid(missionData.invoiceId)) {
      delete missionData.invoiceId;
    }

    const newMissionNumber = `MISS-${Date.now()}`;
    const mission = new Mission({ ...missionData, missionNumber: newMissionNumber });
    
    console.log('Attempting to save mission:', mission);
    await mission.save();
    console.log('Mission saved successfully');

    // Create notification for assigned technician
    const assignedTechnician = await User.findById(mission.technicianId);
    if (assignedTechnician) {
      const notification = new Notification({
        recipient: assignedTechnician._id,
        message: `Une nouvelle mission vous a été assignée: ${mission.missionNumber}`,
        type: 'mission_assigned',
        relatedEntity: {
          id: mission._id,
          type: 'Mission',
        },
      });
      await notification.save();
      io.to(assignedTechnician._id.toString()).emit('newNotification', notification);
      console.log(`Notification sent to technician ${assignedTechnician.email}`);
    }

    // Update the status of the associated quote to 'mission_assigned'
    if (mission.quoteId) {
      console.log('Updating quote status...');
      await Quote.findByIdAndUpdate(mission.quoteId, { status: 'mission_assigned' });
      console.log('Quote status updated');
    }

    // If mission is completed, generate an invoice
    if (mission.status === 'completed') {
      console.log('Mission is completed, generating invoice...');
      const quote = await Quote.findById(mission.quoteId).populate('clientId', 'firstName lastName email company').populate('items.equipmentId');
      if (!quote) {
        console.log('Associated quote not found');
        return res.status(404).json({ success: false, message: 'Devis associé non trouvé' });
      }

      let companyId = null;
      if (quote.clientId.company) {
        const company = await Company.findOne({ name: quote.clientId.company });
        if (company) {
          companyId = company._id;
        } else {
          console.warn(`Company with name '${quote.clientId.company}' not found for invoice generation.`);
        }
      }

      const invoiceItems = quote.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
      }));

      const newInvoice = new Invoice({
        client: quote.clientId._id,
        company: companyId, // Use the found company ID or null
        issueDate: new Date(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 30)), // 30 days due
        items: invoiceItems,
        totalAmount: quote.total,
        status: 'pending',
        relatedQuotes: [quote._id],
        relatedMissions: [mission._id],
      });
      console.log('Saving new invoice...');
      await newInvoice.save();
      console.log('Invoice saved');

      mission.invoiceId = newInvoice._id;
      await mission.save();
    }

    res.status(201).json({ success: true, data: mission });
  } catch (error) {
    console.error('Error creating mission:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// PUT /api/missions/:id - Update a mission
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'technician']), updateMissionValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) {
      return res.status(404).json({ success: false, message: 'Mission non trouvée' });
    }

    if (req.user.role === 'technician' && mission.technicianId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Accès non autorisé' });
    }

    const oldStatus = mission.status; // Store old status

    const updatedMission = await Mission.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // If status changed, send notification
    if (oldStatus !== updatedMission.status) {
      const technician = await User.findById(updatedMission.technicianId);
      const client = await User.findById(updatedMission.clientId);
      const message = `Le statut de la mission ${updatedMission.missionNumber} est passé de ${oldStatus} à ${updatedMission.status}.`;

      // Notify technician
      if (technician) {
        const notification = new Notification({
          recipient: technician._id,
          message,
          type: 'status_update',
          relatedEntity: {
            id: updatedMission._id,
            type: 'Mission',
          },
        });
        await notification.save();
        io.to(technician._id.toString()).emit('newNotification', notification);
      }

      // Notify client
      if (client) {
        const notification = new Notification({
          recipient: client._id,
          message,
          type: 'status_update',
          relatedEntity: {
            id: updatedMission._id,
            type: 'Mission',
          },
        });
        await notification.save();
        io.to(client._id.toString()).emit('newNotification', notification);
      }
    }

    res.json({ success: true, data: updatedMission });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// DELETE /api/missions/:id - Delete a mission
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) {
      return res.status(404).json({ success: false, message: 'Mission non trouvée' });
    }

    await mission.remove();
    res.json({ success: true, message: 'Mission supprimée' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// GET /api/missions/stats/overview - Get mission statistics (Admin only)
router.get('/stats/overview', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const totalMissions = await Mission.countDocuments();
    const inProgressMissions = await Mission.countDocuments({ status: 'in_progress' });
    
    const recentMissions = await Mission.find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('clientId technicianId serviceType') // Populate necessary fields
      .select('missionNumber scheduledDate clientId technicianId serviceTypeId');

    res.json({
      success: true,
      data: {
        totalMissions,
        inProgressMissions,
        recentMissions: recentMissions.map(mission => ({
          missionNumber: mission.missionNumber,
          clientName: mission.clientId ? mission.clientId.companyName || `${mission.clientId.firstName} ${mission.clientId.lastName}` : 'N/A',
          technicianName: mission.technicianId ? `${mission.technicianId.firstName} ${mission.technicianId.lastName}` : 'N/A',
          serviceTypeName: mission.serviceType ? mission.serviceType.name : 'N/A',
          scheduledDate: mission.scheduledDate,
        })),
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques de mission',
      error: error.message
    });
  }
});

module.exports = router;
