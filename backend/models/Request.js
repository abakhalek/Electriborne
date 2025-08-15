const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  reference: {
    type: String,
    unique: true,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['installation', 'maintenance', 'repair', 'diagnostic', 'emergency'],
    required: true
  },
  serviceTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceType',
    required: true,
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-progress', 'completed', 'cancelled', 'quoted'],
    default: 'pending',
  },
  address: {
    full: {
      type: String,
      required: true,
      trim: true
    }
  },
  contactPhone: {
    type: String,
    required: true,
    trim: true
  },
  preferredDate: Date,
  preferredTime: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', null],
    default: null
  },
  equipment: {
    type: String,
    trim: true,
    default: ''
  },
  symptoms: {
    type: [String],
    default: []
  },
  accessInstructions: {
    type: String,
    trim: true,
    default: ''
  },
  scheduledDate: Date,
  completedDate: Date,
  assignedDate: Date,
  estimatedDuration: Number,
  actualDuration: Number,
  notes: String,
  internalNotes: String,
  attachments: [String],
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedTechnician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate reference before saving
// Generate reference before saving
// requestSchema.pre('save', async function(next) {
//   if (this.isNew) {
//     const year = new Date().getFullYear();
//     const count = await mongoose.model('Request').countDocuments({ createdAt: { $gte: new Date(year, 0, 1) } });
//     this.reference = `REQ-${year}-${String(count + 1).padStart(4, '0')}`;
//   }

//   // Ensure type matches serviceType category
//   if (this.isModified('serviceTypeId')) {  // Correction ici - parenthèse fermante ajoutée
//     const serviceType = await mongoose.model('ServiceType').findById(this.serviceTypeId);
//     if (serviceType) {
//       this.type = serviceType.category;
//     }
//   }

//   // Clean attachments paths
//   if (this.isModified('attachments')) {
//     this.attachments = this.attachments.map(path => 
//       path.replace(/^public[\/]/, '')
//     );
//   }

//   next();
// });

// Virtual for client details
requestSchema.virtual('client', {
  ref: 'User',
  localField: 'clientId',
  foreignField: '_id',
  justOne: true
});

// Virtual for technician details
requestSchema.virtual('technician', {
  ref: 'User',
  localField: 'assignedTechnician',
  foreignField: '_id',
  justOne: true
});

// Virtual for service type details
requestSchema.virtual('serviceType', {
  ref: 'ServiceType',
  localField: 'serviceTypeId',
  foreignField: '_id',
  justOne: true
});

// Methods
requestSchema.methods.assignTechnician = async function(technicianId) {
  this.assignedTechnician = technicianId;
  this.status = 'assigned';
  this.assignedDate = new Date();
  return this.save();
};

requestSchema.methods.markCompleted = async function(actualDuration) {
  this.status = 'completed';
  this.completedDate = new Date();
  this.actualDuration = actualDuration;
  return this.save();
};

requestSchema.methods.getProcessingTime = function() {
  if (this.assignedDate && this.completedDate) {
    return (this.completedDate.getTime() - this.assignedDate.getTime()) / (1000 * 60 * 60);
  }
  return 0;
};

// Statics
requestSchema.statics.findUrgent = function() {
  return this.find({ 
    priority: 'urgent', 
    status: { $in: ['pending', 'assigned', 'in-progress'] } 
  });
};

module.exports = mongoose.model('Request', requestSchema);