import React, { useState, useEffect } from 'react';
import scannerService from '../services/scannerService';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const ScannerHealth = () => {
  const [healthData, setHealthData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchHealthData = async () => {
    try {
      setIsLoading(true);
      const data = await scannerService.getSystemHealth();
      setHealthData(data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch health data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'success.main';
      case 'warning':
        return 'warning.main';
      case 'error':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };

  if (isLoading && !healthData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          System Health
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchHealthData}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {healthData && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  System Overview
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Overall Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {getStatusIcon(healthData.overallStatus)}
                    <Typography
                      variant="body1"
                      sx={{ ml: 1, color: getStatusColor(healthData.overallStatus) }}
                    >
                      {healthData.overallStatus.toUpperCase()}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Active Scanners
                  </Typography>
                  <Typography variant="body1">
                    {healthData.activeScanners} / {healthData.totalScanners}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(healthData.activeScanners / healthData.totalScanners) * 100}
                    sx={{ mt: 1 }}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    System Uptime
                  </Typography>
                  <Typography variant="body1">
                    {healthData.uptime}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Resource Usage
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    CPU Usage
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LinearProgress
                      variant="determinate"
                      value={healthData.cpuUsage}
                      sx={{ flexGrow: 1, mr: 1 }}
                    />
                    <Typography variant="body2">
                      {healthData.cpuUsage}%
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Memory Usage
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LinearProgress
                      variant="determinate"
                      value={healthData.memoryUsage}
                      sx={{ flexGrow: 1, mr: 1 }}
                    />
                    <Typography variant="body2">
                      {healthData.memoryUsage}%
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Disk Usage
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LinearProgress
                      variant="determinate"
                      value={healthData.diskUsage}
                      sx={{ flexGrow: 1, mr: 1 }}
                    />
                    <Typography variant="body2">
                      {healthData.diskUsage}%
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Scanner Status
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Scanner</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Last Activity</TableCell>
                        <TableCell>Errors</TableCell>
                        <TableCell>Performance</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {healthData.scanners.map((scanner) => (
                        <TableRow key={scanner.id}>
                          <TableCell>{scanner.name}</TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(scanner.status)}
                              label={scanner.status.toUpperCase()}
                              size="small"
                              sx={{ backgroundColor: getStatusColor(scanner.status) }}
                            />
                          </TableCell>
                          <TableCell>{scanner.lastActivity}</TableCell>
                          <TableCell>{scanner.errorCount}</TableCell>
                          <TableCell>
                            <LinearProgress
                              variant="determinate"
                              value={scanner.performance}
                              sx={{ width: 100 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Paper>
  );
};

export default ScannerHealth; 