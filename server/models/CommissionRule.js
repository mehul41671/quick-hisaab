const mongoose = require('mongoose');

const commissionRuleSchema = new mongoose.Schema({
  scannerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scanner',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  rate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  conditions: {
    minAmount: {
      type: Number,
      required: true,
      min: 0
    },
    minVolume: {
      type: Number,
      required: true,
      min: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
commissionRuleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('CommissionRule', commissionRuleSchema); 