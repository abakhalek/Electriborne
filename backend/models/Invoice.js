const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  issueDate: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  items: [invoiceItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled', 'overdue'],
    default: 'pending',
  },
  relatedQuotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quote',
    },
  ],
  relatedMissions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mission',
    },
  ],
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partially_paid', 'paid'],
    default: 'unpaid',
  },
  paymentDetails: {
    method: String,
    transactionId: String,
    paymentDate: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
