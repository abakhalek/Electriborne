const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const User = require('../models/User');
const Mission = require('../models/Mission');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

// Configuration Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/uploads/reports');
    fs.mkdirSync(uploadPath, { recursive: true }); // Ensure directory exists
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const parseNestedJson = (req, res, next) => {
  if (req.body.location && typeof req.body.location === 'string') {
    try {
      req.body.location = JSON.parse(req.body.location);
    } catch (e) {
      console.error('Failed to parse location JSON:', e);
      return res.status(400).json({ success: false, message: 'Données de localisation invalides' });
    }
  }
  if (req.body.anomalies && typeof req.body.anomalies === 'string') {
    try {
      req.body.anomalies = JSON.parse(req.body.anomalies);
    } catch (e) {
      console.error('Failed to parse anomalies JSON:', e);
      return res.status(400).json({ success: false, message: 'Données d\'anomalies invalides' });
    }
  }
  next();
};

// Validation rules
const createReportValidation = [
  body('mission').isMongoId().withMessage('ID de mission invalide'),
  body('type').isIn([
    'Installation borne de recharge',
    'Maintenance préventive',
    'Réparation d\'urgence',
    'Diagnostic électrique',
    'Mise aux normes',
    'Remplacement équipement',
    'Autre'
  ]).withMessage('Type d\'intervention invalide'),
  body('startTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Format d\'heure invalide (HH:MM)'),
  body('endTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Format d\'heure invalide (HH:MM)'),
  body('location.address').trim().notEmpty().withMessage('L\'adresse est requise'),
  body('location.city').trim().notEmpty().withMessage('La ville est requise'),
  body('location.postalCode').trim().notEmpty().withMessage('Le code postal est requis'),
  body('equipment').trim().notEmpty().withMessage('L\'équipement est requis'),
  body('selectedEquipment').optional().isArray().withMessage('L\'équipement sélectionné doit être un tableau.'),
  body('selectedEquipment.*').isMongoId().withMessage('Chaque élément de l\'équipement sélectionné doit être un ID Mongo valide.'),
  body('selectedProducts').optional().isArray().withMessage('Les produits sélectionnés doivent être un tableau.'),
  body('selectedProducts.*').isMongoId().withMessage('Chaque produit sélectionné doit être un ID Mongo valide.'),
  body('workPerformed').trim().notEmpty().withMessage('La description des travaux est requise'),
];

const updateReportValidation = [
  body('type').optional().isIn([
    'Installation borne de recharge',
    'Maintenance préventive',
    'Réparation d\'urgence',
    'Diagnostic électrique',
    'Mise aux normes',
    'Remplacement équipement',
    'Autre'
  ]).withMessage('Type d\'intervention invalide'),
  body('status').optional().isIn(['draft', 'pending', 'completed', 'sent']).withMessage('Statut invalide'),
  body('startTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Format d\'heure invalide (HH:MM)'),
  body('endTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Format d\'heure invalide (HH:MM)'),
  body('location.address').optional().trim().notEmpty().withMessage('L\'adresse est requise'),
  body('location.city').optional().trim().notEmpty().withMessage('La ville est requise'),
  body('location.postalCode').optional().trim().notEmpty().withMessage('Le code postal est requis'),
  body('equipment').optional().trim().notEmpty().withMessage('L\'équipement est requis'),
  body('selectedEquipment').optional().isArray().withMessage('L\'équipement sélectionné doit être un tableau.'),
  body('selectedEquipment.*').isMongoId().withMessage('Chaque élément de l\'équipement sélectionné doit être un ID Mongo valide.'),
  body('selectedProducts').optional().isArray().withMessage('Les produits sélectionnés doivent être un tableau.'),
  body('selectedProducts.*').isMongoId().withMessage('Chaque produit sélectionné doit être un ID Mongo valide.'),
  body('workPerformed').optional().trim().notEmpty().withMessage('La description des travaux est requise'),
  body('notes').optional().trim(),
  body('batutalCompliant').optional().isBoolean().withMessage('La conformité BATUTA doit être un booléen'),
];

// GET /api/reports - Obtenir tous les rapports
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, search, batutalCompliant } = req.query;
    
    // Construire le filtre
    const filter = {};
    
    // Filtres par rôle
    if (req.user.role === 'technician') {
      filter['mission.technicianId'] = req.user.id;
    } else if (req.user.role === 'client') {
      filter['mission.clientId'] = req.user.id;
    }
    // Les admins voient tous les rapports
    
    // Filtres additionnels
    if (status && status !== 'all') filter.status = status;
    if (type && type !== 'all') filter.type = type;
    if (batutalCompliant !== undefined) filter.batutalCompliant = batutalCompliant === 'true';
    
    if (search && search.trim() !== '') {
      const clientIds = await User.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { companyName: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      const clientObjectIds = clientIds.map(c => c._id);

      filter.$or = [
        { interventionReference: { $regex: search, $options: 'i' } },
        { 'mission.clientId': { $in: clientObjectIds } },
        { workPerformed: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const reports = await Report.find({ ...filter, mission: { $ne: null } })
      .populate({ 
        path: 'mission', 
        populate: [ 
          { path: 'technicianId', model: 'User', select: 'firstName lastName email phone' }, 
          { path: 'clientId', model: 'User', select: 'firstName lastName companyName' },
          { path: 'serviceType', model: 'ServiceType', select: 'name' }
        ] 
      })
      .sort({ createdAt: -1 })
      .skip(parseInt(page) - 1)
      .limit(parseInt(limit));
    
    const total = await Report.countDocuments(filter);
    
    console.log('Backend - Reports fetched:', reports.length, 'Total:', total);

    res.json({
      success: true,
      data: {
        reports,
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
      message: 'Erreur lors de la récupération des rapports',
      error: error.message
    });
  }
});

// GET /api/reports/my - Obtenir les rapports de l'utilisateur connecté
router.get('/my', authMiddleware, async (req, res) => {
  try {
    let filter = {};
    
    if (req.user.role === 'technician') {
      // TEMPORARY: Remove filter by createdBy for technicians to show all reports
      // filter['mission.technicianId'] = req.user.id;
    } else if (req.user.role === 'client') {
      filter['mission.clientId'] = req.user.id;
    } else {
      filter.createdBy = req.user.id;
    }
    
    const reports = await Report.find(filter)
      .populate({ 
        path: 'mission', 
        populate: [ 
          { path: 'technicianId', model: 'User', select: 'firstName lastName email phone' }, 
          { path: 'clientId', model: 'User', select: 'firstName lastName companyName' },
          { path: 'serviceType', model: 'ServiceType', select: 'name' }
        ] 
      })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: { reports }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des rapports',
      error: error.message
    });
  }
});

// GET /api/reports/:id - Obtenir un rapport par ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await Report.findById(id)
      .populate({ 
        path: 'mission', 
        populate: [ 
          { path: 'technicianId', model: 'User', select: 'firstName lastName email phone' }, 
          { path: 'clientId', model: 'User', select: 'firstName lastName companyName' },
          { path: 'serviceType', model: 'ServiceType', select: 'name' }
        ] 
      });
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Rapport non trouvé'
      });
    }
    
    // Vérifier les permissions
    if (req.user.role === 'technician' && report.mission.technicianId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    } else if (req.user.role === 'client') {
      if (report.mission.clientId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Accès non autorisé'
        });
      }
    }
    
    res.json({
      success: true,
      data: { report }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du rapport',
      error: error.message
    });
  }
});

// GET /api/reports/:id/pdf - Générer un PDF pour un rapport
router.get('/:id/pdf', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id)
      .populate({
        path: 'mission',
        populate: [
          { path: 'technicianId', model: 'User', select: 'firstName lastName' },
          { path: 'clientId', model: 'User', select: 'firstName lastName companyName' },
          { path: 'serviceType', model: 'ServiceType', select: 'name' }
        ]
      });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Rapport non trouvé' });
    }

    // Vérifier les données critiques
    if (!report.mission) {
      console.error(`Erreur de données: La mission est manquante pour le rapport ${id}`);
      return res.status(500).json({ success: false, message: 'Données de mission manquantes pour générer le PDF' });
    }
    if (!report.mission.clientId) {
      console.error(`Erreur de données: Le client est manquant pour la mission ${report.mission._id}`);
      return res.status(500).json({ success: false, message: 'Données de client manquantes pour générer le PDF' });
    }
    if (!report.mission.technicianId) {
      console.error(`Erreur de données: Le technicien est manquant pour la mission ${report.mission._id}`);
      return res.status(500).json({ success: false, message: 'Données de technicien manquantes pour générer le PDF' });
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report-${report.interventionReference}.pdf`);

    doc.pipe(res);

    // Define colors
    const primaryColor = '#0056b3'; // A shade of blue
    const accentColor = '#f0f0f0'; // Light gray for table headers
    const textColor = '#333333';

    // Helper function to draw a line
    const drawLine = (y) => {
      doc.strokeColor(textColor).lineWidth(0.5).moveTo(50, y).lineTo(550, y).stroke();
    };

    // Company Logo (Placeholder)
    // You would typically load an image here:
    // doc.image('./public/images/logo.png', 50, 45, { width: 50 });
    doc.fontSize(10).fillColor(textColor).text('ELECTRIBORNE', 50, 60);
    doc.fontSize(8).text('123 Rue de l\'Exemple', 50, 75);
    doc.text('75001 Paris, France', 50, 85);
    doc.text('contact@electriborne.net', 50, 95);

    // Report Title and Reference
    doc.fontSize(24).fillColor(primaryColor).text('RAPPORT D\'INTERVENTION', 350, 60, { align: 'right' });
    doc.fontSize(12).fillColor(textColor).text(`Réf: ${report.interventionReference}`, 350, 85, { align: 'right' });
    doc.moveDown(2);

    drawLine(doc.y);
    doc.moveDown();

    // Mission Details
    doc.fontSize(10).fillColor(textColor).text('Détails de la Mission:', 50, doc.y);
    doc.font('Helvetica-Bold').text(`Numéro de Mission: ${report.mission.missionNumber}`, 50, doc.y + 15);
    doc.font('Helvetica').text(`Type d\'intervention: ${report.type}`, 50, doc.y + 30);
    doc.text(`Date: ${new Date(report.reportDate).toLocaleDateString()}`, 50, doc.y + 45);
    doc.text(`Heure de début: ${report.startTime}`, 50, doc.y + 60);
    doc.text(`Heure de fin: ${report.endTime}`, 50, doc.y + 75);
    doc.moveDown(3);

    // Client Info
    const client = report.mission.clientId;
    doc.fontSize(10).fillColor(textColor).text('Client:', 50, doc.y);
    if (client.companyName) {
      doc.font('Helvetica-Bold').text(client.companyName, 50, doc.y + 15);
    } else {
      doc.font('Helvetica-Bold').text(`${client.firstName} ${client.lastName}`, 50, doc.y + 15);
    }
    doc.font('Helvetica').text(client.email, 50, doc.y + 30);
    doc.text(`${report.location.address}, ${report.location.postalCode} ${report.location.city}`, 50, doc.y + 45);
    doc.moveDown(3);

    // Technician Info
    const technician = report.mission.technicianId;
    doc.fontSize(10).fillColor(textColor).text('Technicien:', 50, doc.y);
    doc.font('Helvetica-Bold').text(`${technician.firstName} ${technician.lastName}`, 50, doc.y + 15);
    doc.font('Helvetica').text(technician.email, 50, doc.y + 30);
    doc.moveDown(3);

    // Work Performed & Equipment
    doc.fontSize(10).fillColor(textColor).text('Travaux effectués:', 50, doc.y);
    doc.text(report.workPerformed);
    doc.moveDown();
    doc.text('Équipement utilisé:', 50, doc.y);
    doc.text(report.equipment);
    doc.moveDown();

    // Notes
    if (report.notes) {
      doc.text('Notes:', 50, doc.y);
      doc.text(report.notes);
      doc.moveDown();
    }

    // BATUTA Compliance & Certificate
    doc.text(`Conforme BATUTA: ${report.isBatutalCompliant ? 'Oui' : 'Non'}`, 50, doc.y);
    if (report.certificateNumber) {
      doc.text(`Numéro de certificat: ${report.certificateNumber}`, 50, doc.y);
    }
    doc.moveDown(2);

    // Photos
    if (report.photos && report.photos.length > 0) {
      doc.fontSize(12).fillColor(primaryColor).text('Photos:', 50, doc.y);
      doc.moveDown();
      for (const photo of report.photos) {
        try {
          const imagePath = path.join(__dirname, '../public', photo.url); // Assuming photo.url is like /uploads/reports/image.jpg
          if (fs.existsSync(imagePath)) {
            doc.image(imagePath, { fit: [200, 200], align: 'center', valign: 'center' });
            doc.moveDown();
          } else {
            console.warn(`Image not found: ${imagePath}`);
          }
        } catch (imageError) {
          console.error(`Erreur lors du traitement de l\'image ${photo.url}:`, imageError);
          doc.text(`Erreur d\'image: ${photo.url}`, { color: 'red' });
          doc.moveDown();
        }
      }
    }

    // Footer
    drawLine(doc.y);
    doc.moveDown();
    doc.fontSize(8).fillColor(textColor).text('ELECTRIBORNE - Votre partenaire en solutions de recharge électrique.', 50, doc.y, { align: 'center' });
    doc.text('Contact: contact@electriborne.net | Téléphone: +33 1 23 45 67 89', 50, doc.y + 10, { align: 'center' });

    doc.end();

  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la génération du PDF', error: error.message });
  }
});

// POST /api/reports - Créer un nouveau rapport
router.post('/', authMiddleware, roleMiddleware(['admin', 'technician']), upload.array('photos', 10), parseNestedJson, createReportValidation, async (req, res) => {
  console.log('Backend - Request Body:', req.body);
  console.log('Backend - req.files:', req.files);
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }
    
    const { 
      mission: missionId,
      reportDate,
      startTime,
      endTime,
      duration,
      anomalies,
      isBatutalCompliant,
      certificateNumber,
      type,
      location,
      equipment,
      selectedEquipment,
      selectedProducts,
      workPerformed,
      notes,
      status
    } = req.body;

    // Generate interventionReference here
    const now = new Date();
    const timestamp = now.getTime();
    const random = Math.floor(Math.random() * 10000);
    const interventionReference = `INT-${timestamp}-${random}`;

    // Handle uploaded files
    const photos = req.files.map(file => ({
      url: `/uploads/reports/${file.filename}`, // Use local path
      timestamp: new Date(),
    }));

    const mission = await Mission.findById(missionId);
    if (!mission) {
      return res.status(404).json({ success: false, message: 'Mission non trouvée' });
    }

    // Créer le rapport
    const report = new Report({
      mission: missionId,
      reportDate: reportDate,
      startTime,
      endTime,
      duration,
      anomalies,
      isBatutalCompliant,
      certificateNumber,
      type,
      location,
      equipment,
      selectedEquipment,
      selectedProducts,
      workPerformed,
      notes,
      status,
      createdBy: req.user.id,
      photos: photos,
      interventionReference: interventionReference,
    });

    report.interventionReference = interventionReference;
    
    await report.save();
    
    // Create notification for assigned technician and client
    const fetchedMission = await Mission.findById(report.mission);
    const technician = await User.findById(fetchedMission.technicianId);
    const client = await User.findById(fetchedMission.clientId);

    const message = `Un nouveau rapport (${report.interventionReference}) a été créé pour la mission ${fetchedMission.missionNumber}.`;

    // Notify technician (if different from creator)
    if (technician && technician._id.toString() !== req.user.id.toString()) {
      const notification = new Notification({
        recipient: technician._id,
        sender: req.user.id,
        message,
        type: 'report_created',
        relatedEntity: {
          id: report._id,
          type: 'Report',
        },
      });
      await notification.save();
      io.to(technician._id.toString()).emit('newNotification', notification);
    }

    // Notify client
    if (client) {
      const notification = new Notification({
        recipient: client._id,
        sender: req.user.id,
        message,
        type: 'report_created',
        relatedEntity: {
          id: report._id,
          type: 'Report',
        },
      });
      await notification.save();
      io.to(client._id.toString()).emit('newNotification', notification);
    }
    
    res.status(201).json({
      success: true,
      message: 'Rapport créé avec succès',
      data: { report }
    });
  } catch (error) {
    console.error('Error saving report:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du rapport',
      error: error.message
    });
  }
});

// PUT /api/reports/:id - Mettre à jour un rapport
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'technician']), upload.array('photos', 10), parseNestedJson, updateReportValidation, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }
    
    const updateData = { ...req.body }; // Create a copy to modify
    
    // Handle photos
    if (req.files && req.files.length > 0) {
      const existingReport = await Report.findById(id); // Fetch again to get current photos
      const newPhotos = req.files.map(file => ({
        url: `/uploads/reports/${file.filename}`, // Use local path
        timestamp: new Date(),
      }));
      updateData.photos = [...(existingReport.photos || []), ...newPhotos];
    } else {
      // If no new photos are uploaded, ensure 'photos' field is not updated with "[object File]" string
      // If req.body.photos is explicitly sent as a string, remove it or handle it
      if (typeof updateData.photos === 'string' && updateData.photos.includes('[object File]')) {
        delete updateData.photos; // Remove the invalid photos field
      }
    }

    // Handle selectedEquipment and selectedProducts if they are sent as invalid strings
    if (typeof updateData.selectedEquipment === 'string' && updateData.selectedEquipment.includes('[object')) {
      delete updateData.selectedEquipment;
    }
    if (typeof updateData.selectedProducts === 'string' && updateData.selectedProducts.includes('[object')) {
      delete updateData.selectedProducts;
    }

    // Handle duration (not in schema, remove it)
    if (updateData.duration !== undefined) {
      delete updateData.duration;
    }

    // Handle isBatutalCompliant (casing mismatch and undefined check)
    if (updateData.isBatutalCompliant !== undefined) {
      updateData.batutalCompliant = updateData.isBatutalCompliant;
      delete updateData.isBatutalCompliant;
    }
    
    // Vérifier les permissions
    const existingReport = await Report.findById(id).populate('mission');
    if (!existingReport) {
      return res.status(404).json({
        success: false,
        message: 'Rapport non trouvé'
      });
    }

    const oldStatus = existingReport.status;

    // Vérifier les permissions
    if (req.user.role === 'technician' && existingReport.mission.technicianId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
    
    const report = await Report.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate({ 
      path: 'mission', 
      populate: [ 
        { path: 'technicianId', model: 'User', select: 'firstName lastName email phone' }, 
        { path: 'clientId', model: 'User', select: 'firstName lastName companyName' },
        { path: 'serviceType', model: 'ServiceType', select: 'name' }
      ] 
    });

    // If status changed, send notification
    if (oldStatus !== report.status) {
      const technician = await User.findById(report.mission.technicianId);
      const client = await User.findById(report.mission.clientId);
      const message = `Le statut du rapport ${report.interventionReference} est passé de ${oldStatus} à ${report.status}.`;

      // Notify technician
      if (technician) {
        const notification = new Notification({
          recipient: technician._id,
          sender: req.user.id,
          message,
          type: 'status_update',
          relatedEntity: {
            id: report._id,
            type: 'Report',
          },
        });
        await notification.save();
        io.to(technician._id.toString()).emit('newNotification', notification);
      }

      // Notify client
      if (client) {
        const notification = new Notification({
          recipient: client._id,
          sender: req.user.id,
          message,
          type: 'status_update',
          relatedEntity: {
            id: report._id,
            type: 'Report',
          },
        });
        await notification.save();
        io.to(client._id.toString()).emit('newNotification', notification);
      }
    }
    
    res.json({
      success: true,
      message: 'Rapport mis à jour avec succès',
      data: { report }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du rapport',
      error: error.message
    });
  }
});

// POST /api/reports/:id/photos - Ajouter des photos à un rapport
router.post('/:id/photos', authMiddleware, roleMiddleware(['admin', 'technician']), upload.array('photos', 10), async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Rapport non trouvé'
      });
    }
    
    // Vérifier les permissions
    if (req.user.role === 'technician' && report.mission.technicianId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
    
    // Ajouter les photos
    const photos = req.files.map(file => ({
      url: file.path,
      timestamp: new Date(),
      coordinates: req.body.coordinates ? JSON.parse(req.body.coordinates) : null
    }));
    
    report.photos.push(...photos);
    await report.save();
    
    res.json({
      success: true,
      message: 'Photos ajoutées avec succès',
      data: { photos }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout des photos',
      error: error.message
    });
  }
});

// POST /api/reports/:id/generate-pdf - Générer un PDF pour un rapport
router.post('/:id/generate-pdf', authMiddleware, roleMiddleware(['admin', 'technician']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Rapport non trouvé'
      });
    }
    
    // Vérifier les permissions
    if (req.user.role === 'tech' && report.mission.technicianId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
    
    // Générer le PDF
    const pdfUrl = await report.generatePDF();
    
    res.json({
      success: true,
      message: 'PDF généré avec succès',
      data: { pdfUrl }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du PDF',
      error: error.message
    });
  }
});

// POST /api/reports/:id/send-to-client - Envoyer le rapport au client
router.post('/:id/send-to-client', authMiddleware, roleMiddleware(['admin', 'technician']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Rapport non trouvé'
      });
    }
    
    // Vérifier les permissions
    if (req.user.role === 'tech' && report.mission.technicianId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
    
    // Générer le PDF si nécessaire
    if (!report.pdfUrl) {
      await report.generatePDF();
    }
    
    res.json({
      success: true,
      message: 'Rapport envoyé au client avec succès'
    });

    // Notify client
    const client = await User.findById(report.mission.clientId);
    if (client) {
      const notification = new Notification({
        recipient: client._id,
        sender: req.user.id,
        message: `Votre rapport (${report.interventionReference}) a été envoyé.`, 
        type: 'report_sent',
        relatedEntity: {
          id: report._id,
          type: 'Report',
        },
      });
      await notification.save();
      io.to(client._id.toString()).emit('newNotification', notification);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du rapport',
      error: error.message
    });
  }
});

// POST /api/reports/:id/send-to-batuta - Envoyer le rapport à BATUTA
router.post('/:id/send-to-batuta', authMiddleware, roleMiddleware(['admin', 'technician']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Rapport non trouvé'
      });
    }
    
    // Vérifier les permissions
    if (req.user.role === 'tech' && report.mission.technicianId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
    
    // Vérifier la conformité
    if (!report.batutalCompliant) {
      return res.status(400).json({
        success: false,
        message: 'Le rapport n\'est pas conforme BATUTA'
      });
    }
    
    // Envoyer à BATUTA
    try {
      await report.sendToBatuta();
      
      res.json({
        success: true,
        message: 'Rapport envoyé à BATUTA avec succès'
      });
    } catch (batutalError) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi à BATUTA',
        error: batutalError.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du rapport',
      error: error.message
    });
  }
});

// POST /api/reports/:id/generate-certificate - Générer un certificat
router.post('/:id/generate-certificate', authMiddleware, roleMiddleware(['admin', 'technician']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Rapport non trouvé'
      });
    }
    
    // Vérifier les permissions
    if (req.user.role === 'tech' && report.mission.technicianId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
    
    // Vérifier la conformité
    if (!report.batutalCompliant) {
      return res.status(400).json({
        success: false,
        message: 'Le rapport n\'est pas conforme BATUTA'
      });
    }
    
    // Générer le certificat
    try {
      const certificateNumber = await report.generateCertificate();
      
      res.json({
        success: true,
        message: 'Certificat généré avec succès',
        data: { certificateNumber }
      });
    } catch (certError) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la génération du certificat',
        error: certError.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du certificat',
      error: error.message
    });
  }
});

// GET /api/reports/stats/overview - Statistiques des rapports
router.get('/stats/overview', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const batutalCompliantReports = await Report.countDocuments({ batutalCompliant: true });
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    
    // Répartition par type
    const typeStats = await Report.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Nombre total de photos
    const photoStats = await Report.aggregate([
      { $unwind: '$photos' },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);
    
    const totalPhotos = photoStats.length > 0 ? photoStats[0].count : 0;
    
    res.json({
      success: true,
      data: {
        totalReports,
        batutalCompliantReports,
        pendingReports,
        totalPhotos,
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