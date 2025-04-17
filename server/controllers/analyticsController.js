const Commission = require('../models/Commission');
const Scanner = require('../models/Scanner');
const Event = require('../models/Event');

// Get scanner metrics
exports.getScannerMetrics = async (req, res) => {
  try {
    const scannerId = req.params.scannerId;
    const { startDate, endDate } = req.query;

    // Get scan events
    const events = await Event.find({
      scannerId,
      timestamp: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    });

    // Calculate metrics
    const totalScans = events.length;
    const successfulScans = events.filter(e => e.status === 'success').length;
    const errorScans = events.filter(e => e.status === 'error').length;

    // Group by day
    const dailyMetrics = events.reduce((acc, event) => {
      const date = event.timestamp.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          scanCount: 0,
          errorCount: 0
        };
      }
      acc[date].scanCount++;
      if (event.status === 'error') {
        acc[date].errorCount++;
      }
      return acc;
    }, {});

    res.json({
      totalScans,
      successfulScans,
      errorScans,
      successRate: totalScans > 0 ? (successfulScans / totalScans) * 100 : 0,
      errorRate: totalScans > 0 ? (errorScans / totalScans) * 100 : 0,
      dailyMetrics: Object.entries(dailyMetrics).map(([date, metrics]) => ({
        timestamp: date,
        ...metrics
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get system health metrics
exports.getSystemHealth = async (req, res) => {
  try {
    const scannerId = req.params.scannerId;
    const scanner = await Scanner.findById(scannerId);

    if (!scanner) {
      return res.status(404).json({ message: 'Scanner not found' });
    }

    // Calculate uptime (example: last 24 hours)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const events = await Event.find({
      scannerId,
      timestamp: { $gte: last24Hours }
    });

    const totalTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const downtimeEvents = events.filter(e => e.status === 'error');
    const totalDowntime = downtimeEvents.reduce((sum, event) => {
      return sum + (event.duration || 0);
    }, 0);

    const uptime = ((totalTime - totalDowntime) / totalTime) * 100;

    // Calculate average response time
    const responseTimes = events
      .filter(e => e.responseTime)
      .map(e => e.responseTime);
    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    // Calculate success and error rates
    const totalEvents = events.length;
    const successCount = events.filter(e => e.status === 'success').length;
    const errorCount = events.filter(e => e.status === 'error').length;

    res.json({
      uptime: uptime.toFixed(2),
      averageResponseTime: averageResponseTime.toFixed(2),
      successRate: totalEvents > 0 ? (successCount / totalEvents) * 100 : 0,
      errorRate: totalEvents > 0 ? (errorCount / totalEvents) * 100 : 0,
      lastUpdated: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get commission analytics
exports.getCommissionAnalytics = async (req, res) => {
  try {
    const scannerId = req.params.scannerId;
    const { startDate, endDate } = req.query;

    const commissions = await Commission.find({
      scannerId,
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    });

    // Calculate total commission amount
    const totalAmount = commissions.reduce((sum, commission) => sum + commission.amount, 0);

    // Group by status
    const statusDistribution = commissions.reduce((acc, commission) => {
      acc[commission.status] = (acc[commission.status] || 0) + 1;
      return acc;
    }, {});

    // Group by date
    const dailyCommissions = commissions.reduce((acc, commission) => {
      const date = commission.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          amount: 0,
          count: 0
        };
      }
      acc[date].amount += commission.amount;
      acc[date].count++;
      return acc;
    }, {});

    res.json({
      totalAmount,
      statusDistribution,
      dailyCommissions: Object.entries(dailyCommissions).map(([date, data]) => ({
        date,
        ...data
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 