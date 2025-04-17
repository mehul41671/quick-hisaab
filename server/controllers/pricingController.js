const Pricing = require('../models/Pricing');

exports.getPricing = async (req, res) => {
  try {
    const pricing = await Pricing.findOne();
    if (!pricing) {
      // Create default pricing if none exists
      const defaultPricing = new Pricing({
        pro: {
          monthly: 7.99,
          annual: 76.70,
        },
      });
      await defaultPricing.save();
      return res.json(defaultPricing);
    }
    res.json(pricing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePricing = async (req, res) => {
  try {
    const { plan, cycle, value } = req.body;
    
    // Validate input
    if (!plan || !cycle || value === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get current pricing
    let pricing = await Pricing.findOne();
    if (!pricing) {
      pricing = new Pricing();
    }

    // Update the specific price
    pricing[plan][cycle] = value;

    // If updating monthly price, automatically update annual price with 20% discount
    if (cycle === 'monthly') {
      pricing[plan].annual = (value * 12 * 0.8).toFixed(2);
    }

    await pricing.save();
    res.json(pricing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 