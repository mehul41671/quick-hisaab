const mongoose = require('mongoose');

const scannerProfileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  scannerType: {
    type: String,
    required: true,
    enum: ['webcam', 'serial', 'zebra']
  },
  config: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
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

scannerProfileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ScannerProfile', scannerProfileSchema); 