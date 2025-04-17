import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Update as UpdateIcon,
  Build as BuildIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import scannerService from '../services/scannerService';

function ScannerSettings() {
  const [scanners, setScanners] = useState([]);
  const [selectedScanner, setSelectedScanner] = useState(null);
  const [scannerConfig, setScannerConfig] = useState({});
  const [profiles, setProfiles] = useState([]);
  const [events, setEvents] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [diagnostics, setDiagnostics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');

  useEffect(() => {
    fetchScanners();
    fetchProfiles();
    scannerService.initializeWebSocket();
    scannerService.addEventListener('scan', handleScannerEvent);
    scannerService.addEventListener('error', handleScannerEvent);
    scannerService.addEventListener('diagnostic', handleScannerEvent);

    return () => {
      scannerService.removeEventListener('scan', handleScannerEvent);
      scannerService.removeEventListener('error', handleScannerEvent);
      scannerService.removeEventListener('diagnostic', handleScannerEvent);
    };
  }, []);

  useEffect(() => {
    if (selectedScanner) {
      fetchScannerDetails();
    }
  }, [selectedScanner]);

  const fetchScanners = async () => {
    try {
      setLoading(true);
      const data = await scannerService.getScanners();
      setScanners(data);
      if (data.length > 0 && !selectedScanner) {
        setSelectedScanner(data[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async () => {
    try {
      const data = await scannerService.getProfiles();
      setProfiles(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchScannerDetails = async () => {
    try {
      setLoading(true);
      const [health, metricsData, eventsData] = await Promise.all([
        scannerService.checkHealth(selectedScanner._id),
        scannerService.getMetrics(selectedScanner._id),
        scannerService.getDiagnosticReport(selectedScanner._id),
      ]);
      setMetrics(metricsData);
      setEvents(eventsData);
      setScannerConfig(selectedScanner.config);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScannerEvent = (event) => {
    setEvents(prev => [event, ...prev]);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDialogOpen = (type) => {
    setDialogType(type);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setDialogType('');
  };

  const handleUpdateFirmware = async () => {
    try {
      setLoading(true);
      await scannerService.updateFirmware(selectedScanner._id);
      fetchScannerDetails();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      handleDialogClose();
    }
  };

  const handleCalibrate = async () => {
    try {
      setLoading(true);
      await scannerService.calibrate(selectedScanner._id);
      fetchScannerDetails();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      handleDialogClose();
    }
  };

  const handleRunDiagnostics = async () => {
    try {
      setLoading(true);
      const result = await scannerService.runDiagnostics(selectedScanner._id);
      setDiagnostics(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Scanner Settings</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchScanners}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<BuildIcon />}
            onClick={() => handleDialogOpen('calibrate')}
            sx={{ mr: 2 }}
          >
            Calibrate
          </Button>
          <Button
            variant="contained"
            startIcon={<UpdateIcon />}
            onClick={() => handleDialogOpen('firmware')}
          >
            Update Firmware
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Scanner List
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Select Scanner</InputLabel>
                <Select
                  value={selectedScanner?._id || ''}
                  onChange={(e) => {
                    const scanner = scanners.find(s => s._id === e.target.value);
                    setSelectedScanner(scanner);
                  }}
                  label="Select Scanner"
                >
                  {scanners.map((scanner) => (
                    <MenuItem key={scanner._id} value={scanner._id}>
                      {scanner.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Configuration" />
                <Tab label="Metrics" />
                <Tab label="Events" />
                <Tab label="Diagnostics" />
              </Tabs>

              {tabValue === 0 && selectedScanner && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Scanner Configuration
                  </Typography>
                  <Grid container spacing={2}>
                    {Object.entries(scannerConfig).map(([key, value]) => (
                      <Grid item xs={12} sm={6} key={key}>
                        <TextField
                          fullWidth
                          label={key}
                          value={value}
                          onChange={(e) =>
                            setScannerConfig({
                              ...scannerConfig,
                              [key]: e.target.value,
                            })
                          }
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {tabValue === 1 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Scanner Metrics
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Metric</TableCell>
                          <TableCell>Value</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(metrics).map(([key, value]) => (
                          <TableRow key={key}>
                            <TableCell>{key}</TableCell>
                            <TableCell>{value}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {tabValue === 2 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Recent Events
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Type</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Message</TableCell>
                          <TableCell>Timestamp</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {events.map((event) => (
                          <TableRow key={event._id}>
                            <TableCell>
                              <Chip
                                label={event.type}
                                color={
                                  event.type === 'error'
                                    ? 'error'
                                    : event.type === 'scan'
                                    ? 'success'
                                    : 'default'
                                }
                              />
                            </TableCell>
                            <TableCell>{event.status}</TableCell>
                            <TableCell>{event.message}</TableCell>
                            <TableCell>
                              {new Date(event.timestamp).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {tabValue === 3 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Diagnostics
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<BuildIcon />}
                    onClick={handleRunDiagnostics}
                    sx={{ mb: 2 }}
                  >
                    Run Diagnostics
                  </Button>
                  {diagnostics && (
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Check</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Details</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Object.entries(diagnostics).map(([key, value]) => (
                            <TableRow key={key}>
                              <TableCell>{key}</TableCell>
                              <TableCell>
                                <Chip
                                  label={
                                    value.connected
                                      ? 'Connected'
                                      : value.success
                                      ? 'Success'
                                      : 'Failed'
                                  }
                                  color={
                                    value.connected || value.success
                                      ? 'success'
                                      : 'error'
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                {JSON.stringify(value, null, 2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialogs */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>
          {dialogType === 'firmware'
            ? 'Update Firmware'
            : 'Calibrate Scanner'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {dialogType === 'firmware'
              ? 'Are you sure you want to update the firmware? This process may take several minutes.'
              : 'Are you sure you want to calibrate the scanner? This process may take a few minutes.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={
              dialogType === 'firmware'
                ? handleUpdateFirmware
                : handleCalibrate
            }
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {dialogType === 'firmware' ? 'Update' : 'Calibrate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ScannerSettings; 