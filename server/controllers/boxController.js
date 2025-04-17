const Box = require('../models/Box');
const { broadcast } = require('../websocket');

// Get all boxes
exports.getBoxes = async (req, res) => {
  try {
    const boxes = await Box.find().sort({ lastActive: -1 });
    res.json(boxes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single box
exports.getBox = async (req, res) => {
  try {
    const box = await Box.findById(req.params.id);
    if (!box) {
      return res.status(404).json({ message: 'Box not found' });
    }
    res.json(box);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new box
exports.createBox = async (req, res) => {
  try {
    const box = new Box(req.body);
    const newBox = await box.save();
    res.status(201).json(newBox);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update box metrics
exports.updateBoxMetrics = async (req, res) => {
  try {
    const box = await Box.findById(req.params.id);
    if (!box) {
      return res.status(404).json({ message: 'Box not found' });
    }

    // Update current metrics
    box.metrics = {
      ...box.metrics,
      ...req.body.metrics
    };

    // Add to metrics history
    box.metricsHistory.push({
      timestamp: new Date(),
      metrics: req.body.metrics
    });

    // Update last active timestamp
    box.lastActive = new Date();

    // Check for alerts
    if (req.body.metrics.temperature > 40) {
      box.alerts.push({
        type: 'temperature',
        message: 'High temperature detected',
        severity: 'warning'
      });
    }

    if (req.body.metrics.batteryLevel < 20) {
      box.alerts.push({
        type: 'battery',
        message: 'Low battery warning',
        severity: 'warning'
      });
    }

    const updatedBox = await box.save();
    res.json(updatedBox);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update box status
exports.updateBoxStatus = async (req, res) => {
  try {
    const box = await Box.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!box) {
      return res.status(404).json({ message: 'Box not found' });
    }
    res.json(box);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get box metrics history
exports.getBoxMetricsHistory = async (req, res) => {
  try {
    const box = await Box.findById(req.params.id);
    if (!box) {
      return res.status(404).json({ message: 'Box not found' });
    }
    res.json(box.metricsHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get box alerts
exports.getBoxAlerts = async (req, res) => {
  try {
    const box = await Box.findById(req.params.id);
    if (!box) {
      return res.status(404).json({ message: 'Box not found' });
    }
    res.json(box.alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clear box alerts
exports.clearBoxAlerts = async (req, res) => {
  try {
    const box = await Box.findById(req.params.id);
    if (!box) {
      return res.status(404).json({ message: 'Box not found' });
    }
    box.alerts = [];
    const updatedBox = await box.save();
    res.json(updatedBox);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add alert to box
exports.addAlert = async (req, res) => {
  try {
    const { boxId } = req.params;
    const { message, severity } = req.body;

    const box = await Box.findByIdAndUpdate(
      boxId,
      {
        $push: {
          alerts: {
            message,
            severity,
            timestamp: new Date()
          }
        },
        $set: {
          status: severity === 'error' ? 'error' : 'warning',
          lastActive: new Date()
        }
      },
      { new: true }
    ).select('-__v');

    if (!box) {
      return res.status(404).json({ message: 'Box not found' });
    }

    // Broadcast the alert to all connected clients
    broadcast('box:alert', {
      boxId: box._id,
      alert: box.alerts[box.alerts.length - 1]
    });

    res.json(box);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get box metrics history
exports.getMetricsHistory = async (req, res) => {
  try {
    const { boxId } = req.params;
    const { startDate, endDate } = req.query;

    const box = await Box.findById(boxId).select('metrics');
    
    if (!box) {
      return res.status(404).json({ message: 'Box not found' });
    }

    // Filter metrics based on date range if provided
    let metrics = box.metrics;
    if (startDate && endDate) {
      metrics = metrics.filter(metric => 
        metric.lastUpdated >= new Date(startDate) && 
        metric.lastUpdated <= new Date(endDate)
      );
    }

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all active boxes
const getActiveBoxes = async (req, res) => {
  try {
    const boxes = await Box.find({ isActive: true })
      .sort({ lastUpdated: -1 });
    res.json(boxes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching active boxes' });
  }
};

// Scan ticket
const scanTicket = async (req, res) => {
  try {
    const box = await Box.findById(req.params.boxId);
    if (!box) {
      return res.status(404).json({ message: 'Box not found' });
    }

    // Update closing number
    await box.updateClosingNumber(box.closingNumber + 1);
    
    // Check if it's a new day and reset if needed
    const lastUpdate = new Date(box.lastUpdated);
    const today = new Date();
    if (lastUpdate.getDate() !== today.getDate()) {
      await box.resetForNewDay();
    }

    res.json(box);
  } catch (error) {
    res.status(500).json({ message: 'Error scanning ticket' });
  }
};

// Add manual entry
const addManualEntry = async (req, res) => {
  try {
    const { boxNumber, gameNumber, ticketNumber } = req.body;
    const box = await Box.findOne({ boxNumber });
    
    if (!box) {
      return res.status(404).json({ message: 'Box not found' });
    }

    // Update closing number
    await box.updateClosingNumber(box.closingNumber + 1);
    
    // Check if it's a new day and reset if needed
    const lastUpdate = new Date(box.lastUpdated);
    const today = new Date();
    if (lastUpdate.getDate() !== today.getDate()) {
      await box.resetForNewDay();
    }

    res.json(box);
  } catch (error) {
    res.status(500).json({ message: 'Error adding manual entry' });
  }
};

// Create new box
const createBox = async (req, res) => {
  try {
    const { boxNumber, gameNumber, ticketSerial, ticketCost } = req.body;
    
    const box = new Box({
      boxNumber,
      gameNumber,
      ticketSerial,
      ticketCost,
      openingNumber: 0,
      closingNumber: 0
    });

    await box.save();
    res.status(201).json(box);
  } catch (error) {
    res.status(500).json({ message: 'Error creating box' });
  }
};

// Update box metrics
const updateBoxMetrics = async (req, res) => {
  try {
    const box = await Box.findById(req.params.boxId);
    if (!box) {
      return res.status(404).json({ message: 'Box not found' });
    }

    await box.updateMetrics(req.body);
    res.json(box);
  } catch (error) {
    res.status(500).json({ message: 'Error updating box metrics' });
  }
};

// Get box metrics history
const getBoxMetricsHistory = async (req, res) => {
  try {
    const box = await Box.findById(req.params.boxId);
    if (!box) {
      return res.status(404).json({ message: 'Box not found' });
    }

    res.json(box.metricsHistory);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching box metrics history' });
  }
};

module.exports = {
  getActiveBoxes,
  scanTicket,
  addManualEntry,
  createBox,
  updateBoxMetrics,
  getBoxMetricsHistory
}; 