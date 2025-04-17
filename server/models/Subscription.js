const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  plan: {
    type: String,
    enum: ['basic', 'standard', 'premium'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'failed'],
    default: 'pending'
  },
  features: {
    maxBoxes: {
      type: Number,
      required: true
    },
    maxUsers: {
      type: Number,
      required: true
    },
    analytics: {
      type: Boolean,
      default: false
    },
    apiAccess: {
      type: Boolean,
      default: false
    },
    prioritySupport: {
      type: Boolean,
      default: false
    }
  },
  price: {
    type: Number,
    required: true
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    required: true
  },
  paymentHistory: [{
    amount: Number,
    date: Date,
    status: String,
    transactionId: String
  }]
}, {
  timestamps: true
});

// Add indexes for better query performance
subscriptionSchema.index({ storeId: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema); 