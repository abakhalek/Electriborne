const mongoose = require('mongoose');

// Define the sub-service type schema
const subServiceTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: false,
  },
}, { _id: true });

const serviceTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['installation', 'maintenance', 'repair', 'diagnostic', 'emergency'],
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  images: [{
    url: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String,
      trim: true
    },
  }],
  subTypes: [subServiceTypeSchema],
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
serviceTypeSchema.index({ category: 1 });

// Virtual for requests
serviceTypeSchema.virtual('requests', {
  ref: 'Request',
  localField: '_id',
  foreignField: 'serviceTypeId'
});

// Pre-remove hook to handle references
serviceTypeSchema.pre('remove', async function(next) {
  await mongoose.model('Request').updateMany(
    { serviceTypeId: this._id },
    { $unset: { serviceTypeId: 1 } }
  );
  next();
});

module.exports = mongoose.model('ServiceType', serviceTypeSchema);