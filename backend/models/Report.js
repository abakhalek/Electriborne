const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  mission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission',
    required: true
  },
  interventionReference: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: [
      'Installation borne de recharge',
      'Maintenance préventive',
      'Réparation d\'urgence',
      'Diagnostic électrique',
      'Mise aux normes',
      'Remplacement équipement',
      'Autre'
    ],
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  startTime: {
    type: String,
    match: /^([01]\d|2[0-3]):([0-5]\d)$/,
  },
  endTime: {
    type: String,
    match: /^([01]\d|2[0-3]):([0-5]\d)$/,
  },
  location: {
    address: { type: String },
    city: { type: String },
    postalCode: { type: String },
  },
  equipment: {
    type: String,
  },
  selectedEquipment: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment'
  }],
  selectedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  workPerformed: {
    type: String,
  },
  notes: {
    type: String,
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'completed', 'sent'],
    default: 'draft'
  },
  photos: [
    {
      url: { type: String, required: true },
      description: { type: String },
      timestamp: { type: Date, default: Date.now },
      coordinates: { type: Object },
    },
  ],
  batutalCompliant: {
    type: Boolean,
    default: false
  },
  pdfUrl: String,
  certificateNumber: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

// Add pre-save hook to generate interventionReference if not provided
// reportSchema.pre('save', async function (next) {
//   if (this.isNew && !this.interventionReference) {
//     try {
//       const now = new Date();
//       const timestamp = now.getTime(); // Use a simple timestamp for uniqueness
//       const random = Math.floor(Math.random() * 10000); // Add some randomness

//       this.interventionReference = `INT-${timestamp}-${random}`;
//       next(); // Call next after setting the value
//     } catch (error) {
//       next(error); // Pass error to next middleware
//     }
//   } else {
//     next(); // Always call next if the condition is not met
//   }
// });

module.exports = mongoose.model('Report', reportSchema);