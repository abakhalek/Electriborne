const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  reference: {
    type: String,
    unique: true,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  status: {
    type: String,
    enum: ['draft', 'sent', 'accepted', 'rejected', 'expired', 'mission_assigned'],
    default: 'draft',
  },
  items: [{
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: false,
    },
    serviceTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceType',
      required: false,
    },
    itemType: {
      type: String,
      enum: ['service', 'equipment'],
      default: 'service',
      required: true,
    },
  }],
  subtotal: {
    type: Number,
    default: 0,
  },
  taxRate: {
    type: Number,
    default: 20.00,
  },
  taxAmount: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
  validUntil: Date,
  sentDate: Date,
  respondedDate: Date,
  notes: String,
  terms: String,
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

quoteSchema.pre('save', function (next) {
  if (this.items && Array.isArray(this.items)) {
    this.subtotal = this.items.reduce((sum, item) => {
      return sum + (item.quantity || 0) * (item.unitPrice || 0);
    }, 0);
    this.taxAmount = (this.subtotal * this.taxRate) / 100;
    this.total = this.subtotal + this.taxAmount;
  }
  next();
});

module.exports = mongoose.model('Quote', quoteSchema);
