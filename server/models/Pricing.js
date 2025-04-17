const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({
  pro: {
    monthly: {
      type: Number,
      required: true,
      default: 7.99
    },
    annual: {
      type: Number,
      required: true,
      default: 76.70
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Pricing', pricingSchema); 