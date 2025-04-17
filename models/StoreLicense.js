const mongoose = require('mongoose');

const storeLicenseSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  licenseKey: {
    type: String,
    required: true,
    unique: true
  },
  activationDate: {
    type: Date,
    required: true
  },
  expirationDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'suspended'],
    default: 'active'
  },
  lastRenewalDate: {
    type: Date,
    default: null
  },
  renewalPeriod: {
    type: Number, // in months
    required: true
  },
  features: {
    type: [String],
    default: ['basic']
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
storeLicenseSchema.index({ storeId: 1 });
storeLicenseSchema.index({ licenseKey: 1 });
storeLicenseSchema.index({ status: 1 });

// Method to check if license is valid
storeLicenseSchema.methods.isValid = function() {
  return this.status === 'active' && this.expirationDate > new Date();
};

// Method to generate new license key
storeLicenseSchema.statics.generateLicenseKey = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = '';
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) key += '-';
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
};

module.exports = mongoose.model('StoreLicense', storeLicenseSchema); 