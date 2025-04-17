const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  shortName: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    street: String,
    city: String,
    state: {
      type: String,
      default: 'PA'
    },
    zipCode: String
  },
  contact: {
    phone: String,
    email: String
  },
  scannerDevices: [{
    deviceId: String,
    deviceName: String,
    deviceType: {
      type: String,
      enum: ['zebra', 'mobile'],
      required: true
    },
    lastConnected: Date,
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  }],
  settings: {
    timezone: {
      type: String,
      default: 'America/New_York'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
storeSchema.index({ name: 1 });
storeSchema.index({ shortName: 1 });

module.exports = mongoose.model('Store', storeSchema); 