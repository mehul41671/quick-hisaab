const Subscription = require('../models/Subscription');
const Store = require('../models/Store');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Get subscription plans
exports.getPlans = async (req, res) => {
  try {
    const plans = {
      basic: {
        name: 'Basic Plan',
        price: 49.99,
        features: {
          maxBoxes: 5,
          maxUsers: 3,
          analytics: false,
          apiAccess: false,
          prioritySupport: false
        }
      },
      standard: {
        name: 'Standard Plan',
        price: 99.99,
        features: {
          maxBoxes: 15,
          maxUsers: 10,
          analytics: true,
          apiAccess: false,
          prioritySupport: false
        }
      },
      premium: {
        name: 'Premium Plan',
        price: 199.99,
        features: {
          maxBoxes: 50,
          maxUsers: 25,
          analytics: true,
          apiAccess: true,
          prioritySupport: true
        }
      }
    };

    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new subscription
exports.createSubscription = async (req, res) => {
  try {
    const { storeId, plan, billingCycle } = req.body;
    
    // Get plan details
    const plans = await exports.getPlans(req, res);
    const selectedPlan = plans[plan];

    if (!selectedPlan) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }

    // Calculate end date based on billing cycle
    const startDate = new Date();
    let endDate = new Date();
    
    switch (billingCycle) {
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'quarterly':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case 'yearly':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      default:
        return res.status(400).json({ message: 'Invalid billing cycle' });
    }

    // Create subscription
    const subscription = new Subscription({
      storeId,
      plan,
      startDate,
      endDate,
      features: selectedPlan.features,
      price: selectedPlan.price,
      billingCycle
    });

    await subscription.save();

    // Update store with subscription
    await Store.findByIdAndUpdate(storeId, {
      subscription: subscription._id
    });

    res.status(201).json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update subscription
exports.updateSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { plan, billingCycle } = req.body;

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Get plan details
    const plans = await exports.getPlans(req, res);
    const selectedPlan = plans[plan];

    if (!selectedPlan) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }

    // Update subscription
    subscription.plan = plan;
    subscription.features = selectedPlan.features;
    subscription.price = selectedPlan.price;
    subscription.billingCycle = billingCycle;

    await subscription.save();

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    subscription.status = 'cancelled';
    await subscription.save();

    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get subscription status
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const { storeId } = req.params;

    const subscription = await Subscription.findOne({ storeId });
    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePaymentMethod = async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const subscription = await Subscription.findOne({
      userId: req.user._id,
      status: 'active'
    });

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    // Update payment method in Stripe
    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: subscription.paymentId,
    });

    res.json({ message: 'Payment method updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 