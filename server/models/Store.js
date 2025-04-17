const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  settings: {
    currency: {
      type: String,
      default: 'USD'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  boxes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Box'
  }],
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  statistics: {
    totalSales: {
      type: Number,
      default: 0
    },
    totalTickets: {
      type: Number,
      default: 0
    },
    activeBoxes: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
storeSchema.index({ owner: 1 });
storeSchema.index({ status: 1 });
storeSchema.index({ 'contact.email': 1 });

module.exports = mongoose.model('Store', storeSchema); 