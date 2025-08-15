const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  quoteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quote',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true, // Allows null values to not violate unique constraint
  },
  // Add any other relevant fields like customer, currency, etc.
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
