const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');
const { body, validationResult } = require('express-validator');

// Validation rules
const createUserValidation = [
  body('firstName').trim().notEmpty().withMessage('Le prénom est requis'),
  body('lastName').trim().notEmpty().withMessage('Le nom est requis'),
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('role').isIn(['admin', 'technician', 'client']).withMessage('Rôle invalide'),
  body('phone').optional().isMobilePhone('fr-FR').withMessage('Numéro de téléphone invalide'),
  body('departement').if(body('role').isIn(['technician', 'client'])).notEmpty().withMessage('Le département est requis pour les techniciens et les clients'),
  body('availability.status').optional().isIn(['available', 'unavailable']).withMessage('Statut de disponibilité invalide'),
];

const updateUserValidation = [
  body('firstName').optional().trim().notEmpty().withMessage('Le prénom ne peut pas être vide'),
  body('lastName').optional().trim().notEmpty().withMessage('Le nom ne peut pas être vide'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Email invalide'),
  body('role').optional().isIn(['admin', 'technician', 'client']).withMessage('Rôle invalide'),
  body('phone').optional().isMobilePhone('fr-FR').withMessage('Numéro de téléphone invalide')
];

// GET /api/users - Obtenir tous les utilisateurs (Admin seulement)
router.get('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search, isActive } = req.query;
    
    // Construire le filtre
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await User.find(filter)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        users,
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
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message
    });
  }
});

// GET /api/users/technicians - Obtenir tous les techniciens
router.get('/technicians', authMiddleware, async (req, res) => {
  try {
    const technicians = await User.find({ role: 'technician' })
      .select('firstName lastName email phone company');
    
    res.json({
      success: true,
      data: { technicians }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des techniciens',
      error: error.message
    });
  }
});

// GET /api/users/technicians/available - Get available technicians
router.get('/technicians/available', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { city, postalCode } = req.query;
    const filter = { role: 'technician', isActive: true };

    if (city) {
      filter.city = { $regex: city, $options: 'i' };
    }
    if (postalCode) {
      filter.postalCode = postalCode;
    }

    const technicians = await User.find(filter).select('firstName lastName city postalCode');
    res.json({ success: true, data: technicians });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// GET /api/users/clients - Obtenir tous les clients
router.get('/clients', authMiddleware, roleMiddleware(['admin', 'technician']), async (req, res) => {
  try {
    const { departement } = req.query;
    const filter = { role: 'client' };

    if (departement) {
      filter.departement = departement;
    }

    const clients = await User.findActiveByRole(filter)
      .select('firstName lastName email phone company address');
    
    res.json({
      success: true,
      data: { clients }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des clients',
      error: error.message
    });
  }
});

// GET /api/users/contacts - Get users to contact
router.get('/contacts', authMiddleware, async (req, res) => {
  try {
    let users = [];
    if (req.user.role === 'admin') {
      users = await User.find({ _id: { $ne: req.user.id } }).select('firstName lastName email');
    } else if (req.user.role === 'technician') {
      users = await User.find({ role: { $in: ['admin', 'client'] } }).select('firstName lastName email');
    } else if (req.user.role === 'client') {
      users = await User.find({ role: { $in: ['admin', 'technician'] } }).select('firstName lastName email');
    }
    res.json({ success: true, data: { users } });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des contacts',
      error: error.message
    });
  }
});

// GET /api/users/stats/overview - Statistiques des utilisateurs (Admin seulement)
router.get('/stats/overview', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminCount = await User.countDocuments({ role: 'admin' });
    const techCount = await User.countDocuments({ role: 'technician' });
    const clientCount = await User.countDocuments({ role: 'client' });
    
    // Utilisateurs créés ce mois
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    
    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        adminCount,
        techCount,
        clientCount,
        newUsersThisMonth
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

// GET /api/users/:id - Obtenir un utilisateur par ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier les permissions
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
    
    const user = await User.findById(id).select('-password -refreshToken');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'utilisateur',
      error: error.message
    });
  }
});

// POST /api/users - Créer un nouvel utilisateur (Admin seulement)
router.post('/', authMiddleware, roleMiddleware(['admin']), createUserValidation, async (req, res) => {
  console.log('--- POST /api/users cration  ---');
  try {
    console.log('Request Body:', req.body);
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }
    
    console.log('Validation passed');
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      phone, 
      role, 
      isActive, 
      company, 
      address, 
      departement, 
      availability 
    } = req.body;

    const newUser = {
      firstName, 
      lastName, 
      email, 
      password, 
      phone, 
      role, 
      isActive, 
      company, 
      address, 
      departement, 
      availability
    };
    
    // Vérifier si l'email existe déjà
    const existingUser = await User.findByEmail(newUser.email);
    if (existingUser) {
      console.log('User with this email already exists:', newUser.email);
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }
    
    // Créer l'utilisateur
    console.log('Creating new user with data:', newUser);
    const user = new User(newUser);
    await user.save();
    console.log(`Utilisateur créé: ${user.email} avec le rôle ${user.role}`);
    
    // Retourner l'utilisateur sans le mot de passe
    const userResponse = user.getPublicProfile();
    
    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: { user: userResponse }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'utilisateur',
      error: error.message
    });
  }
});

// PUT /api/users/:id - Mettre à jour un utilisateur
router.put('/:id', authMiddleware, updateUserValidation, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier les permissions
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
    
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

    // Handle nested address object update
    const finalUpdate = { ...updateData }; // Start with a copy of the body

    if (updateData.address) {
      // If address is provided, ensure it's an object and update sub-fields
      if (typeof updateData.address === 'object' && !Array.isArray(updateData.address)) {
        // Only update provided address sub-fields
        if (updateData.address.street !== undefined) finalUpdate['address.street'] = updateData.address.street;
        if (updateData.address.city !== undefined) finalUpdate['address.city'] = updateData.address.city;
        if (updateData.address.postalCode !== undefined) finalUpdate['address.postalCode'] = updateData.address.postalCode;
        if (updateData.address.country !== undefined) finalUpdate['address.country'] = updateData.address.country;
        // Remove the top-level address object to prevent Mongoose from trying to replace the whole thing
        delete finalUpdate.address;
      } else {
        // If address is not an object, it's an invalid input.
        // We can either throw an error or ignore it. For now, let's throw a 400.
        return res.status(400).json({
          success: false,
          message: 'Invalid address format. Address must be an object with street, city, postalCode, and country.',
        });
      }
    }
    
    // Empêcher la modification du rôle par un non-admin
    if (req.user.role !== 'admin') {
      delete finalUpdate.role;
      delete finalUpdate.isActive;
      delete finalUpdate.permissions;
    }
    
    // Vérifier si l'email existe déjà (si modifié)
    if (finalUpdate.email) {
      const existingUser = await User.findByEmail(finalUpdate.email);
      if (existingUser && existingUser._id.toString() !== id) {
        return res.status(400).json({
          success: false,
          message: 'Un utilisateur avec cet email existe déjà'
        });
      }
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      finalUpdate,
      { new: true, runValidators: true }
    ).select('-password -refreshToken');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'utilisateur',
      error: error.message
    });
  }
});

// DELETE /api/users/:id - Supprimer un utilisateur (Admin seulement)
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Empêcher la suppression de son propre compte
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer votre propre compte'
      });
    }
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'utilisateur',
      error: error.message
    });
  }
});

// PATCH /api/users/:id/toggle-status - Activer/Désactiver un utilisateur (Admin seulement)
router.patch('/:id/toggle-status', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Attempting to toggle status for user ID: ${id}`);
    
    const user = await User.findById(id);
    if (!user) {
      console.log(`User with ID: ${id} not found.`);
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    console.log(`Current status for user ${user.email}: ${user.isActive}`);
    user.isActive = !user.isActive;
    console.log(`New status for user ${user.email}: ${user.isActive}`);
    await user.save();
    console.log(`User ${user.email} status updated successfully.`);
    
    res.json({
      success: true,
      message: `Utilisateur ${user.isActive ? 'activé' : 'désactivé'} avec succès`,
      data: { user: user.getPublicProfile() }
    });
  } catch (error) {
    console.error('Error in toggle-status route:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du statut',
      error: error.message
    });
  }
});

module.exports = router;
