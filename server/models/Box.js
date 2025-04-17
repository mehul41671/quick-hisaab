const mongoose = require('mongoose');

const boxSchema = new mongoose.Schema({
  boxNumber: {
    type: String,
    required: true,
    unique: true
  },
  gameNumber: {
    type: String,
    required: true
  },
  ticketSerial: {
    type: String,
    required: true
  },
  openingNumber: {
    type: Number,
    required: true,
    default: 0
  },
  closingNumber: {
    type: Number,
    required: true,
    default: 0
  },
  ticketCost: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  displaySettings: {
    showSequence: {
      type: Boolean,
      default: true
    },
    showBoxNumber: {
      type: Boolean,
      default: true
    },
    showGameNumber: {
      type: Boolean,
      default: true
    },
    showTicketSerial: {
      type: Boolean,
      default: true
    },
    showOpeningNumber: {
      type: Boolean,
      default: true
    },
    showClosingNumber: {
      type: Boolean,
      default: true
    },
    showSales: {
      type: Boolean,
      default: true
    }
  },
  metrics: {
    temperature: Number,
    batteryLevel: Number,
    lastActive: Date
  },
  metricsHistory: [{
    temperature: Number,
    batteryLevel: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
});

// Method to update box metrics
boxSchema.methods.updateMetrics = async function(metrics) {
  this.metrics = {
    ...this.metrics,
    ...metrics,
    lastActive: new Date()
  };
  
  this.metricsHistory.push({
    temperature: metrics.temperature,
    batteryLevel: metrics.batteryLevel,
    timestamp: new Date()
  });
  
  await this.save();
};

// Method to calculate ticket sales
boxSchema.methods.calculateSales = function() {
  return (this.closingNumber - this.openingNumber) * this.ticketCost;
};

// Method to update closing number
boxSchema.methods.updateClosingNumber = async function(newNumber) {
  this.closingNumber = newNumber;
  this.lastUpdated = new Date();
  await this.save();
};

// Method to reset for new day
boxSchema.methods.resetForNewDay = async function() {
  this.openingNumber = this.closingNumber;
  this.closingNumber = 0;
  this.lastUpdated = new Date();
  await this.save();
};

// Method to get next suggested ticket
boxSchema.methods.getNextSuggestedTicket = function() {
  return {
    gameNumber: this.gameNumber,
    ticketSerial: this.ticketSerial,
    ticketNumber: this.closingNumber + 1
  };
};

const Box = mongoose.model('Box', boxSchema);

module.exports = Box; 