const mongoose = require('mongoose');

const missionSchema = new mongoose.Schema({
  missionNumber: {
    type: String,
    unique: true,
    required: true,
  },
  serviceType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceType',
    required: true,
  },
  status: { type: String, enum: ['pending', 'accepted', 'in-progress', 'completed', 'cancelled'], default: 'pending' },
  priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
  scheduledDate: { type: Date, required: true },
  address: {
    type: String,
    required: true,
  },
  details: {
    type: String,
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  quoteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quote',
    required: true,
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Mission', missionSchema);
