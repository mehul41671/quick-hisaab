import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import NotificationsIcon from '@mui/icons-material/Notifications';
import RefreshIcon from '@mui/icons-material/Refresh';
import scannerService from '../services/scannerService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AnalyticsDashboard = ({ scannerId }) => {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    commissionTrend: [],
    scannerUsage: [],
    statusDistribution: [],
    performanceMetrics: {}
  });
  const [realTimeData, setRealTimeData] = useState({
    activeScans: 0,
    recentCommissions: [],
    alerts: [],
    systemStatus: 'normal'
  });
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
    setupRealTimeUpdates();
    return () => {
      scannerService.removeEventListener('scannerUpdate', handleScannerUpdate);
      scannerService.removeEventListener('commissionUpdate', handleCommissionUpdate);
      scannerService.removeEventListener('alert', handleAlert);
    };
  }, [scannerId, timeRange]);

  const setupRealTimeUpdates = () => {
    scannerService.addEventListener('scannerUpdate', handleScannerUpdate);
    scannerService.addEventListener('commissionUpdate', handleCommissionUpdate);
    scannerService.addEventListener('alert', handleAlert);
  };

  const handleScannerUpdate = (data) => {
    setRealTimeData(prev => ({
      ...prev,
      activeScans: data.activeScans,
      systemStatus: data.status
    }));
  };

  const handleCommissionUpdate = (data) => {
    setRealTimeData(prev => ({
      ...prev,
      recentCommissions: [data, ...prev.recentCommissions].slice(0, 5)
    }));
  };

  const handleAlert = (data) => {
    setNotifications(prev => [data, ...prev]);
    setRealTimeData(prev => ({
      ...prev,
      alerts: [data, ...prev.alerts].slice(0, 5)
    }));
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [commissions, usage, metrics] = await Promise.all([
        scannerService.getScannerCommissions(scannerId),
        scannerService.getScannerMetrics(scannerId),
        scannerService.getSystemHealth()
      ]);

      const startDate = getStartDate();
      const endDate = new Date();

      // Process commission trend data
      const commissionTrend = processCommissionTrend(commissions, startDate, endDate);
      
      // Process scanner usage data
      const scannerUsage = processScannerUsage(usage, startDate, endDate);
      
      // Process status distribution
      const statusDistribution = processStatusDistribution(commissions);
      
      // Process performance metrics
      const performanceMetrics = processPerformanceMetrics(metrics);

      setAnalyticsData({
        commissionTrend,
        scannerUsage,
        statusDistribution,
        performanceMetrics
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = () => {
    const now = new Date();
    switch (timeRange) {
      case '7d':
        return subDays(now, 7);
      case '30d':
        return subDays(now, 30);
      case '90d':
        return subDays(now, 90);
      default:
        return subDays(now, 7);
    }
  };

  const processCommissionTrend = (commissions, startDate, endDate) => {
    const days = [];
    let currentDate = startDate;
    
    while (currentDate <= endDate) {
      const dayCommissions = commissions.filter(commission => {
        const commissionDate = new Date(commission.createdAt);
        return commissionDate >= startOfDay(currentDate) && 
               commissionDate <= endOfDay(currentDate);
      });

      const totalAmount = dayCommissions.reduce((sum, commission) => sum + commission.amount, 0);
      
      days.push({
        date: format(currentDate, 'MMM d'),
        amount: totalAmount
      });

      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }

    return days;
  };

  const processScannerUsage = (usage, startDate, endDate) => {
    // Process scanner usage data
    return usage.map(entry => ({
      date: format(new Date(entry.timestamp), 'MMM d'),
      scans: entry.scanCount,
      errors: entry.errorCount
    }));
  };

  const processStatusDistribution = (commissions) => {
    const statusCount = commissions.reduce((acc, commission) => {
      acc[commission.status] = (acc[commission.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCount).map(([status, count]) => ({
      name: status,
      value: count
    }));
  };

  const processPerformanceMetrics = (metrics) => {
    return {
      uptime: metrics.uptime,
      averageResponseTime: metrics.averageResponseTime,
      successRate: metrics.successRate,
      errorRate: metrics.errorRate
    };
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Analytics Dashboard</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchAnalyticsData}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Notifications">
            <IconButton>
              <Badge badgeContent={notifications.length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Real-time Status Bar */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle1">Active Scans</Typography>
            <Typography variant="h4">{realTimeData.activeScans}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle1">System Status</Typography>
            <Chip
              label={realTimeData.systemStatus}
              color={realTimeData.systemStatus === 'normal' ? 'success' : 'error'}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle1">Recent Commissions</Typography>
            <Typography variant="h4">{realTimeData.recentCommissions.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle1">Active Alerts</Typography>
            <Typography variant="h4">{realTimeData.alerts.length}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Commission Trend Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Commission Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.commissionTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#8884d8"
                  name="Commission Amount"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Status Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Commission Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.statusDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {analyticsData.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Scanner Usage */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Scanner Usage
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.scannerUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="scans" fill="#8884d8" name="Successful Scans" />
                <Bar dataKey="errors" fill="#ff8042" name="Errors" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Performance Metrics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Performance Metrics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle1">Uptime</Typography>
                  <Typography variant="h4">
                    {analyticsData.performanceMetrics.uptime}%
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle1">Avg Response Time</Typography>
                  <Typography variant="h4">
                    {analyticsData.performanceMetrics.averageResponseTime}ms
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle1">Success Rate</Typography>
                  <Typography variant="h4">
                    {analyticsData.performanceMetrics.successRate}%
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle1">Error Rate</Typography>
                  <Typography variant="h4">
                    {analyticsData.performanceMetrics.errorRate}%
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activity Section */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Commissions
            </Typography>
            {realTimeData.recentCommissions.map((commission, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Typography variant="body2">
                  {format(new Date(commission.timestamp), 'MMM d, HH:mm')} - 
                  ${commission.amount.toFixed(2)} ({commission.rate}%)
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Active Alerts
            </Typography>
            {realTimeData.alerts.map((alert, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Chip
                  label={alert.severity}
                  color={alert.severity === 'error' ? 'error' : 'warning'}
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" component="span">
                  {alert.message}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard; 