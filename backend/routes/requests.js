const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const User = require('../models/User');
const ServiceType = require('../models/ServiceType');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { body, validationResult } = require('express-validator');

// Validation rules
const createRequestValidation = [
  body('serviceTypeId').isMongoId().withMessage('Type de service invalide'),
  body('title').trim().notEmpty().withMessage('Le titre est requis'),
  body('description').trim().notEmpty().withMessage('La description est requise'),
  body('priority').isIn(['low', 'normal', 'high', 'urgent']).withMessage('Priorité invalide'),
  
  body('contactPhone').trim().notEmpty().withMessage('Le téléphone de contact est requis'),
  body('address.full').trim().notEmpty().withMessage('L\'adresse est requise'),
];


const updateRequestValidation = [
  body('title').optional().trim().notEmpty().withMessage('Le titre ne peut pas être vide'),
  body('description').optional().trim().notEmpty().withMessage('La description ne peut pas être vide'),
  body('serviceTypeId').optional().isMongoId().withMessage('Type de service invalide'),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']).withMessage('Priorité invalide'),
  body('status').optional().isIn(['pending', 'assigned', 'in-progress', 'completed', 'cancelled', 'quoted']).withMessage('Statut invalide'),
  body('estimatedBudget').optional().isNumeric().withMessage('Le budget doit être un nombre'),
  body('preferredDate').optional().isISO8601().withMessage('Date invalide'),
  body('clientId').optional().isMongoId().withMessage('Client invalide'),
  body('address.street').optional().trim().notEmpty().withMessage('La rue est requise'),
  body('address.city').optional().trim().notEmpty().withMessage('La ville est requise'),
  body('address.postalCode').optional().trim().notEmpty().withMessage('Le code postal est requis'),
];

// GET /api/requests - Obtenir toutes les demandes
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, type, search, assignedTechnician } = req.query;
    
    const conditions = [];

    // 1. Role-based filtering
    if (req.user.role === 'client') {
      conditions.push({ clientId: req.user.id });
    } else if (req.user.role === 'tech') {
      conditions.push({
        $or: [
          { assignedTechnician: req.user.id },
          { assignedTechnician: null, status: 'pending' }
        ]
      });
    }

    // 2. Additional filters from query parameters
    if (status && status !== 'all') {
      conditions.push({ status: status });
    }
    if (priority && priority !== 'all') {
      conditions.push({ priority: priority });
    }
    if (type && type !== 'all') {
      conditions.push({ type: type });
    }
    if (assignedTechnician) {
      conditions.push({ assignedTechnician: assignedTechnician });
    }

    // 3. Search filter
    if (search) {
      conditions.push({
        $or: [
          { reference: { $regex: search, $options: 'i' } },
          { 'address.full': { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ]
      });
    }

    // Construct the final filter object
    let finalFilter = {};
    if (conditions.length > 0) {
      finalFilter = { $and: conditions };
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const requests = await Request.find(finalFilter)
      .populate('assignedTechnician', 'firstName lastName email')
      .populate('serviceTypeId', 'name category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Request.countDocuments(finalFilter);
    
    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des demandes',
      error: error.message
    });
  }
});

// GET /api/requests/urgent - Obtenir les demandes urgentes
router.get('/urgent', authMiddleware, roleMiddleware(['admin', 'technician']), async (req, res) => {
  try {
    const urgentRequests = await Request.findUrgent()
      .populate('assignedTechnician', 'firstName lastName email')
      .populate('serviceTypeId', 'name category')
      .limit(10);
    
    res.json({
      success: true,
      data: { requests: urgentRequests }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des demandes urgentes',
      error: error.message
    });
  }
});

// GET /api/requests/my - Obtenir les demandes de l'utilisateur connecté
router.get('/my', authMiddleware, async (req, res) => {
  try {
    let filter = {};
    
    if (req.user.role === 'client') {
      // Assuming the client's requests are identified by their user ID.
      filter.clientId = req.user.id;
    } else if (req.user.role === 'tech') {
      filter.assignedTechnician = req.user.id;
    } else {
      // For other roles like 'admin', you might not want to filter at all,
      // or apply different logic. For now, let's forbid other roles.
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé pour ce rôle'
      });
    }
    
    const requests = await Request.find(filter)
      .populate('assignedTechnician', 'firstName lastName email')
      .populate('serviceTypeId', 'name category')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: { requests }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de vos demandes',
      error: error.message
    });
  }
});

// GET /api/requests/:id - Obtenir une demande par ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = await Request.findById(id)
      .populate('assignedTechnician', 'firstName lastName email phone')
      .populate('serviceTypeId', 'name category')
      .populate('clientId', 'firstName lastName email company');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Demande non trouvée'
      });
    }
    
    // Permission check
    if (req.user.role === 'client' && request.clientId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Accès non autorisé'
        });
    } else if (req.user.role === 'tech' && request.assignedTechnician?.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Accès non autorisé'
        });
    }
    
    res.json({
      success: true,
      data: { request }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la demande',
      error: error.message
    });
  }
});

// POST /api/requests - Créer une nouvelle demande
router.post('/', 
  authMiddleware, 
  upload.array('attachments', 5), 
  async (req, res) => {
    console.log('Received req.body after multer:', req.body);
    try {
      // Manual validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { serviceTypeId, address, ...restOfRequestData } = req.body;

      // Fetch service type to get its category
      const serviceType = await ServiceType.findById(serviceTypeId);
      if (!serviceType) {
        return res.status(400).json({
          success: false,
          message: 'Type de service invalide ou non trouvé.'
        });
      }

      // Generate reference
      const year = new Date().getFullYear();
      const count = await Request.countDocuments({ createdAt: { $gte: new Date(year, 0, 1) } });
      const reference = `REQ-${year}-${String(count + 1).padStart(4, '0')}`;

      // Parse symptoms if provided
      let symptoms = [];
      if (restOfRequestData.symptoms) {
        try {
          symptoms = JSON.parse(restOfRequestData.symptoms);
        } catch (e) {
          console.error('Error parsing symptoms:', e);
        }
      }

      // Create new request
      const newRequest = new Request({
        ...restOfRequestData,
        serviceTypeId: serviceTypeId,
        clientId: req.user.id,
        symptoms,
        address: { full: address }, // Format address as an object
        type: serviceType.category, // Set type from serviceType category
        reference, // Set generated reference
        attachments: req.files?.map(file => file.path.replace('public', '')) || []
      });

      await newRequest.save();

      // Populate related data
      await newRequest.populate([
        { path: 'clientId', select: 'firstName lastName email' },
        { path: 'serviceTypeId', select: 'name category' }
      ]);

      res.status(201).json({
        success: true,
        message: 'Request created successfully',
        data: { request: newRequest }
      });

    } catch (error) {
      console.error('Error creating request:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating request',
        error: error.message
      });
    }
  }
);


// PUT /api/requests/:id - Mettre à jour une demande
router.put('/:id', authMiddleware, updateRequestValidation, async (req, res) => {
  try {
    const { id } = req.params;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }
    
    let updateData = req.body;
    
    const existingRequest = await Request.findById(id);
    if (!existingRequest) {
      return res.status(404).json({
        success: false,
        message: 'Demande non trouvée'
      });
    }
    
    // Handle address fields: combine street, city, postalCode into address.full
    if (updateData.address && (updateData.address.street || updateData.address.city || updateData.address.postalCode)) {
      updateData['address.full'] = `${updateData.address.street || ''}, ${updateData.address.city || ''}, ${updateData.address.postalCode || ''}`.trim();
      // Remove individual address fields from the top-level updateData if they are not part of the schema
      delete updateData.address.street;
      delete updateData.address.city;
      delete updateData.address.postalCode;
    }

    // Permission checks
    if (req.user.role === 'client') {
      if (existingRequest.clientId.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Accès non autorisé' });
      }
      // Clients can only update certain fields
      const allowedFields = ['description', 'preferredDate', 'accessInstructions', 'notes'];
      updateData = Object.keys(updateData)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = updateData[key];
          return obj;
        }, {});
    } else if (req.user.role === 'technician') {
      if (existingRequest.assignedTechnician?.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Accès non autorisé' });
      }
      // Technicians can only update certain fields
      const allowedFields = ['status', 'estimatedDuration', 'actualDuration', 'internalNotes'];
       updateData = Object.keys(updateData)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = updateData[key];
          return obj;
        }, {});
    }
    
    const request = await Request.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('assignedTechnician', 'firstName lastName email')
     .populate('serviceTypeId', 'name category');
    
    res.json({
      success: true,
      message: 'Demande mise à jour avec succès',
      data: { request }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la demande',
      error: error.message
    });
  }
});

// DELETE /api/requests/:id - Supprimer une demande
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = await Request.findByIdAndDelete(id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Demande non trouvée'
      });
    }
    
    res.json({
      success: true,
      message: 'Demande supprimée avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la demande',
      error: error.message
    });
  }
});

// PATCH /api/requests/:id/assign - Assigner un technicien à une demande
router.patch('/:id/assign', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { technicianId } = req.body;
    
    const technician = await User.findById(technicianId);
    if (!technician || technician.role !== 'tech') {
      return res.status(400).json({
        success: false,
        message: 'Technicien invalide'
      });
    }
    
    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Demande non trouvée'
      });
    }
    
    await request.assignTechnician(technicianId);
    await request.populate('assignedTechnician', 'firstName lastName email');
    
    res.json({
      success: true,
      message: 'Technicien assigné avec succès',
      data: { request }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'assignation",
      error: error.message
    });
  }
});

// PATCH /api/requests/:id/complete - Marquer une demande comme terminée
router.patch('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { actualDuration } = req.body;
    
    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Demande non trouvée'
      });
    }
    
    // Permission check
    if (req.user.role !== 'admin' && request.assignedTechnician?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
    
    request.status = 'completed';
    request.completedDate = new Date();
    if(actualDuration) {
        request.actualDuration = actualDuration;
    }
    await request.save();
    
    res.json({
      success: true,
      message: 'Demande marquée comme terminée',
      data: { request }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la finalisation',
      error: error.message
    });
  }
});

// GET /api/requests/stats/overview - Statistiques des demandes
router.get('/stats/overview', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const totalRequests = await Request.countDocuments();
    const pendingRequests = await Request.countDocuments({ status: 'pending' });
    const assignedRequests = await Request.countDocuments({ status: 'assigned' });
    const inProgressRequests = await Request.countDocuments({ status: 'in-progress' });
    const completedRequests = await Request.countDocuments({ status: 'completed' });
    const urgentRequests = await Request.countDocuments({ 
      priority: { $in: ['high', 'urgent'] },
      status: { $in: ['pending', 'assigned'] }
    });
    
    // Répartition par type
    const typeStats = await Request.aggregate([
      { $lookup: { from: 'servicetypes', localField: 'serviceTypeId', foreignField: '_id', as: 'serviceType' } },
      { $unwind: '$serviceType' },
      { $group: { _id: '$serviceType.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Demandes créées ce mois
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const newRequestsThisMonth = await Request.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    
    // Temps de traitement moyen
    const completedWithDuration = await Request.find({
      status: 'completed',
      assignedDate: { $exists: true },
      completedDate: { $exists: true }
    });
    
    const avgProcessingTime = completedWithDuration.length > 0
      ? completedWithDuration.reduce((sum, req) => sum + (req.getProcessingTime() || 0), 0) / completedWithDuration.length
      : 0;
    
    res.json({
      success: true,
      data: {
        totalRequests,
        pendingRequests,
        assignedRequests,
        inProgressRequests,
        completedRequests,
        urgentRequests,
        newRequestsThisMonth,
        avgProcessingTime: Math.round(avgProcessingTime),
        typeDistribution: typeStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
});

module.exports = router;
