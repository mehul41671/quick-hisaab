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
  },
  lastResetDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
ticketSchema.index({ gameNumber: 1, storeId: 1 });

// Method to check if ticket needs daily reset
ticketSchema.methods.needsDailyReset = function() {
  if (!this.lastResetDate) return true;
  const lastReset = new Date(this.lastResetDate);
  const now = new Date();
  return lastReset.getDate() !== now.getDate() || 
         lastReset.getMonth() !== now.getMonth() || 
         lastReset.getFullYear() !== now.getFullYear();
};

// Method to perform daily reset
ticketSchema.methods.performDailyReset = function() {
  if (this.lastClosingNumber) {
    this.todayOpenNumber = this.lastClosingNumber;
    this.lastResetDate = new Date();
  }
};

// Static method to reset all tickets for a store
ticketSchema.statics.resetDailyNumbers = async function(storeId) {
  const tickets = await this.find({ storeId, status: 'active' });
  const now = new Date();
  
  for (const ticket of tickets) {
    if (ticket.needsDailyReset()) {
      ticket.performDailyReset();
      await ticket.save();
    }
  }
};

module.exports = mongoose.model('Ticket', ticketSchema); 