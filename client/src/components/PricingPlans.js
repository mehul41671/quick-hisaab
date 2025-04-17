import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  Star as StarIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import subscriptionService from '../services/subscriptionService';

const PricingPlans = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
  });

  useEffect(() => {
    // Check current subscription status
    const checkSubscription = async () => {
      try {
        const subscription = await subscriptionService.getCurrentSubscription();
        if (subscription) {
          setSelectedPlan(subscription.plan);
        }
      } catch (err) {
        console.error('Error checking subscription:', err);
      }
    };
    checkSubscription();
  }, []);

  const plans = [
    {
      name: 'Free',
      price: {
        monthly: 0,
        annual: 0,
      },
      features: [
        'Basic ticket scanning',
        'Limited to 100 scans per day',
        'Basic reporting',
        'Email support',
      ],
      buttonText: 'Start Free Trial',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: {
        monthly: 7.99,
        annual: 76.70, // 7.99 * 12 * 0.8 (20% discount)
      },
      features: [
        'Unlimited ticket scanning',
        'Advanced reporting',
        'Priority support',
        'Custom integrations',
        'API access',
        'Bulk operations',
      ],
      buttonText: 'Subscribe Now',
      highlighted: true,
    },
  ];

  const handleSubscribe = async (plan) => {
    if (plan.name === 'Free') {
      try {
        setLoading(true);
        await subscriptionService.createSubscription('free', 'monthly', null);
        setSelectedPlan('free');
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      setSelectedPlan(plan.name);
      setPaymentDialogOpen(true);
    }
  };

  const handlePaymentSubmit = async () => {
    try {
      setLoading(true);
      await subscriptionService.createSubscription(
        selectedPlan.toLowerCase(),
        billingCycle,
        paymentDetails
      );
      setPaymentDialogOpen(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Choose Your Plan
        </Typography>
        <Typography color="text.secondary" paragraph>
          Select the plan that best fits your needs
        </Typography>
        
        <ToggleButtonGroup
          value={billingCycle}
          exclusive
          onChange={(e, newValue) => newValue && setBillingCycle(newValue)}
          sx={{ mb: 4 }}
        >
          <ToggleButton value="monthly">Monthly</ToggleButton>
          <ToggleButton value="annual">Annual (Save 20%)</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {error && (
        <Typography color="error" align="center" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Grid container spacing={3} justifyContent="center">
        {plans.map((plan) => (
          <Grid item xs={12} md={6} key={plan.name}>
            <Card
              sx={{
                height: '100%',
                border: plan.highlighted ? '2px solid #1976d2' : 'none',
                position: 'relative',
              }}
            >
              {plan.highlighted && (
                <Chip
                  icon={<StarIcon />}
                  label="Popular"
                  color="primary"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                  }}
                />
              )}
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {plan.name}
                </Typography>
                <Typography variant="h3" component="div" gutterBottom>
                  ${billingCycle === 'monthly' ? plan.price.monthly : plan.price.annual}
                  <Typography
                    component="span"
                    variant="h6"
                    color="text.secondary"
                  >
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </Typography>
                </Typography>
                {billingCycle === 'annual' && plan.name === 'Pro' && (
                  <Typography color="success.main" gutterBottom>
                    Save 20% with annual billing
                  </Typography>
                )}
                <Divider sx={{ my: 2 }} />
                <List>
                  {plan.features.map((feature, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        {plan.name === 'Free' && index > 0 ? (
                          <CloseIcon color="error" />
                        ) : (
                          <CheckIcon color="success" />
                        )}
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
                <Button
                  variant={plan.highlighted ? 'contained' : 'outlined'}
                  color={plan.highlighted ? 'primary' : 'inherit'}
                  fullWidth
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading || selectedPlan === plan.name.toLowerCase()}
                  sx={{ mt: 2 }}
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : selectedPlan === plan.name.toLowerCase() ? (
                    'Current Plan'
                  ) : (
                    plan.buttonText
                  )}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)}>
        <DialogTitle>Enter Payment Details</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Card Number"
            value={paymentDetails.cardNumber}
            onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Expiry Date"
            value={paymentDetails.expiryDate}
            onChange={(e) => setPaymentDetails({ ...paymentDetails, expiryDate: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="CVV"
            value={paymentDetails.cvv}
            onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Name on Card"
            value={paymentDetails.name}
            onChange={(e) => setPaymentDetails({ ...paymentDetails, name: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handlePaymentSubmit}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Subscribe'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PricingPlans; 