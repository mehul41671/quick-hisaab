const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  gameNumber: {
    type: String,
    required: true
  },
  gameName: {
    type: String,
    required: true
  },
  startSerial: {
    type: String,
    required: true
  },
  endSerial: {
    type: String,
    required: true
  },
  currentSerial: {
    type: String,
    default: null
  },
  ticketPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'returned'],
    default: 'active'
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  activationDate: {
    type: Date,
    default: Date.now
  },
  deactivationDate: {
    type: Date,
    default: null
  },
  returnDate: {
    type: Date,
    default: null
  },
  gameImage: {
    type: String,
    default: null
  },
  lastClosingNumber: {
    type: String,
    default: null
  },
  todayOpenNumber: {
    type: String,
    default: null
  },
  scannedCount: {
    type: Number,
    default: 0
  },
  totalTickets: {
    type: Number,
    required: true
  },
  remainingTickets: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
ticketSchema.index({ gameNumber: 1, storeId: 1 });
ticketSchema.index({ status: 1, storeId: 1 });

module.exports = mongoose.model('Ticket', ticketSchema); 