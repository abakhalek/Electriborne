const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Quote = require('../models/Quote');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');
const { body, validationResult } = require('express-validator');

// Validation rules for creating a payment
const createPaymentValidation = [
  body('quoteId').isMongoId().withMessage('ID de devis invalide'),
  body('amount').isNumeric().withMessage('Le montant doit être un nombre').toFloat(),
  body('paymentMethod').trim().notEmpty().withMessage('La méthode de paiement est requise'),
];

// GET /api/payments - Get all payments (Admin only)
router.get('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const payments = await Payment.find().populate('quoteId');
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// GET /api/payments/my - Get payments for the authenticated user (Client/Technician)
router.get('/my', authMiddleware, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'client') {
      // Find quotes associated with the client, then find payments for those quotes
      const clientQuotes = await Quote.find({ clientId: req.user.id }).select('_id');
      const quoteIds = clientQuotes.map(quote => quote._id);
      filter.quoteId = { $in: quoteIds };
    } else if (req.user.role === 'technician') {
      // Find quotes created by the technician, then find payments for those quotes
      const techQuotes = await Quote.find({ createdBy: req.user.id }).select('_id');
      const quoteIds = techQuotes.map(quote => quote._id);
      filter.quoteId = { $in: quoteIds };
    } else {
      return res.status(403).json({ success: false, message: 'Accès non autorisé' });
    }

    const payments = await Payment.find(filter).populate('quoteId');
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// GET /api/payments/:id - Get a single payment by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('quoteId');
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Paiement non trouvé' });
    }
    // Add authorization checks here if needed (e.g., only client/admin can view their payments)
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// POST /api/payments - Create a new payment
router.post('/', authMiddleware, roleMiddleware(['admin', 'client']), createPaymentValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { quoteId, amount, paymentMethod, transactionId, status } = req.body;

    const newPayment = new Payment({
      quoteId,
      amount,
      paymentMethod,
      transactionId,
      status: status || 'completed', // Default to completed for manual creation or simple payments
    });

    await newPayment.save();

    // Optionally update quote status to 'paid' or 'partially_paid'
    await Quote.findByIdAndUpdate(quoteId, { $set: { status: 'paid' } });

    res.status(201).json({ success: true, data: newPayment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la création du paiement', error: error.message });
  }
});

// PUT /api/payments/:id - Update a payment
router.put('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const updatedPayment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPayment) {
      return res.status(404).json({ success: false, message: 'Paiement non trouvé' });
    }
    res.json({ success: true, data: updatedPayment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// DELETE /api/payments/:id - Delete a payment
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const deletedPayment = await Payment.findByIdAndDelete(req.params.id);
    if (!deletedPayment) {
      return res.status(404).json({ success: false, message: 'Paiement non trouvé' });
    }
    res.json({ success: true, message: 'Paiement supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// GET /api/payments/stats/overview - Get payment statistics (Admin only)
router.get('/stats/overview', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0); // Last day of current month
    endOfMonth.setHours(23, 59, 59, 999);

    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'completed', paymentDate: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const startOfLastMonth = new Date();
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
    startOfLastMonth.setDate(1);
    startOfLastMonth.setHours(0, 0, 0, 0);

    const endOfLastMonth = new Date();
    endOfLastMonth.setDate(0); // Last day of previous month
    endOfLastMonth.setHours(23, 59, 59, 999);

    const lastMonthlyRevenue = await Payment.aggregate([
      { $match: { status: 'completed', paymentDate: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        monthlyRevenue: monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0,
        lastMonthlyRevenue: lastMonthlyRevenue.length > 0 ? lastMonthlyRevenue[0].total : 0,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des statistiques de paiement', error: error.message });
  }
});

module.exports = router;
