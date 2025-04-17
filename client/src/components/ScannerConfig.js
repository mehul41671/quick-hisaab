import React, { useState, useEffect } from 'react';
import scannerService from '../services/scannerService';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Paper,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';

const ScannerConfig = () => {
  const [selectedType, setSelectedType] = useState(scannerService.scannerType);
  const [config, setConfig] = useState(scannerService.config);
  const [availableScanners, setAvailableScanners] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    // Get available scanner types
    setAvailableScanners(scannerService.getAvailableScanners());
    
    // Listen for scanner events
    scannerService.addEventListener('connection', handleScannerEvent);
    scannerService.addEventListener('scan', handleScannerEvent);
    scannerService.addEventListener('error', handleScannerEvent);

    return () => {
      scannerService.removeEventListener('connection', handleScannerEvent);
      scannerService.removeEventListener('scan', handleScannerEvent);
      scannerService.removeEventListener('error', handleScannerEvent);
    };
  }, []);

  const handleScannerEvent = (event) => {
    const { type, status, message } = event;
    if (status === 'error') {
      setError(message);
      setSuccess(null);
    } else {
      setSuccess(message);
      setError(null);
    }
  };

  const handleTypeChange = (event) => {
    const newType = event.target.value;
    setSelectedType(newType);
    setConfig({});
  };

  const handleConfigChange = (field) => (event) => {
    setConfig({
      ...config,
      [field]: event.target.value
    });
  };

  const handleSave = async () => {
    try {
      scannerService.setScanner(selectedType, config);
      setSuccess('Scanner configuration saved successfully');
      setError(null);
    } catch (error) {
      setError('Failed to save scanner configuration');
      setSuccess(null);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await scannerService.testConnection();
      setConnectionStatus(result);
      setSuccess('Connection test successful');
    } catch (error) {
      setError('Connection test failed');
    } finally {
      setIsTesting(false);
    }
  };

  const renderConfigFields = () => {
    const scanner = availableScanners.find(s => s.type === selectedType);
    if (!scanner || !scanner.configFields.length) return null;

    return scanner.configFields.map((field) => (
      <Grid item xs={12} sm={6} key={field}>
        <TextField
          fullWidth
          label={field}
          value={config[field] || ''}
          onChange={handleConfigChange(field)}
          variant="outlined"
          margin="normal"
        />
      </Grid>
    ));
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Scanner Configuration
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <FormControl fullWidth margin="normal">
        <InputLabel>Scanner Type</InputLabel>
        <Select
          value={selectedType}
          onChange={handleTypeChange}
          label="Scanner Type"
        >
          {availableScanners.map((scanner) => (
            <MenuItem key={scanner.type} value={scanner.type}>
              {scanner.description}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Configuration
      </Typography>

      <Grid container spacing={2}>
        {renderConfigFields()}
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={isTesting}
        >
          Save Configuration
        </Button>
        
        <Button
          variant="outlined"
          color="primary"
          onClick={handleTestConnection}
          disabled={isTesting}
          startIcon={isTesting ? <CircularProgress size={20} /> : null}
        >
          Test Connection
        </Button>
      </Box>

      {connectionStatus && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1">Connection Status:</Typography>
          <pre>{JSON.stringify(connectionStatus, null, 2)}</pre>
        </Box>
      )}
    </Paper>
  );
};

export default ScannerConfig; 