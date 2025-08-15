const express = require('express');
const router = express.Router();
const Equipment = require('../models/Equipment');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');
const { body, validationResult } = require('express-validator');

// Validation rules for kit equipment
const createEquipmentValidation = [
  body('name').trim().notEmpty().withMessage('Le nom du kit est requis'),
  body('price').isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),
  body('components').isArray({ min: 1 }).withMessage('Un kit doit avoir au moins un composant'),
  body('components.*.productId').isMongoId().withMessage('ID de produit invalide pour le composant'),
  body('components.*.quantity').isInt({ min: 1 }).withMessage('La quantité du composant doit être un nombre entier positif'),
];

const updateEquipmentValidation = [
  body('name').optional().trim().notEmpty().withMessage('Le nom du kit ne peut pas être vide'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),
  body('components').optional().isArray().withMessage('Les composants doivent être un tableau'),
  body('components.*.productId').optional().isMongoId().withMessage('ID de produit invalide pour le composant'),
  body('components.*.quantity').optional().isInt({ min: 1 }).withMessage('La quantité du composant doit être un nombre entier positif'),
];

// GET all kits (Admin only)
router.get('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const equipments = await Equipment.find(filter)
      .populate('components.productId', 'name price') // Populate product details for components
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Equipment.countDocuments(filter);

    res.json({
      success: true,
      data: {
        equipments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des kits', error: error.message });
  }
});

// GET kit by ID (Admin only)
router.get('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id).populate('components.productId', 'name price');
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Kit non trouvé' });
    }
    res.json({ success: true, data: { equipment } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération du kit', error: error.message });
  }
});

// POST create new kit (Admin only)
router.post('/', authMiddleware, roleMiddleware(['admin']), createEquipmentValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Données invalides', errors: errors.array() });
  }

  try {
    const newEquipment = new Equipment(req.body);
    await newEquipment.save();
    res.status(201).json({ success: true, message: 'Kit créé avec succès', data: { equipment: newEquipment } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la création du kit', error: error.message });
  }
});

// PUT update kit by ID (Admin only)
router.put('/:id', authMiddleware, roleMiddleware(['admin']), updateEquipmentValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Données invalides', errors: errors.array() });
  }

  try {
    const updatedEquipment = await Equipment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedEquipment) {
      return res.status(404).json({ success: false, message: 'Kit non trouvé' });
    }
    res.json({ success: true, message: 'Kit mis à jour avec succès', data: { equipment: updatedEquipment } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du kit', error: error.message });
  }
});

// DELETE kit by ID (Admin only)
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const deletedEquipment = await Equipment.findByIdAndDelete(req.params.id);
    if (!deletedEquipment) {
      return res.status(404).json({ success: false, message: 'Kit non trouvé' });
    }
    res.json({ success: true, message: 'Kit supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression du kit', error: error.message });
  }
});

module.exports = router;