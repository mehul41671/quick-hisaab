const mongoose = require('mongoose');

const scannerEventSchema = new mongoose.Schema({
  scannerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scanner',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['scan', 'error', 'diagnostic', 'calibration', 'firmware_update']
  },
  status: {
    type: String,
    enum: ['success', 'failure', 'warning'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  }
});

// Create indexes for efficient querying
scannerEventSchema.index({ scannerId: 1, timestamp: -1 });
scannerEventSchema.index({ type: 1, timestamp: -1 });
scannerEventSchema.index({ status: 1, timestamp: -1 });

module.exports = mongoose.model('ScannerEvent', scannerEventSchema); 