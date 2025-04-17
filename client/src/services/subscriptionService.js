import axios from 'axios';

class SubscriptionService {
  constructor() {
    this.api = axios.create({
      baseURL: '/api/subscriptions',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async createSubscription(plan, billingCycle, paymentMethod) {
    try {
      const response = await this.api.post('/', {
        plan,
        billingCycle,
        paymentMethod,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create subscription');
    }
  }

  async getCurrentSubscription() {
    try {
      const response = await this.api.get('/current');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get subscription');
    }
  }

  async cancelSubscription() {
    try {
      const response = await this.api.post('/cancel');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to cancel subscription');
    }
  }

  async updatePaymentMethod(paymentMethod) {
    try {
      const response = await this.api.put('/payment-method', { paymentMethod });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update payment method');
    }
  }
}

export default new SubscriptionService(); 