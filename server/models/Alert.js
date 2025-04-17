const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['error', 'warning', 'info', 'success']
  },
  message: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical']
  },
  scannerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scanner',
    required: false
  },
  acknowledged: {
    type: Boolean,
    default: false
  },
  acknowledgedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for faster queries
alertSchema.index({ createdAt: -1 });
alertSchema.index({ acknowledged: 1 });
alertSchema.index({ scannerId: 1 });

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert; 