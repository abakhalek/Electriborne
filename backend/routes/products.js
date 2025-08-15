const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');
const { body, validationResult } = require('express-validator');

// Validation rules for product
const createProductValidation = [
  body('name').trim().notEmpty().withMessage('Le nom du produit est requis'),
  body('price').isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),
  body('quantity').isInt({ min: 0 }).withMessage('La quantité doit être un nombre entier positif'),
];

const updateProductValidation = [
  body('name').optional().trim().notEmpty().withMessage('Le nom du produit ne peut pas être vide'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),
  body('quantity').optional().isInt({ min: 0 }).withMessage('La quantité doit être un nombre entier positif'),
];

// GET all products (Admin only)
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
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des produits', error: error.message });
  }
});

// GET product by ID (Admin only)
router.get('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }
    res.json({ success: true, data: { product } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération du produit', error: error.message });
  }
});

// POST create new product (Admin only)
router.post('/', authMiddleware, roleMiddleware(['admin']), createProductValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Données invalides', errors: errors.array() });
  }

  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json({ success: true, message: 'Produit créé avec succès', data: { product: newProduct } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la création du produit', error: error.message });
  }
});

// PUT update product by ID (Admin only)
router.put('/:id', authMiddleware, roleMiddleware(['admin']), updateProductValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Données invalides', errors: errors.array() });
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }
    res.json({ success: true, message: 'Produit mis à jour avec succès', data: { product: updatedProduct } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du produit', error: error.message });
  }
});

// DELETE product by ID (Admin only)
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }
    res.json({ success: true, message: 'Produit supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression du produit', error: error.message });
  }
});

module.exports = router;
