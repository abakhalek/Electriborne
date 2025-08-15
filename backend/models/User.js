const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: /.+\@.+\..+/,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  firstName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  phone: {
    type: String,
    minlength: 10,
    maxlength: 15,
  },
  role: {
    type: String,
    enum: ['admin', 'technician', 'client'],
    default: 'client',
  },
  permissions: {
    type: [String],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  company: {
    type: String,
  },
  address: {
    street: String,
    city: String,
    postalCode: String,
    country: String,
  },
  departement: String,
  avatar: String,
  lastLogin: Date,
  refreshToken: String,
  availability: {
    status: { type: String, enum: ['available', 'unavailable'], default: 'unavailable' },
    nextDayOff: { type: Date, default: null },
  },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  console.log('Comparing passwords:');
  console.log('  Candidate password:', candidatePassword);
  console.log('  Stored hashed password:', this.password);
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.refreshToken;
  return userObject;
};

userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.refreshToken;
  return userObject;
};

userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email });
};

userSchema.statics.findActiveByRole = function(filter) {
  return this.find({ ...filter, isActive: true });
};

module.exports = mongoose.model('User', userSchema);
