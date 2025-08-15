const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');
const { body, validationResult } = require('express-validator');

// Validation rules
const createCompanyValidation = [
  body('name').trim().notEmpty().withMessage('Le nom de l\'entreprise est requis'),
  body('type').isIn(['restaurant', 'bakery', 'retail', 'cafe', 'office', 'hotel', 'pharmacy', 'supermarket', 'other']).withMessage('Type d\'entreprise invalide'),
  body('address.street').trim().notEmpty().withMessage('L\'adresse est requise'),
  body('address.city').trim().notEmpty().withMessage('La ville est requise'),
  body('address.postalCode').matches(/^\d{5}$/).withMessage('Code postal invalide'),
  body('contact.firstName').trim().notEmpty().withMessage('Le prénom du contact est requis'),
  body('contact.lastName').trim().notEmpty().withMessage('Le nom du contact est requis'),
  body('contact.email').isEmail().normalizeEmail().withMessage('Email du contact invalide'),
  body('contact.phone').trim().notEmpty().withMessage('Le téléphone du contact est requis'),
  body('siret').optional().matches(/^\d{14}$/).withMessage('SIRET invalide (14 chiffres requis)')
];

const updateCompanyValidation = [
  body('name').optional().trim().notEmpty().withMessage('Le nom ne peut pas être vide'),
  body('type').optional().isIn(['restaurant', 'bakery', 'retail', 'cafe', 'office', 'hotel', 'pharmacy', 'supermarket', 'other']).withMessage('Type d\'entreprise invalide'),
  body('address.street').optional().trim().notEmpty().withMessage('L\'adresse ne peut pas être vide'),
  body('address.city').optional().trim().notEmpty().withMessage('La ville ne peut pas être vide'),
  body('address.postalCode').optional().matches(/^\d{5}$/).withMessage('Code postal invalide'),
  body('contact.firstName').optional().trim().notEmpty().withMessage('Le prénom ne peut pas être vide'),
  body('contact.lastName').optional().trim().notEmpty().withMessage('Le nom ne peut pas être vide'),
  body('contact.email').optional().isEmail().normalizeEmail().withMessage('Email invalide'),
  body('contact.phone').optional().trim().notEmpty().withMessage('Le téléphone ne peut pas être vide'),
  body('siret').optional().matches(/^\d{14}$/).withMessage('SIRET invalide (14 chiffres requis)')
];

// GET /api/companies - Obtenir toutes les entreprises
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, search, isActive } = req.query;
    
    // Construire le filtre
    const filter = {};
    if (type && type !== 'all') filter.type = type;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'contact.email': { $regex: search, $options: 'i' } },
        { 'contact.firstName': { $regex: search, $options: 'i' } },
        { 'contact.lastName': { $regex: search, $options: 'i' } }
      ];
    }
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const companies = await Company.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Company.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        companies,
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
      message: 'Erreur lors de la récupération des entreprises',
      error: error.message
    });
  }
});

// GET /api/companies/:id - Obtenir une entreprise par ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const company = await Company.findById(id);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }
    
    res.json({
      success: true,
      data: { company }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'entreprise',
      error: error.message
    });
  }
});

// POST /api/companies - Créer une nouvelle entreprise
router.post('/', authMiddleware, roleMiddleware(['admin']), createCompanyValidation, async (req, res) => {
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
    
    const companyData = req.body;
    
    // Vérifier si le SIRET existe déjà (si fourni)
    if (companyData.siret) {
      const existingCompany = await Company.findOne({ siret: companyData.siret });
      if (existingCompany) {
        return res.status(400).json({
          success: false,
          message: 'Une entreprise avec ce SIRET existe déjà'
        });
      }
    }
    
    // Vérifier si l'email du contact existe déjà
    const existingContact = await Company.findOne({ 'contact.email': companyData.contact.email });
    if (existingContact) {
      return res.status(400).json({
        success: false,
        message: 'Une entreprise avec cet email de contact existe déjà'
      });
    }
    
    // Créer l'entreprise
    const company = new Company(companyData);
    await company.save();
    
    res.status(201).json({
      success: true,
      message: 'Entreprise créée avec succès',
      data: { company }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'entreprise',
      error: error.message
    });
  }
});

// PUT /api/companies/:id - Mettre à jour une entreprise
router.put('/:id', authMiddleware, roleMiddleware(['admin']), updateCompanyValidation, async (req, res) => {
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
    
    // Vérifier si le SIRET existe déjà (si modifié)
    if (updateData.siret) {
      const existingCompany = await Company.findOne({ 
        siret: updateData.siret,
        _id: { $ne: id }
      });
      if (existingCompany) {
        return res.status(400).json({
          success: false,
          message: 'Une entreprise avec ce SIRET existe déjà'
        });
      }
    }
    
    // Vérifier si l'email du contact existe déjà (si modifié)
    if (updateData.contact?.email) {
      const existingContact = await Company.findOne({ 
        'contact.email': updateData.contact.email,
        _id: { $ne: id }
      });
      if (existingContact) {
        return res.status(400).json({
          success: false,
          message: 'Une entreprise avec cet email de contact existe déjà'
        });
      }
    }
    
    const company = await Company.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }
    
    res.json({
      success: true,
      message: 'Entreprise mise à jour avec succès',
      data: { company }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'entreprise',
      error: error.message
    });
  }
});

// DELETE /api/companies/:id - Supprimer une entreprise
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const company = await Company.findByIdAndDelete(id);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }
    
    res.json({
      success: true,
      message: 'Entreprise supprimée avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'entreprise',
      error: error.message
    });
  }
});

// PATCH /api/companies/:id/toggle-status - Activer/Désactiver une entreprise
router.patch('/:id/toggle-status', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }
    
    company.isActive = !company.isActive;
    await company.save();
    
    res.json({
      success: true,
      message: `Entreprise ${company.isActive ? 'activée' : 'désactivée'} avec succès`,
      data: { company }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du statut',
      error: error.message
    });
  }
});

// GET /api/companies/search/:query - Rechercher des entreprises
router.get('/search/:query', authMiddleware, async (req, res) => {
  try {
    const { query } = req.params;
    
    const companies = await Company.search(query)
      .limit(10)
      .select('name type contact.firstName contact.lastName contact.email address.city');
    
    res.json({
      success: true,
      data: { companies }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche',
      error: error.message
    });
  }
});

// GET /api/companies/stats/overview - Statistiques des entreprises
router.get('/stats/overview', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const totalCompanies = await Company.countDocuments();
    const activeCompanies = await Company.countDocuments({ isActive: true });
    
    // Répartition par type
    const typeStats = await Company.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Entreprises créées ce mois
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const newCompaniesThisMonth = await Company.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    
    // Chiffre d'affaires total
    const revenueStats = await Company.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$totalRevenue' } } }
    ]);
    
    res.json({
      success: true,
      data: {
        totalCompanies,
        activeCompanies,
        inactiveCompanies: totalCompanies - activeCompanies,
        newCompaniesThisMonth,
        totalRevenue: revenueStats[0]?.totalRevenue || 0,
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

// PATCH /api/companies/:id/update-stats - Mettre à jour les statistiques d'une entreprise
router.patch('/:id/update-stats', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }
    
    await company.updateStats();
    
    res.json({
      success: true,
      message: 'Statistiques mises à jour avec succès',
      data: { company }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des statistiques',
      error: error.message
    });
  }
});

module.exports = router;