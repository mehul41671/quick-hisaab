const mongoose = require('mongoose');

const faceSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  label: {
    type: String,
    required: true
  },
  descriptor: {
    type: [Number],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Indexes for faster queries
faceSchema.index({ userId: 1 });
faceSchema.index({ label: 1 });
faceSchema.index({ createdAt: -1 });

const Face = mongoose.model('Face', faceSchema);

module.exports = Face; 