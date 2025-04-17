const mongoose = require('mongoose');

const salesSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  ticketSales: [{
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    }
  }],
  onlineSales: {
    type: Number,
    default: 0
  },
  lottoPayout: {
    type: Number,
    default: 0
  },
  debitCardDeduction: {
    type: Number,
    default: 0
  },
  totalSales: {
    type: Number,
    required: true
  },
  netPayout: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
salesSchema.index({ storeId: 1, date: 1 });
salesSchema.index({ date: 1 });

// Virtual for calculating net payout
salesSchema.virtual('calculateNetPayout').get(function() {
  return this.totalSales - this.lottoPayout - this.debitCardDeduction;
});

module.exports = mongoose.model('Sales', salesSchema); 