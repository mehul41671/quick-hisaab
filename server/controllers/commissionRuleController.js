const CommissionRule = require('../models/CommissionRule');
const Scanner = require('../models/Scanner');

// Get all commission rules for a scanner
exports.getCommissionRules = async (req, res) => {
  try {
    const rules = await CommissionRule.find({
      scannerId: req.params.scannerId,
      isActive: true
    }).sort({ createdAt: -1 });
    res.json(rules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new commission rule
exports.createCommissionRule = async (req, res) => {
  try {
    const scanner = await Scanner.findById(req.params.scannerId);
    if (!scanner) {
      return res.status(404).json({ message: 'Scanner not found' });
    }

    const { name, rate, conditions } = req.body;
    const rule = new CommissionRule({
      scannerId: req.params.scannerId,
      name,
      rate,
      conditions
    });

    const newRule = await rule.save();
    res.status(201).json(newRule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a commission rule
exports.updateCommissionRule = async (req, res) => {
  try {
    const rule = await CommissionRule.findByIdAndUpdate(
      req.params.ruleId,
      req.body,
      { new: true }
    );

    if (!rule) {
      return res.status(404).json({ message: 'Commission rule not found' });
    }

    res.json(rule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a commission rule
exports.deleteCommissionRule = async (req, res) => {
  try {
    const rule = await CommissionRule.findByIdAndUpdate(
      req.params.ruleId,
      { isActive: false },
      { new: true }
    );

    if (!rule) {
      return res.status(404).json({ message: 'Commission rule not found' });
    }

    res.json({ message: 'Commission rule deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Calculate commission based on rules
exports.calculateCommission = async (req, res) => {
  try {
    const { amount, volume, ruleId, customRate } = req.body;
    const scannerId = req.params.scannerId;

    let rate;
    if (customRate) {
      rate = customRate;
    } else if (ruleId) {
      const rule = await CommissionRule.findById(ruleId);
      if (!rule) {
        return res.status(404).json({ message: 'Commission rule not found' });
      }
      rate = rule.rate;
    } else {
      // Find the best matching rule based on amount and volume
      const rules = await CommissionRule.find({
        scannerId,
        isActive: true,
        'conditions.minAmount': { $lte: amount },
        'conditions.minVolume': { $lte: volume }
      }).sort({ rate: -1 });

      if (rules.length === 0) {
        return res.status(400).json({ message: 'No matching commission rule found' });
      }

      rate = rules[0].rate;
    }

    const commissionAmount = (amount * rate) / 100;
    const totalAmount = amount + commissionAmount;

    res.json({
      baseAmount: amount,
      rate,
      commissionAmount,
      totalAmount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 