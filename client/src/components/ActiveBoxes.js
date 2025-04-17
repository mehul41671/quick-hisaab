import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  LinearProgress,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  Divider,
  useTheme,
} from '@mui/material';
import {
  QrCodeScanner as ScannerIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  BatteryFull as BatteryIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  FilterList as FilterIcon,
  Notifications as NotificationsIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  PlaylistAdd as PlaylistAddIcon,
  Speed as SpeedIcon,
  Timer as TimerIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Memory as MemoryIcon,
  NetworkCheck as NetworkIcon,
  Storage as StorageIcon,
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  LocalActivity as GameIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ActiveBoxes = () => {
  const theme = useTheme();
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    boxNumber: '',
    gameNumber: '',
    ticketNumber: '',
  });
  const [suggestedTickets, setSuggestedTickets] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState('all');
  const [dateRange, setDateRange] = useState('today');
  const [selectedBoxes, setSelectedBoxes] = useState([]);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [selectedBoxHistory, setSelectedBoxHistory] = useState(null);
  const [historyTab, setHistoryTab] = useState(0);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [performanceMetrics, setPerformanceMetrics] = useState({
    // System Metrics
    scanSuccessRate: 98.5,
    systemUptime: 99.9,
    responseTime: 0.8,
    errorRate: 0.2,
    cpuUsage: 45,
    memoryUsage: 60,
    networkLatency: 120,
    databasePerformance: 95,

    // Box Metrics
    boxScanSuccess: {
      'Box 1': 99.2,
      'Box 2': 98.8,
      'Box 3': 97.5,
      'Box 4': 99.0,
    },
    boxBatteryLevels: {
      'Box 1': 85,
      'Box 2': 45,
      'Box 3': 20,
      'Box 4': 75,
    },
    boxConnectivity: {
      'Box 1': 'excellent',
      'Box 2': 'good',
      'Box 3': 'poor',
      'Box 4': 'excellent',
    },

    // Sales Metrics
    salesPerHour: [120, 150, 180, 200, 220, 250, 230, 210, 190, 170, 150, 130],
    peakSalesPeriod: '14:00 - 16:00',
    averageTicketValue: 25.50,
    salesGrowthRate: 12.5,

    // User Activity
    activeUsers: {
      '8:00': 15,
      '10:00': 25,
      '12:00': 40,
      '14:00': 55,
      '16:00': 45,
      '18:00': 30,
    },
    averageSessionDuration: 45,
    userRetentionRate: 85,

    // Game Performance
    gameSales: {
      'Game 1': 1200,
      'Game 2': 950,
      'Game 3': 800,
      'Game 4': 650,
      'Game 5': 500,
    },
    gameTrends: {
      'Game 1': [100, 120, 110, 130, 140, 150],
      'Game 2': [90, 95, 100, 105, 110, 115],
      'Game 3': [80, 85, 90, 95, 100, 105],
    },
  });
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'warning',
      message: 'Box #3 battery level below 20%',
      timestamp: new Date(),
      icon: <BatteryIcon />,
    },
    {
      id: 2,
      type: 'info',
      message: 'System maintenance scheduled for tonight',
      timestamp: new Date(),
      icon: <InfoIcon />,
    },
    {
      id: 3,
      type: 'success',
      message: 'New record: 150 scans in last hour',
      timestamp: new Date(),
      icon: <CheckCircleIcon />,
    },
  ]);
  const ws = useRef(null);

  useEffect(() => {
    fetchActiveBoxes();
    // Initialize WebSocket connection
    ws.current = new WebSocket('ws://localhost:5000/ws');
    
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const fetchActiveBoxes = async () => {
    try {
      const response = await axios.get('/api/boxes/active');
      setBoxes(response.data);
      
      // Get suggested tickets for each box
      const suggestions = {};
      response.data.forEach(box => {
        suggestions[box._id] = {
          gameNumber: box.gameNumber,
          ticketSerial: box.ticketSerial,
          ticketNumber: box.closingNumber + 1
        };
      });
      setSuggestedTickets(suggestions);
      
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch active boxes');
      setLoading(false);
    }
  };

  const handleScan = async (boxId) => {
    setScanning(true);
    try {
      const response = await axios.post(`/api/boxes/${boxId}/scan`);
      fetchActiveBoxes(); // Refresh the list
    } catch (err) {
      setError('Failed to scan ticket');
    }
    setScanning(false);
  };

  const handleManualEntry = async (boxId) => {
    try {
      await axios.post(`/api/boxes/${boxId}/manual-entry`, manualEntry);
      fetchActiveBoxes(); // Refresh the list
      setManualEntry({ boxNumber: '', gameNumber: '', ticketNumber: '' });
    } catch (err) {
      setError('Failed to add manual entry');
    }
  };

  const calculateTicketSales = (box) => {
    const ticketsSold = box.closingNumber - box.openingNumber;
    return ticketsSold * box.ticketCost;
  };

  const calculateTotalSales = () => {
    return boxes.reduce((total, box) => total + calculateTicketSales(box), 0);
  };

  const handleQuickScan = async (boxId) => {
    setScanning(true);
    try {
      const response = await axios.post(`/api/boxes/${boxId}/quick-scan`, {
        ticketNumber: suggestedTickets[boxId]?.ticketNumber
      });
      fetchActiveBoxes();
    } catch (err) {
      setError('Failed to quick scan ticket');
    }
    setScanning(false);
  };

  const handleResetDay = async (boxId) => {
    try {
      await axios.post(`/api/boxes/${boxId}/reset-day`);
      fetchActiveBoxes();
    } catch (err) {
      setError('Failed to reset day');
    }
  };

  const handleViewHistory = (box) => {
    setSelectedBoxHistory(box);
    setShowHistoryDialog(true);
  };

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'scan':
        handleNewScan(data);
        break;
      case 'alert':
        handleAlert(data);
        break;
      case 'status':
        handleStatusUpdate(data);
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  };

  const handleNewScan = (data) => {
    setNotifications(prev => [...prev, {
      type: 'scan',
      message: `New scan for Box ${data.boxNumber}`,
      timestamp: new Date()
    }]);
    setNotificationMessage(`New scan for Box ${data.boxNumber}`);
    setShowNotification(true);
    fetchActiveBoxes();
  };

  const handleAlert = (data) => {
    setNotifications(prev => [...prev, {
      type: 'alert',
      message: data.message,
      severity: data.severity,
      timestamp: new Date()
    }]);
    setNotificationMessage(data.message);
    setShowNotification(true);
  };

  const handleStatusUpdate = (data) => {
    setBoxes(prev => prev.map(box => 
      box._id === data.boxId ? { ...box, ...data.updates } : box
    ));
  };

  const handleBoxSelection = (boxId) => {
    setSelectedBoxes(prev => 
      prev.includes(boxId)
        ? prev.filter(id => id !== boxId)
        : [...prev, boxId]
    );
  };

  const handleBulkScan = async () => {
    try {
      await Promise.all(selectedBoxes.map(boxId => 
        axios.post(`/api/boxes/${boxId}/quick-scan`, {
          ticketNumber: suggestedTickets[boxId]?.ticketNumber
        })
      ));
      fetchActiveBoxes();
      setSelectedBoxes([]);
    } catch (err) {
      setError('Failed to perform bulk scan');
    }
  };

  const handleBulkReset = async () => {
    try {
      await Promise.all(selectedBoxes.map(boxId => 
        axios.post(`/api/boxes/${boxId}/reset-day`)
      ));
      fetchActiveBoxes();
      setSelectedBoxes([]);
    } catch (err) {
      setError('Failed to perform bulk reset');
    }
  };

  const filteredBoxes = boxes.filter(box => {
    const matchesSearch = box.boxNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         box.gameNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGame = selectedGame === 'all' || box.gameNumber === selectedGame;
    return matchesSearch && matchesGame;
  });

  const getBatteryLevelColor = (level) => {
    if (level > 70) return 'success';
    if (level > 30) return 'warning';
    return 'error';
  };

  const getSalesChartData = () => {
    const labels = boxes.map(box => box.boxNumber);
    const data = boxes.map(box => calculateTicketSales(box));

    return {
      labels,
      datasets: [
        {
          label: 'Sales by Box',
          data,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    };
  };

  const getPeakHoursData = () => {
    // Implement peak hours calculation
    return {
      labels: ['8AM', '10AM', '12PM', '2PM', '4PM', '6PM'],
      datasets: [
        {
          label: 'Scans per Hour',
          data: [12, 19, 15, 25, 22, 18],
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1
        }
      ]
    };
  };

  const getStatusCardStyle = (status) => ({
    backgroundColor: status === 'active' ? theme.palette.success.light : theme.palette.error.light,
    color: status === 'active' ? theme.palette.success.dark : theme.palette.error.dark,
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
    },
  });

  const getMetricCardStyle = {
    backgroundColor: theme.palette.background.paper,
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
    },
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning':
        return <ErrorIcon color="warning" />;
      case 'info':
        return <InfoIcon color="info" />;
      case 'success':
        return <CheckCircleIcon color="success" />;
      default:
        return <InfoIcon />;
    }
  };

  const getPerformanceTrend = (metric) => {
    return metric > 95 ? (
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <ArrowUpwardIcon color="success" fontSize="small" />
        <Typography variant="caption" color="success.main">
          +2.5%
        </Typography>
      </Stack>
    ) : (
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <ArrowDownwardIcon color="error" fontSize="small" />
        <Typography variant="caption" color="error.main">
          -1.2%
        </Typography>
      </Stack>
    );
  };

  const getConnectivityColor = (status) => {
    switch (status) {
      case 'excellent': return 'success';
      case 'good': return 'info';
      case 'poor': return 'warning';
      default: return 'error';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Quick Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={getStatusCardStyle('active')}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  p: 1,
                  borderRadius: '50%',
                }}>
                  <SpeedIcon sx={{ fontSize: 30 }} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {boxes.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Active Boxes
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={getMetricCardStyle}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ 
                  backgroundColor: theme.palette.primary.light,
                  p: 1,
                  borderRadius: '50%',
                }}>
                  <MoneyIcon sx={{ fontSize: 30, color: theme.palette.primary.dark }} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    ${calculateTotalSales()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Today's Sales
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={getMetricCardStyle}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ 
                  backgroundColor: theme.palette.secondary.light,
                  p: 1,
                  borderRadius: '50%',
                }}>
                  <TimerIcon sx={{ fontSize: 30, color: theme.palette.secondary.dark }} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="secondary">
                    2.5s
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg. Scan Time
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={getMetricCardStyle}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ 
                  backgroundColor: theme.palette.warning.light,
                  p: 1,
                  borderRadius: '50%',
                }}>
                  <StarIcon sx={{ fontSize: 30, color: theme.palette.warning.dark }} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="warning">
                    98%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    System Health
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* System Health Metrics */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: theme.palette.primary.main, fontStyle: 'italic' }}>
          System Health
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ height: 300 }}>
              <Line
                data={{
                  labels: ['CPU', 'Memory', 'Network', 'Database'],
                  datasets: [{
                    label: 'System Resources',
                    data: [
                      performanceMetrics.cpuUsage,
                      performanceMetrics.memoryUsage,
                      performanceMetrics.networkLatency,
                      performanceMetrics.databasePerformance
                    ],
                    backgroundColor: [
                      theme.palette.primary.main,
                      theme.palette.secondary.main,
                      theme.palette.success.main,
                      theme.palette.warning.main,
                    ],
                  }]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              {Object.entries({
                cpuUsage: { icon: <MemoryIcon />, label: 'CPU Usage' },
                memoryUsage: { icon: <StorageIcon />, label: 'Memory Usage' },
                networkLatency: { icon: <NetworkIcon />, label: 'Network Latency' },
                databasePerformance: { icon: <DatabaseIcon />, label: 'Database Performance' },
              }).map(([key, { icon, label }]) => (
                <Grid item xs={6} key={key}>
                  <Card sx={getMetricCardStyle}>
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        {icon}
                        <Box>
                          <Typography variant="h6">{label}</Typography>
                          <Typography variant="h4" fontWeight="bold">
                            {performanceMetrics[key]}%
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Box Performance */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: theme.palette.primary.main, fontStyle: 'italic' }}>
          Box Performance
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ height: 300 }}>
              <Bar
                data={{
                  labels: Object.keys(performanceMetrics.boxScanSuccess),
                  datasets: [{
                    label: 'Scan Success Rate',
                    data: Object.values(performanceMetrics.boxScanSuccess),
                    backgroundColor: theme.palette.primary.main,
                  }]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              {Object.entries(performanceMetrics.boxBatteryLevels).map(([box, level]) => (
                <Paper key={box} sx={{ p: 2, borderRadius: '8px' }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="h6" sx={{ minWidth: '80px' }}>{box}</Typography>
                    <Box sx={{ flexGrow: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={level}
                        color={level > 70 ? 'success' : level > 30 ? 'warning' : 'error'}
                      />
                    </Box>
                    <Chip 
                      label={`${level}%`}
                      color={level > 70 ? 'success' : level > 30 ? 'warning' : 'error'}
                    />
                    <Chip 
                      label={performanceMetrics.boxConnectivity[box]}
                      color={getConnectivityColor(performanceMetrics.boxConnectivity[box])}
                    />
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Sales Performance */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: theme.palette.primary.main, fontStyle: 'italic' }}>
          Sales Performance
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ height: 300 }}>
              <Line
                data={{
                  labels: ['8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM', '10PM'],
                  datasets: [{
                    label: 'Sales per Hour',
                    data: performanceMetrics.salesPerHour,
                    borderColor: theme.palette.primary.main,
                    tension: 0.4,
                  }]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Card sx={getMetricCardStyle}>
                <CardContent>
                  <Typography variant="h6">Peak Sales Period</Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {performanceMetrics.peakSalesPeriod}
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={getMetricCardStyle}>
                <CardContent>
                  <Typography variant="h6">Average Ticket Value</Typography>
                  <Typography variant="h4" fontWeight="bold">
                    ${performanceMetrics.averageTicketValue}
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={getMetricCardStyle}>
                <CardContent>
                  <Typography variant="h6">Sales Growth Rate</Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    +{performanceMetrics.salesGrowthRate}%
                  </Typography>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* User Activity */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: theme.palette.primary.main, fontStyle: 'italic' }}>
          User Activity
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ height: 300 }}>
              <Line
                data={{
                  labels: Object.keys(performanceMetrics.activeUsers),
                  datasets: [{
                    label: 'Active Users',
                    data: Object.values(performanceMetrics.activeUsers),
                    borderColor: theme.palette.secondary.main,
                    tension: 0.4,
                  }]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Card sx={getMetricCardStyle}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <AccessTimeIcon />
                    <Box>
                      <Typography variant="h6">Avg. Session Duration</Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {performanceMetrics.averageSessionDuration}m
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
              <Card sx={getMetricCardStyle}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <PeopleIcon />
                    <Box>
                      <Typography variant="h6">User Retention</Typography>
                      <Typography variant="h4" fontWeight="bold" color="success.main">
                        {performanceMetrics.userRetentionRate}%
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Game Performance */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: theme.palette.primary.main, fontStyle: 'italic' }}>
          Game Performance
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ height: 300 }}>
              <Doughnut
                data={{
                  labels: Object.keys(performanceMetrics.gameSales),
                  datasets: [{
                    data: Object.values(performanceMetrics.gameSales),
                    backgroundColor: [
                      theme.palette.primary.main,
                      theme.palette.secondary.main,
                      theme.palette.success.main,
                      theme.palette.warning.main,
                      theme.palette.error.main,
                    ],
                  }]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'right',
                    },
                  },
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ height: 300 }}>
              <Line
                data={{
                  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
                  datasets: Object.entries(performanceMetrics.gameTrends).map(([game, data]) => ({
                    label: game,
                    data: data,
                    borderColor: theme.palette[game === 'Game 1' ? 'primary' : game === 'Game 2' ? 'secondary' : 'success'].main,
                    tension: 0.4,
                  }))
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="Search boxes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <Select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <FilterIcon />
                </InputAdornment>
              }
            >
              <MenuItem value="all">All Games</MenuItem>
              {[...new Set(boxes.map(box => box.gameNumber))].map(game => (
                <MenuItem key={game} value={game}>{game}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={<PlaylistAddIcon />}
          onClick={handleBulkScan}
          disabled={selectedBoxes.length === 0}
        >
          Bulk Scan
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleBulkReset}
          disabled={selectedBoxes.length === 0}
        >
          Bulk Reset
        </Button>
        <Button
          variant="outlined"
          startIcon={<BarChartIcon />}
          onClick={() => setShowAnalytics(!showAnalytics)}
        >
          Analytics
        </Button>
      </Box>

      {showAnalytics && (
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Sales by Box
                </Typography>
                <Line data={getSalesChartData()} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Peak Hours
                </Typography>
                <Line data={getPeakHoursData()} />
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      <TableContainer 
        component={Paper} 
        sx={{ 
          maxHeight: 'calc(100vh - 300px)',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          '& .MuiTableHead-root': {
            backgroundColor: theme.palette.primary.main,
            '& .MuiTableCell-head': {
              color: theme.palette.primary.contrastText,
              fontWeight: 'bold',
              fontSize: '1rem',
            },
          },
          '& .MuiTableBody-root': {
            '& .MuiTableRow-root': {
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
                transform: 'scale(1.01)',
              },
            },
          },
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedBoxes.length === boxes.length}
                  indeterminate={selectedBoxes.length > 0 && selectedBoxes.length < boxes.length}
                  onChange={() => {
                    if (selectedBoxes.length === boxes.length) {
                      setSelectedBoxes([]);
                    } else {
                      setSelectedBoxes(boxes.map(box => box._id));
                    }
                  }}
                />
              </TableCell>
              <TableCell sx={{ width: '5%', fontWeight: 'bold' }}>#</TableCell>
              <TableCell sx={{ width: '12%', fontWeight: 'bold' }}>Game Number</TableCell>
              <TableCell sx={{ width: '12%', fontWeight: 'bold' }}>Ticket Serial</TableCell>
              <TableCell sx={{ width: '12%', fontWeight: 'bold' }}>Box Number</TableCell>
              <TableCell sx={{ width: '12%', fontWeight: 'bold' }}>Opening Number</TableCell>
              <TableCell sx={{ width: '12%', fontWeight: 'bold' }}>Closing Number</TableCell>
              <TableCell sx={{ width: '10%', fontWeight: 'bold' }}>Sales ($)</TableCell>
              <TableCell sx={{ width: '15%', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ width: '10%', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBoxes.map((box, index) => (
              <TableRow key={box._id}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedBoxes.includes(box._id)}
                    onChange={() => handleBoxSelection(box._id)}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body1" fontWeight="bold">
                    {index + 1}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={box.gameNumber}
                    color="info"
                    size="small"
                    sx={{ minWidth: '80px' }}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={box.ticketSerial}
                    color="default"
                    size="small"
                    sx={{ minWidth: '80px' }}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={box.boxNumber}
                    color="primary"
                    size="small"
                    sx={{ 
                      minWidth: '80px',
                      backgroundColor: 'primary.main',
                      color: 'white',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={box.openingNumber}
                    color="secondary"
                    size="small"
                    sx={{ 
                      minWidth: '80px',
                      backgroundColor: 'secondary.main',
                      color: 'white',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Stack spacing={1}>
                    <Chip 
                      label={box.closingNumber}
                      color="success"
                      size="small"
                      sx={{ 
                        minWidth: '80px',
                        backgroundColor: 'success.main',
                        color: 'white',
                      }}
                    />
                    {suggestedTickets[box._id] && (
                      <Chip 
                        label={`Next: ${suggestedTickets[box._id].ticketNumber}`}
                        color="warning"
                        size="small"
                        variant="outlined"
                        sx={{ 
                          minWidth: '80px',
                          borderColor: 'warning.main',
                          color: 'warning.dark',
                        }}
                      />
                    )}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography 
                      variant="body1" 
                      fontWeight="bold"
                      sx={{ 
                        color: 'success.dark',
                        fontSize: '1.1rem',
                      }}
                    >
                      ${calculateTicketSales(box)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Daily: ${box.dailySales || 0}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack spacing={1}>
                    <Chip 
                      label={box.isActive ? 'Active' : 'Inactive'}
                      color={box.isActive ? 'success' : 'error'}
                      size="small"
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BatteryIcon 
                        color={getBatteryLevelColor(box.metrics?.batteryLevel || 0)}
                        fontSize="small"
                      />
                      <LinearProgress 
                        variant="determinate" 
                        value={box.metrics?.batteryLevel || 0}
                        sx={{ width: '50px' }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Last scan: {new Date(box.lastUpdated).toLocaleTimeString()}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Quick Scan">
                      <IconButton 
                        onClick={() => handleQuickScan(box._id)}
                        color="primary"
                        size="small"
                      >
                        <Badge badgeContent={box.newScans} color="error">
                          <ScannerIcon fontSize="small" />
                        </Badge>
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Manual Entry">
                      <IconButton 
                        onClick={() => setManualEntry({ 
                          ...manualEntry, 
                          boxNumber: box.boxNumber,
                          gameNumber: box.gameNumber,
                          ticketNumber: suggestedTickets[box._id]?.ticketNumber || ''
                        })}
                        color="secondary"
                        size="small"
                        sx={{ 
                          backgroundColor: 'secondary.light',
                          '&:hover': {
                            backgroundColor: 'secondary.main',
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View History">
                      <IconButton 
                        onClick={() => handleViewHistory(box)}
                        color="info"
                        size="small"
                      >
                        <HistoryIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reset Day">
                      <IconButton 
                        onClick={() => handleResetDay(box._id)}
                        color="warning"
                        size="small"
                      >
                        <RefreshIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          label="Box Number"
          value={manualEntry.boxNumber}
          onChange={(e) => setManualEntry({ ...manualEntry, boxNumber: e.target.value })}
          size="small"
          sx={{ width: '150px' }}
        />
        <TextField
          label="Game Number"
          value={manualEntry.gameNumber}
          onChange={(e) => setManualEntry({ ...manualEntry, gameNumber: e.target.value })}
          size="small"
          sx={{ width: '150px' }}
        />
        <TextField
          label="Ticket Number"
          value={manualEntry.ticketNumber}
          onChange={(e) => setManualEntry({ ...manualEntry, ticketNumber: e.target.value })}
          size="small"
          sx={{ width: '150px' }}
        />
        <Button
          variant="contained"
          onClick={() => handleManualEntry(manualEntry.boxNumber)}
          disabled={!manualEntry.boxNumber || !manualEntry.gameNumber || !manualEntry.ticketNumber}
          size="small"
          sx={{ 
            minWidth: '120px',
            backgroundColor: 'success.main',
            '&:hover': {
              backgroundColor: 'success.dark',
            },
          }}
        >
          Add Entry
        </Button>
      </Box>

      {/* Enhanced Total Sales Box */}
      <Box sx={{ 
        mt: 3, 
        p: 3, 
        background: 'linear-gradient(145deg, #1976d2, #1565c0)',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white',
      }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
            Total Lotto Sales
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Most Popular Game:
            </Typography>
            <Chip 
              label={boxes.length > 0 ? 
                boxes.reduce((a, b) => 
                  (calculateTicketSales(a) > calculateTicketSales(b) ? a : b)
                ).gameNumber 
                : 'N/A'}
              color="warning"
              size="small"
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
              }}
            />
          </Stack>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography 
            variant="h3" 
            fontWeight="bold"
            sx={{ 
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
              fontStyle: 'italic',
            }}
          >
            ${calculateTotalSales()}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Daily: ${boxes.reduce((total, box) => total + (box.dailySales || 0), 0)}
          </Typography>
        </Box>
      </Box>

      {/* History Dialog */}
      <Dialog 
        open={showHistoryDialog} 
        onClose={() => setShowHistoryDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          History for Box {selectedBoxHistory?.boxNumber}
        </DialogTitle>
        <DialogContent>
          <Tabs value={historyTab} onChange={(e, newValue) => setHistoryTab(newValue)}>
            <Tab label="Scan History" />
            <Tab label="Error Logs" />
            <Tab label="Maintenance" />
          </Tabs>
          {historyTab === 0 && (
            <Box sx={{ mt: 2 }}>
              {/* Scan History Content */}
            </Box>
          )}
          {historyTab === 1 && (
            <Box sx={{ mt: 2 }}>
              {/* Error Logs Content */}
            </Box>
          )}
          {historyTab === 2 && (
            <Box sx={{ mt: 2 }}>
              {/* Maintenance History Content */}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHistoryDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={showNotification}
        autoHideDuration={6000}
        onClose={() => setShowNotification(false)}
      >
        <Alert 
          onClose={() => setShowNotification(false)} 
          severity="info"
          sx={{ width: '100%' }}
        >
          {notificationMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ActiveBoxes; 