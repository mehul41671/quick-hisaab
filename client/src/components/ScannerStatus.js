import React, { useState, useEffect } from 'react';
import scannerService from '../services/scannerService';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Divider,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ScannerStatus = ({ scannerId }) => {
  const [health, setHealth] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [diagnostics, setDiagnostics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [healthData, metricsData, diagnosticsData] = await Promise.all([
          scannerService.checkHealth(scannerId),
          scannerService.getMetrics(scannerId),
          scannerService.getDiagnosticReport(scannerId)
        ]);
        
        setHealth(healthData);
        setMetrics(metricsData);
        setDiagnostics(diagnosticsData);
        setError(null);
      } catch (error) {
        setError('Failed to fetch scanner status');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    
    // Set up WebSocket listeners
    scannerService.addEventListener('scan', handleScanEvent);
    scannerService.addEventListener('health', handleHealthEvent);
    scannerService.addEventListener('error', handleErrorEvent);

    return () => {
      scannerService.removeEventListener('scan', handleScanEvent);
      scannerService.removeEventListener('health', handleHealthEvent);
      scannerService.removeEventListener('error', handleErrorEvent);
    };
  }, [scannerId]);

  const handleScanEvent = (event) => {
    setScanHistory(prev => [event, ...prev].slice(0, 10));
  };

  const handleHealthEvent = (event) => {
    setHealth(event.data);
  };

  const handleErrorEvent = (event) => {
    setError(event.message);
  };

  const handleRunDiagnostics = async () => {
    try {
      setIsRunningDiagnostics(true);
      const result = await scannerService.runDiagnostics(scannerId);
      setDiagnostics(result);
      setError(null);
    } catch (error) {
      setError('Failed to run diagnostics');
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  const renderHealthStatus = () => {
    if (!health) return null;

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Health Status
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2">Connection</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Chip
                  label={health.connected ? 'Connected' : 'Disconnected'}
                  color={health.connected ? 'success' : 'error'}
                  size="small"
                />
                {health.connected && (
                  <LinearProgress
                    variant="determinate"
                    value={100}
                    sx={{ ml: 2, flexGrow: 1 }}
                  />
                )}
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2">Firmware</Typography>
              <Typography variant="body2" color="text.secondary">
                Version: {health.firmwareVersion}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderMetrics = () => {
    if (!metrics) return null;

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Performance Metrics
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={metrics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="scans" stroke="#8884d8" />
            <Line type="monotone" dataKey="errors" stroke="#ff7300" />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  const renderDiagnostics = () => {
    if (!diagnostics) return null;

    return (
      <Box sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Diagnostics
          </Typography>
          <Button
            variant="outlined"
            onClick={handleRunDiagnostics}
            disabled={isRunningDiagnostics}
            startIcon={isRunningDiagnostics ? <CircularProgress size={20} /> : null}
          >
            Run Diagnostics
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Test</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {diagnostics.map((test, index) => (
                <TableRow key={index}>
                  <TableCell>{test.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={test.status}
                      color={test.status === 'success' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{test.message}</TableCell>
                  <TableCell>{new Date(test.timestamp).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderScanHistory = () => {
    if (scanHistory.length === 0) return null;

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Scans
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Barcode</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scanHistory.map((scan, index) => (
                <TableRow key={index}>
                  <TableCell>{scan.data}</TableCell>
                  <TableCell>{scan.type}</TableCell>
                  <TableCell>{new Date(scan.timestamp).toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={scan.status}
                      color={scan.status === 'success' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Scanner Status
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {renderHealthStatus()}
      <Divider sx={{ my: 3 }} />
      {renderMetrics()}
      <Divider sx={{ my: 3 }} />
      {renderDiagnostics()}
      <Divider sx={{ my: 3 }} />
      {renderScanHistory()}
    </Paper>
  );
};

export default ScannerStatus; 