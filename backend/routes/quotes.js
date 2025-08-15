const express = require('express');
const router = express.Router();
const Quote = require('../models/Quote');
const Request = require('../models/Request');
const User = require('../models/User');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const { io } = require('../server');
const Notification = require('../models/Notification');

const PDFDocument = require('pdfkit');

// Validation rules
const createQuoteValidation = [
  body('clientId').isMongoId().withMessage('L\'ID du client est requis'),
  body('title').trim().notEmpty().withMessage('Le titre est requis'),
  body('description').trim().notEmpty().withMessage('La description est requise'),
  body('items').isArray({ min: 1 }).withMessage('Les éléments du devis sont requis'),
  body('items.*.description').trim().notEmpty().withMessage('La description de l\'élément est requise'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('La quantité doit être un nombre entier positif'),
  body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Le prix unitaire doit être un nombre positif'),
  body('items.*.itemType').isIn(['service', 'equipment']).withMessage('Le type d\'élément est invalide'),
  body('items.*.equipmentId').optional().isMongoId().withMessage('ID d\'équipement invalide'),
  body('items.*.serviceTypeId').optional().isMongoId().withMessage('ID de type de service invalide'),
];

const updateQuoteValidation = [
  body('clientId').optional().isMongoId().withMessage('L\'ID du client est requis'),
  body('title').optional().trim().notEmpty().withMessage('Le titre ne peut pas être vide'),
  body('description').optional().trim().notEmpty().withMessage('La description ne peut pas être vide'),
  body('status').optional().isIn(['draft', 'sent', 'accepted', 'rejected', 'expired', 'mission_assigned']).withMessage('Statut invalide'),
  body('items').optional().isArray({ min: 1 }).withMessage('Les éléments du devis sont requis'),
  body('items.*.description').optional().trim().notEmpty().withMessage('La description de l\'élément est requise'),
  body('items.*.quantity').optional().isInt({ min: 1 }).withMessage('La quantité doit être un nombre entier positif'),
  body('items.*.unitPrice').optional().isFloat({ min: 0 }).withMessage('Le prix unitaire doit être un nombre positif'),
  body('items.*.itemType').optional().isIn(['service', 'equipment']).withMessage('Le type d\'élément est invalide'),
  body('items.*.equipmentId').optional().isMongoId().withMessage('ID d\'équipement invalide'),
  body('items.*.serviceTypeId').optional().isMongoId().withMessage('ID de type de service invalide'),
];

// POST /api/quotes/request - Recevoir une demande de devis du formulaire public
router.post('/request', async (req, res) => {
  try {
    const quoteRequestData = req.body;
    
    // Enregistrer la demande dans la base de données
    // Dans un cas réel, vous auriez un modèle QuoteRequest
    console.log('Quote request received:', quoteRequestData);
    
    // Créer un message pour l'administrateur
    const adminMessage = {
      sender: {
        id: 'system',
        name: 'Système Ectriborne',
        role: 'system'
      },
      recipients: [
        { id: 'admin-1', name: 'Jean Dupont', role: 'admin' }
      ],
      subject: `Nouvelle demande de devis - ${quoteRequestData.installationType}`,
      content: `
        Nouvelle demande de devis reçue:
        
        Client: ${quoteRequestData.firstName} ${quoteRequestData.lastName}
        Email: ${quoteRequestData.email}
        Téléphone: ${quoteRequestData.phone}
        ${quoteRequestData.company ? `Entreprise: ${quoteRequestData.company}` : ''}
        
        Type d'installation: ${quoteRequestData.installationType}
        Type de service: ${quoteRequestData.serviceType}
        Urgence: ${quoteRequestData.urgency || 'Non spécifiée'}
        
        Description: ${quoteRequestData.description}
        
        Adresse: ${quoteRequestData.address}, ${quoteRequestData.postalCode} ${quoteRequestData.city}
      `,
      type: 'quote',
      priority: quoteRequestData.urgency === 'immediat' || quoteRequestData.urgency === 'urgent' ? 'high' : 'normal',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    
    // Dans un cas réel, vous enregistreriez ce message dans la base de données
    console.log('Admin message created:', adminMessage);
    
    // Envoyer un email de notification
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    });
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@ectriborne.com',
      to: ['admin@ectriborne.com', 'bak.abdrrahman@gmail.com'],
      subject: `Nouvelle demande de devis - ${quoteRequestData.installationType}`,
      html: `
        <h2>Nouvelle demande de devis</h2>
        <p><strong>Client:</strong> ${quoteRequestData.firstName} ${quoteRequestData.lastName}</p>
        <p><strong>Email:</strong> ${quoteRequestData.email}</p>
        <p><strong>Téléphone:</strong> ${quoteRequestData.phone}</p>
        ${quoteRequestData.company ? `<p><strong>Entreprise:</strong> ${quoteRequestData.company}</p>` : ''}
        <p><strong>Type d'installation:</strong> ${quoteRequestData.installationType}</p>
        <p><strong>Type de service:</strong> ${quoteRequestData.serviceType}</p>
        <p><strong>Urgence:</strong> ${quoteRequestData.urgency || 'Non spécifiée'}</p>
        <p><strong>Description:</strong> ${quoteRequestData.description}</p>
        <p><strong>Adresse:</strong> ${quoteRequestData.address}, ${quoteRequestData.postalCode} ${quoteRequestData.city}</p>
        <p><strong>Référence:</strong> ${quoteRequestData.reference}</p>
      `
    };
    
    try {
      await transporter.sendMail(mailOptions);
      console.log('Email notification sent to bak.abdrrahman@gmail.com');
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // Continue processing even if email fails
    }
    
    res.status(201).json({
      success: true,
      message: 'Demande de devis reçue avec succès',
      data: { reference: quoteRequestData.reference }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réception de la demande de devis',
      error: error.message
    });
  }
});

// GET /api/quotes - Obtenir tous les devis
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    // Construire le filtre
    const filter = {};
    
    // Filtres par rôle
    if (req.user.role === 'client') {
      // Les clients ne voient que leurs devis
      filter.client = req.user.company || `${req.user.firstName} ${req.user.lastName}`;
    } else if (req.user.role === 'technician') {
      // Les techniciens voient les devis qu'ils ont créés
      filter.createdBy = req.user.id;
    }
    // Les admins voient tous les devis
    
    // Filtres additionnels
    if (status && status !== 'all') filter.status = status;
    
    if (search) {
      filter.$or = [
        { reference: { $regex: search, $options: 'i' } },
        { client: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const quotes = await Quote.find(filter)
      .populate('clientId', 'firstName lastName email')
      .populate('technicianId', 'firstName lastName email')
      .populate('items.equipmentId', 'name price')
      .populate('items.serviceTypeId', 'name description')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Quote.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        quotes,
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
      message: 'Erreur lors de la récupération des devis',
      error: error.message
    });
  }
});

// GET /api/quotes/my - Obtenir les devis de l'utilisateur connecté
router.get('/my', authMiddleware, async (req, res) => {
  try {
    let filter = {};
    
    if (req.user.role === 'client') {
      filter.client = req.user.company || `${req.user.firstName} ${req.user.lastName}`;
    } else if (req.user.role === 'technician') {
      filter.createdBy = req.user.id;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
    
    const quotes = await Quote.find(filter)
      .populate('clientId', 'firstName lastName email')
      .populate('technicianId', 'firstName lastName email')
      .populate('items.equipmentId', 'name price')
      .populate('items.serviceTypeId', 'name description')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: { quotes }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des devis',
      error: error.message
    });
  }
});

// GET /api/quotes/:id - Obtenir un devis par ID
    // GET /api/quotes/:id - Obtenir un devis par ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const quote = await Quote.findById(id)
      .populate('clientId', 'firstName lastName email company')
      .populate('technicianId', 'firstName lastName email')
      .populate('items.equipmentId', 'name price')
      .populate('items.serviceTypeId', 'name description');
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Devis non trouvé'
      });
    }
    
    // Vérifier les permissions
    if (req.user.role === 'client') {
      const clientName = req.user.company || `${req.user.firstName} ${req.user.lastName}`;
      if (quote.client !== clientName) {
        return res.status(403).json({
          success: false,
          message: 'Accès non autorisé'
        });
      }
    } else if (req.user.role === 'tech' && quote.createdBy !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
    
    res.json({
      success: true,
      data: { quote }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du devis',
      error: error.message
    });
  }
});

// POST /api/quotes - Créer un nouveau devis
router.post('/', authMiddleware, roleMiddleware(['admin', 'technician']), createQuoteValidation, async (req, res) => {
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
    
    const { reference: ignoredReference, ...quoteData } = req.body;
    console.log('Received quote data:', quoteData);
    
    // Générer la référence
    const year = new Date().getFullYear();
    const count = await Quote.countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    const reference = `DEV-${year}-${String(count + 1).padStart(3, '0')}`;
    
    // Créer le devis
    const quote = new Quote({
      ...quoteData,
      reference,
      createdBy: req.user.id,
      status: quoteData.status || 'draft'
    });

    try {
      await quote.save();
    } catch (saveError) {
      console.error('Error saving quote:', saveError);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la sauvegarde du devis',
        error: saveError.message,
        details: saveError.errors
      });
    }

    // Create notification for client and technician
    const client = await User.findById(quote.clientId);

    if (client) {
      const notification = new Notification({
        recipient: client._id,
        sender: req.user.id,
        message: `Un nouveau devis (${quote.reference}) a été créé pour vous.`,
        type: 'quote_created',
        relatedEntity: {
          id: quote._id,
          type: 'Quote',
        },
      });
      await notification.save();
      io.to(client._id.toString()).emit('newNotification', notification);
    }

    if (quote.technicianId) {
      const technician = await User.findById(quote.technicianId);
      if (technician && technician._id.toString() !== req.user.id.toString()) { // Don't notify self
        const notification = new Notification({
          recipient: technician._id,
          sender: req.user.id,
          message: `Vous avez créé un nouveau devis (${quote.reference}).`,
          type: 'quote_created',
          relatedEntity: {
            id: quote._id,
            type: 'Quote',
          },
        });
        await notification.save();
        io.to(technician._id.toString()).emit('newNotification', notification);
      }
    }

    // Update the status of the associated request to 'quoted'
    if (quote.requestId) {
      await Request.findByIdAndUpdate(quote.requestId, { status: 'quoted' });
    }
    
    // Créer un message pour le client si le devis est envoyé
    if (quote.status === 'sent') {
      // Logique pour créer un message et envoyer un email
      // ...
    }
    
    res.status(201).json({
      success: true,
      message: 'Devis créé avec succès',
      data: { quote }
    });
  } catch (error) {
    console.error('Error creating quote:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du devis',
      error: error.message
    });
  }
});

// PUT /api/quotes/:id - Mettre à jour un devis
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'technician']), updateQuoteValidation, async (req, res) => {
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
    
    const updateData = req.body;
    
    // Vérifier les permissions
    const existingQuote = await Quote.findById(id);
    if (!existingQuote) {
      return res.status(404).json({
        success: false,
        message: 'Devis non trouvé'
      });
    }

    const oldStatus = existingQuote.status;

    if (req.user.role === 'technician' && existingQuote.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
    
    const quote = await Quote.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    // If status changed, send notification
    if (oldStatus !== quote.status) {
      const client = await User.findById(quote.clientId);
      const technician = await User.findById(quote.technicianId);
      const message = `Le statut du devis ${quote.reference} est passé de ${oldStatus} à ${quote.status}.`;

      // Notify client
      if (client) {
        const notification = new Notification({
          recipient: client._id,
          message,
          type: 'status_update',
          relatedEntity: {
            id: quote._id,
            type: 'Quote',
          },
        });
        await notification.save();
        io.to(client._id.toString()).emit('newNotification', notification);
      }

      // Notify technician (if different from current user)
      if (technician && technician._id.toString() !== req.user.id.toString()) {
        const notification = new Notification({
          recipient: technician._id,
          message,
          type: 'status_update',
          relatedEntity: {
            id: quote._id,
            type: 'Quote',
          },
        });
        await notification.save();
        io.to(technician._id.toString()).emit('newNotification', notification);
      }
    }
    
    res.json({
      success: true,
      message: 'Devis mis à jour avec succès',
      data: { quote }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du devis',
      error: error.message
    });
  }
});

// POST /api/quotes/:id/send - Envoyer un devis au client
router.post('/:id/send', authMiddleware, roleMiddleware(['admin', 'technician']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const quote = await Quote.findById(id);
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Devis non trouvé'
      });
    }
    
    // Vérifier les permissions
    if (req.user.role === 'tech' && quote.createdBy !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
    
    // Mettre à jour le statut du devis
    quote.status = 'sent';
    await quote.save();
    
    // Envoyer un email au client
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    });
    
    // Trouver l'email du client
    let clientEmail = '';
    // Dans un cas réel, vous récupéreriez l'email du client depuis la base de données
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@ectriborne.com',
      to: clientEmail || 'bak.abdrrahman@gmail.com', // Fallback pour le test
      subject: `Votre devis ${quote.reference} - Ectriborne`,
      html: `
        <h2>Votre devis est disponible</h2>
        <p>Bonjour,</p>
        <p>Votre devis ${quote.reference} - ${quote.title} est maintenant disponible.</p>
        <p>Vous pouvez le consulter en vous connectant à votre espace client.</p>
        <p>Cordialement,<br>L'équipe Ectriborne</p>
      `
    };
    
    try {
      await transporter.sendMail(mailOptions);
      console.log('Email notification sent to client');
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // Continue processing even if email fails
    }
    
    // Créer un message pour le client
    // Dans un cas réel, vous enregistreriez ce message dans la base de données
    
    res.json({
      success: true,
      message: 'Devis envoyé avec succès',
      data: { quote }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du devis',
      error: error.message
    });
  }
});

// POST /api/quotes/:id/respond - Répondre à un devis (client)
router.post('/:id/respond', authMiddleware, roleMiddleware(['client']), async (req, res) => {
  try {
    const { id } = req.params;
    const { accepted, comments } = req.body;
    
    if (typeof accepted !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'La réponse (accepté/refusé) est requise'
      });
    }
    
    const quote = await Quote.findById(id);
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Devis non trouvé'
      });
    }
    
    // Vérifier que le devis appartient au client
    const clientName = req.user.company || `${req.user.firstName} ${req.user.lastName}`;
    if (quote.client !== clientName) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
    
    // Mettre à jour le statut du devis
    quote.status = accepted ? 'accepted' : 'rejected';
    quote.clientResponse = {
      accepted,
      comments,
      date: new Date()
    };
    await quote.save();
    
    // Envoyer une notification à l'administrateur et au technicien
    const technician = await User.findById(quote.technicianId);
    const admins = await User.find({ role: 'admin' });
    const clientUser = await User.findById(req.user.id); // The client who responded

    const responseMessage = `Le devis ${quote.reference} a été ${accepted ? 'accepté' : 'refusé'} par ${clientUser?.firstName || ''} ${clientUser?.lastName || ''}.`;

    // Notify technician
    if (technician) {
      const notification = new Notification({
        recipient: technician._id,
        sender: req.user.id,
        message: responseMessage,
        type: 'quote_response',
        relatedEntity: {
          id: quote._id,
          type: 'Quote',
        },
      });
      await notification.save();
      io.to(technician._id.toString()).emit('newNotification', notification);
    }

    // Notify admins
    for (const admin of admins) {
      const notification = new Notification({
        recipient: admin._id,
        sender: req.user.id,
        message: responseMessage,
        type: 'quote_response',
        relatedEntity: {
          id: quote._id,
          type: 'Quote',
        },
      });
      await notification.save();
      io.to(admin._id.toString()).emit('newNotification', notification);
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    });
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@ectriborne.com',
      to: ['admin@ectriborne.com', 'bak.abdrrahman@gmail.com'],
      subject: `Devis ${quote.reference} ${accepted ? 'accepté' : 'refusé'} par le client`,
      html: `
        <h2>Réponse du client au devis ${quote.reference}</h2>
        <p>Le client ${clientName} a ${accepted ? 'accepté' : 'refusé'} le devis ${quote.reference} - ${quote.title}.</p>
        ${comments ? `<p><strong>Commentaires du client:</strong> ${comments}</p>` : ''}
        <p>Montant du devis: ${quote.totalAmount.toFixed(2)}€ TTC</p>
      `
    };
    
    try {
      await transporter.sendMail(mailOptions);
      console.log('Email notification sent to admin');
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // Continue processing even if email fails
    }
    
    res.json({
      success: true,
      message: `Devis ${accepted ? 'accepté' : 'refusé'} avec succès`,
      data: { quote }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réponse au devis',
      error: error.message
    });
  }
});

// GET /api/quotes/stats/overview - Get quote statistics (Admin only)
router.get('/stats/overview', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const totalQuotes = await Quote.countDocuments();
    const pendingQuotes = await Quote.countDocuments({ status: 'pending' });

    // Quotes this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const quotesThisMonth = await Quote.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Quotes last month
    const startOfLastMonth = new Date();
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
    startOfLastMonth.setDate(1);
    startOfLastMonth.setHours(0, 0, 0, 0);

    const endOfLastMonth = new Date();
    endOfLastMonth.setDate(0); // Last day of previous month
    endOfLastMonth.setHours(23, 59, 59, 999);

    const quotesLastMonth = await Quote.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });

    res.json({
      success: true,
      data: {
        totalQuotes,
        pendingQuotes,
        quotesThisMonth,
        quotesLastMonth
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques de devis',
      error: error.message
    });
  }
});

// GET /api/quotes/:id/pdf - Générer un PDF pour un devis
router.get('/:id/pdf', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const quote = await Quote.findById(id)
      .populate('clientId', 'firstName lastName email address company') // Populate client address and company
      .populate('technicianId', 'firstName lastName email')
      .populate('items.equipmentId', 'name price')
      .populate('items.serviceTypeId', 'name description');

    if (!quote) {
      return res.status(404).send('Devis non trouvé');
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=devis-${quote.reference}.pdf`);

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

    // Quote Title and Number
    doc.fontSize(24).fillColor(primaryColor).text('DEVIS', 350, 60, { align: 'right' });
    doc.fontSize(12).fillColor(textColor).text(`N°: ${quote.reference}`, 350, 85, { align: 'right' });
    doc.moveDown(2);

    drawLine(doc.y);
    doc.moveDown();

    // Client Info
    const client = quote.clientId;

    doc.fontSize(10).fillColor(textColor).text('Devis pour:', 50, doc.y);
    if (client.company) {
      doc.font('Helvetica-Bold').text(client.company, 50, doc.y + 15);
    } else {
      doc.font('Helvetica-Bold').text(`${client.firstName} ${client.lastName}`, 50, doc.y + 15);
    }
    doc.font('Helvetica').text(client.email, 50, doc.y + 30);
    if (client.address && client.address.street) {
      doc.text(`${client.address.street}, ${client.address.postalCode} ${client.address.city}, ${client.address.country}`, 50, doc.y + 45);
    }
    doc.moveDown(3);

    doc.fontSize(10).fillColor(textColor).text(`Date d'émission: ${new Date(quote.createdAt).toLocaleDateString()}`, 350, doc.y - 15, { align: 'right' });
    doc.text(`Valide jusqu'au: ${new Date(quote.validUntil).toLocaleDateString()}`, 350, doc.y, { align: 'right' });
    doc.moveDown(2);

    // Quote Details
    doc.fontSize(14).fillColor(primaryColor).text(quote.title, { underline: true });
    doc.moveDown();
    doc.fontSize(10).fillColor(textColor).text(quote.description);
    doc.moveDown(2);

    // Items Table
    const tableHeaders = ['Description', 'Quantité', 'Prix Unitaire', 'Total'];
    const tableColumns = [250, 100, 100, 100]; // Widths for Description, Quantity, Unit Price, Total
    const tableX = 50;
    const tableY = doc.y;
    const rowHeight = 25;

    // Draw table header
    doc.fillColor(primaryColor).rect(tableX, tableY, 500, rowHeight).fill();
    doc.fillColor('white').fontSize(10);
    let currentX = tableX;
    tableHeaders.forEach((header, i) => {
      doc.text(header, currentX + 5, tableY + 8, { width: tableColumns[i], align: 'left' });
      currentX += tableColumns[i];
    });
    doc.moveDown();

    // Draw table rows
    doc.fillColor(textColor).fontSize(9);
    quote.items.forEach((item, i) => {
      const y = tableY + rowHeight + (i * rowHeight);
      currentX = tableX;
      doc.rect(tableX, y, 500, rowHeight).strokeColor(accentColor).lineWidth(0.5).stroke();

      doc.text(item.description, currentX + 5, y + 8, { width: tableColumns[0], align: 'left' });
      currentX += tableColumns[0];
      doc.text(item.quantity.toString(), currentX + 5, y + 8, { width: tableColumns[1], align: 'left' });
      currentX += tableColumns[1];
      doc.text(`${item.unitPrice.toFixed(2)} €`, currentX + 5, y + 8, { width: tableColumns[2], align: 'left' });
      currentX += tableColumns[2];
      doc.text(`${(item.quantity * item.unitPrice).toFixed(2)} €`, currentX + 5, y + 8, { width: tableColumns[3], align: 'left' });
    });

    doc.y = tableY + rowHeight + (quote.items.length * rowHeight) + 20;

    // Totals
    doc.fontSize(12).fillColor(textColor).text(`Sous-total: ${quote.subtotal.toFixed(2)} €`, 50, doc.y, { align: 'right' });
    doc.text(`TVA (${quote.taxRate}%): ${quote.taxAmount.toFixed(2)} €`, 50, doc.y + 15, { align: 'right' });
    doc.font('Helvetica-Bold').text(`Total: ${quote.total.toFixed(2)} €`, 50, doc.y + 30, { align: 'right' });
    doc.font('Helvetica');
    doc.moveDown(2);

    // Notes and Terms
    if (quote.notes) {
      doc.fontSize(10).fillColor(textColor).text('Notes:', 50, doc.y);
      doc.text(quote.notes);
      doc.moveDown();
    }
    if (quote.terms) {
      doc.fontSize(10).fillColor(textColor).text('Termes et Conditions:', 50, doc.y);
      doc.text(quote.terms);
      doc.moveDown();
    }

    // Footer
    drawLine(doc.y);
    doc.moveDown();
    doc.fontSize(8).fillColor(textColor).text('ELECTRIBORNE - Votre partenaire en solutions de recharge électrique.', 50, doc.y, { align: 'center' });
    doc.text('Contact: contact@electriborne.net | Téléphone: +33 1 23 45 67 89', 50, doc.y + 10, { align: 'center' });

    doc.end();

  } catch (error) {
    console.error('Error generating quote PDF:', error);
    res.status(500).send('Erreur lors de la génération du PDF: ' + error.message);
  }
});

// DELETE /api/quotes/:id - Supprimer un devis
router.delete('/:id', authMiddleware, roleMiddleware(['admin', 'technician']), async (req, res) => {
  try {
    const { id } = req.params;

    const quote = await Quote.findById(id);
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Devis non trouvé'
      });
    }

    // Optional: Check for permissions
    if (req.user.role === 'tech' && quote.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    await quote.remove();

    res.json({
      success: true,
      message: 'Devis supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du devis',
      error: error.message
    });
  }
});

module.exports = router;