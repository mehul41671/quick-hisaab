const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
  scannerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scanner',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  commissionRate: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  paymentDate: {
    type: Date
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Commission', commissionSchema); 