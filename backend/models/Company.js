const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 100,
  },
  type: {
    type: String,
    required: true,
    enum: ['restaurant', 'bakery', 'retail', 'cafe', 'office', 'hotel', 'pharmacy', 'supermarket', 'other'],
  },
  siret: {
    type: String,
    unique: true,
    match: /^[0-9]{14}$/,
    sparse: true,
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: 'France' },
  },
  contact: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, match: /.+\@.+\..+/ },
    position: { type: String },
  },
  website: {
    type: String,
    match: /^(https?|ftp):\/\/[^\s\/$.?#].[^\s]*$/i
  },
  description: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  clientsCount: {
    type: Number,
    default: 0
  },
  installationsCount: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  lastInterventionDate: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
