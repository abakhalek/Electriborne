const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');
const { body, validationResult } = require('express-validator');
const PDFDocument = require('pdfkit');

// Validation rules for invoice
const createInvoiceValidation = [
  body('client').isMongoId().withMessage('ID client invalide'),
  body('company').optional().isMongoId().withMessage('ID entreprise invalide'),
  body('dueDate').isISO8601().toDate().withMessage('Date d\'échéance invalide'),
  body('items').isArray({ min: 1 }).withMessage('Au moins un article est requis'),
  body('items.*.description').notEmpty().withMessage('La description de l\'article est requise'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('La quantité doit être un nombre entier positif'),
  body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Le prix unitaire doit être un nombre positif'),
  body('totalAmount').isFloat({ min: 0 }).withMessage('Le montant total doit être un nombre positif'),
];

const updateInvoiceValidation = [
  body('client').optional().isMongoId().withMessage('ID client invalide'),
  body('company').optional().isMongoId().withMessage('ID entreprise invalide'),
  body('dueDate').optional().isISO8601().toDate().withMessage('Date d\'échéance invalide'),
  body('items').optional().isArray({ min: 1 }).withMessage('Au moins un article est requis'),
  body('items.*.description').optional().notEmpty().withMessage('La description de l\'article est requise'),
  body('items.*.quantity').optional().isInt({ min: 1 }).withMessage('La quantité doit être un nombre entier positif'),
  body('items.*.unitPrice').optional().isFloat({ min: 0 }).withMessage('Le prix unitaire doit être un nombre positif'),
  body('totalAmount').optional().isFloat({ min: 0 }).withMessage('Le montant total doit être un nombre positif'),
  body('status').optional().isIn(['pending', 'paid', 'cancelled', 'overdue']).withMessage('Statut de facture invalide'),
  body('paymentStatus').optional().isIn(['unpaid', 'partially_paid', 'paid']).withMessage('Statut de paiement invalide'),
];

// GET all invoices (Admin and Client)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, client, search } = req.query;
    const filter = {};

    if (req.user.role === 'client') {
      filter.client = req.user.id;
    } else if (client) {
      filter.client = client;
    }

    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'items.description': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const invoices = await Invoice.find(filter)
      .populate('client', 'firstName lastName email')
      .populate('company', 'name')
      .sort({ issueDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Invoice.countDocuments(filter);

    res.json({
      success: true,
      data: {
        invoices,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des factures', error: error.message });
  }
});

// GET invoice by ID (Admin and Client)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('client', 'firstName lastName email')
      .populate('company', 'name');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Facture non trouvée' });
    }

    // Ensure client can only view their own invoices
    if (req.user.role === 'client' && invoice.client._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Accès non autorisé' });
    }

    res.json({ success: true, data: { invoice } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération de la facture', error: error.message });
  }
});

// POST create new invoice (Admin only)
router.post('/', authMiddleware, roleMiddleware(['admin']), createInvoiceValidation, async (req, res) => {
  console.log('--- POST /api/invoices ---');
  console.log('Request Body:', req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ success: false, message: 'Données invalides', errors: errors.array() });
  }

  try {
    console.log('Validation passed. Attempting to create invoice...');
    const { invoiceNumber: _, ...invoiceData } = req.body; // Exclude invoiceNumber from req.body

    // Generate invoice number
    const year = new Date().getFullYear();
    const count = await Invoice.countDocuments({
      createdAt: { $gte: new Date(year, 0, 1), $lt: new Date(year + 1, 0, 1) }
    });
    const generatedInvoiceNumber = `INV-${year}-${String(count + 1).padStart(5, '0')}`;

    const newInvoice = new Invoice({ ...invoiceData, invoiceNumber: generatedInvoiceNumber });
    console.log('New Invoice object:', newInvoice);
    await newInvoice.save();
    console.log('Invoice saved successfully.');
    res.status(201).json({ success: true, message: 'Facture créée avec succès', data: { invoice: newInvoice } });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création de la facture', error: error.message });
  }
});

// PUT update invoice by ID (Admin only)
router.put('/:id', authMiddleware, roleMiddleware(['admin']), updateInvoiceValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Données invalides', errors: errors.array() });
  }

  try {
    const updatedInvoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedInvoice) {
      return res.status(404).json({ success: false, message: 'Facture non trouvée' });
    }
    res.json({ success: true, message: 'Facture mise à jour avec succès', data: { invoice: updatedInvoice } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de la facture', error: error.message });
  }
});

// DELETE invoice by ID (Admin only)
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const deletedInvoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!deletedInvoice) {
      return res.status(404).json({ success: false, message: 'Facture non trouvée' });
    }
    res.json({ success: true, message: 'Facture supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression de la facture', error: error.message });
  }
});

module.exports = router;

// GET /api/invoices/:id/pdf - Générer un PDF pour une facture
router.get('/:id/pdf', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id)
      .populate('client', 'firstName lastName email address company') // Populate client address and company
      .populate('company', 'name address'); // Populate company address

    if (!invoice) {
      return res.status(404).send('Facture non trouvée');
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=facture-${invoice.invoiceNumber}.pdf`);

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

    // Invoice Title and Number
    doc.fontSize(24).fillColor(primaryColor).text('FACTURE', 350, 60, { align: 'right' });
    doc.fontSize(12).fillColor(textColor).text(`N°: ${invoice.invoiceNumber}`, 350, 85, { align: 'right' });
    doc.moveDown(2);

    drawLine(doc.y);
    doc.moveDown();

    // Client and Company Info
    const client = invoice.client;
    const company = invoice.company;

    doc.fontSize(10).fillColor(textColor).text('Facturé à:', 50, doc.y);
    if (client.company && client.company.name) {
      doc.font('Helvetica-Bold').text(client.company.name, 50, doc.y + 15);
    } else {
      doc.font('Helvetica-Bold').text(`${client.firstName} ${client.lastName}`, 50, doc.y + 15);
    }
    doc.font('Helvetica').text(client.email, 50, doc.y + 30);
    if (client.address && client.address.street) {
      doc.text(`${client.address.street}, ${client.address.postalCode} ${client.address.city}, ${client.address.country}`, 50, doc.y + 45);
    }
    doc.moveDown(3);

    if (company) {
      doc.fontSize(10).fillColor(textColor).text('Entreprise:', 350, doc.y - 60, { align: 'right' });
      doc.font('Helvetica-Bold').text(company.name, 350, doc.y - 45, { align: 'right' });
      if (company.address && company.address.street) {
        doc.font('Helvetica').text(`${company.address.street}, ${company.address.postalCode} ${company.address.city}, ${company.address.country}`, 350, doc.y - 30, { align: 'right' });
      }
      doc.moveDown();
    }

    doc.fontSize(10).fillColor(textColor).text(`Date d'émission: ${new Date(invoice.issueDate).toLocaleDateString()}`, 350, doc.y - 15, { align: 'right' });
    doc.text(`Date d'échéance: ${new Date(invoice.dueDate).toLocaleDateString()}`, 350, doc.y, { align: 'right' });
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
    invoice.items.forEach((item, i) => {
      const y = tableY + rowHeight + (i * rowHeight);
      currentX = tableX;
      doc.rect(tableX, y, 500, rowHeight).strokeColor(accentColor).lineWidth(0.5).stroke();

      doc.text(item.description, currentX + 5, y + 8, { width: tableColumns[0], align: 'left' });
      currentX += tableColumns[0];
      doc.text(item.quantity.toString(), currentX + 5, y + 8, { width: tableColumns[1], align: 'left' });
      currentX += tableColumns[1];
      doc.text(`${item.unitPrice.toFixed(2)} €`, currentX + 5, y + 8, { width: tableColumns[2], align: 'left' });
      currentX += tableColumns[2];
      doc.text(`${item.total.toFixed(2)} €`, currentX + 5, y + 8, { width: tableColumns[3], align: 'left' });
    });

    doc.y = tableY + rowHeight + (invoice.items.length * rowHeight) + 20;

    // Totals
    doc.fontSize(12).fillColor(textColor).text(`Montant Total: ${invoice.totalAmount.toFixed(2)} €`, 50, doc.y, { align: 'right' });
    doc.moveDown(2);

    // Footer
    drawLine(doc.y);
    doc.moveDown();
    doc.fontSize(8).fillColor(textColor).text('ELECTRIBORNE - Votre partenaire en solutions de recharge électrique.', 50, doc.y, { align: 'center' });
    doc.text('Contact: contact@electriborne.net | Téléphone: +33 1 23 45 67 89', 50, doc.y + 10, { align: 'center' });

    doc.end();

  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    res.status(500).send('Erreur lors de la génération du PDF de la facture');
  }
});
