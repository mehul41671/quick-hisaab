const mongoose = require('mongoose');

const scannerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['webcam', 'serial', 'zebra']
  },
  config: {
    port: String,
    baudRate: Number,
    dataBits: Number,
    stopBits: Number,
    parity: String
  },
  firmwareVersion: {
    type: String,
    default: '1.0.0'
  },
  lastCalibration: {
    type: Date,
    default: Date.now
  },
  calibration: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'error'],
    default: 'active'
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

scannerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Scanner', scannerSchema); 