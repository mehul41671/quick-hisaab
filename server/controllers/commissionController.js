const Commission = require('../models/Commission');
const Scanner = require('../models/Scanner');

// Get all commissions for a scanner
exports.getCommissions = async (req, res) => {
  try {
    const commissions = await Commission.find({ scannerId: req.params.scannerId })
      .sort({ createdAt: -1 });
    res.json(commissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new commission
exports.addCommission = async (req, res) => {
  try {
    const scanner = await Scanner.findById(req.params.scannerId);
    if (!scanner) {
      return res.status(404).json({ message: 'Scanner not found' });
    }

    const { amount, commissionRate, notes } = req.body;
    const commission = new Commission({
      scannerId: req.params.scannerId,
      amount,
      commissionRate,
      notes
    });

    const newCommission = await commission.save();
    res.status(201).json(newCommission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update commission status
exports.updateCommissionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updateData = { status };

    if (status === 'paid') {
      updateData.paymentDate = new Date();
    }

    const commission = await Commission.findByIdAndUpdate(
      req.params.commissionId,
      updateData,
      { new: true }
    );

    if (!commission) {
      return res.status(404).json({ message: 'Commission not found' });
    }

    res.json(commission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get commission summary
exports.getCommissionSummary = async (req, res) => {
  try {
    const commissions = await Commission.find({ scannerId: req.params.scannerId });
    
    const summary = commissions.reduce((acc, commission) => {
      if (!acc[commission.status]) {
        acc[commission.status] = {
          count: 0,
          totalAmount: 0
        };
      }
      acc[commission.status].count++;
      acc[commission.status].totalAmount += commission.amount;
      return acc;
    }, {});

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 