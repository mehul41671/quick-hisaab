import React, { useState, useEffect } from 'react';
import ScannerConfig from './ScannerConfig';
import ScannerStatus from './ScannerStatus';
import ScannerCalibration from './ScannerCalibration';
import ScannerProfiles from './ScannerProfiles';
import ScannerTemplates from './ScannerTemplates';
import ScannerHealth from './ScannerHealth';
import ScannerEventLog from './ScannerEventLog';
import scannerService from '../services/scannerService';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Divider,
  Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import EventNoteIcon from '@mui/icons-material/EventNote';
import TemplateIcon from '@mui/icons-material/Template';
import PersonIcon from '@mui/icons-material/Person';

const ScannerManagement = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [scanners, setScanners] = useState([]);
  const [selectedScanner, setSelectedScanner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newScanner, setNewScanner] = useState({
    name: '',
    type: 'webcam',
    config: {},
    template: null
  });
  const [systemStatus, setSystemStatus] = useState({
    totalScanners: 0,
    activeScanners: 0,
    healthStatus: 'good',
    recentEvents: []
  });

  useEffect(() => {
    fetchScanners();
    fetchSystemStatus();
  }, []);

  const fetchScanners = async () => {
    try {
      setIsLoading(true);
      const data = await scannerService.getScanners();
      setScanners(data);
      if (data.length > 0 && !selectedScanner) {
        setSelectedScanner(data[0]._id);
      }
      setError(null);
    } catch (error) {
      setError('Failed to fetch scanners');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSystemStatus = async () => {
    try {
      const status = await scannerService.getSystemStatus();
      setSystemStatus(status);
    } catch (error) {
      console.error('Failed to fetch system status:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleScannerChange = (event) => {
    setSelectedScanner(event.target.value);
  };

  const handleAddScanner = async () => {
    try {
      const scanner = await scannerService.createScanner(newScanner);
      setScanners([...scanners, scanner]);
      setSelectedScanner(scanner._id);
      setOpenAddDialog(false);
      setNewScanner({ name: '', type: 'webcam', config: {}, template: null });
      await fetchSystemStatus();
    } catch (error) {
      setError('Failed to add scanner');
    }
  };

  const handleDeleteScanner = async (scannerId) => {
    try {
      await scannerService.deleteScanner(scannerId);
      setScanners(scanners.filter(s => s._id !== scannerId));
      if (selectedScanner === scannerId) {
        setSelectedScanner(scanners.length > 1 ? scanners[0]._id : null);
      }
      await fetchSystemStatus();
    } catch (error) {
      setError('Failed to delete scanner');
    }
  };

  const handleNewScannerChange = (field) => (event) => {
    setNewScanner({
      ...newScanner,
      [field]: event.target.value
    });
  };

  const handleTemplateSelect = (template) => {
    setNewScanner({
      ...newScanner,
      type: template.type,
      config: template.config
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">
          Scanner Management
        </Typography>
        <Box>
          <Tooltip title="Refresh Scanners">
            <IconButton onClick={fetchScanners} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddDialog(true)}
          >
            Add Scanner
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Select Scanner</InputLabel>
            <Select
              value={selectedScanner || ''}
              onChange={handleScannerChange}
              label="Select Scanner"
            >
              {scanners.map((scanner) => (
                <MenuItem key={scanner._id} value={scanner._id}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span>{scanner.name}</span>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteScanner(scanner._id);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <HealthAndSafetyIcon color={systemStatus.healthStatus === 'good' ? 'success' : 'error'} />
              <Box>
                <Typography variant="subtitle2">System Health</Typography>
                <Typography variant="body2">
                  {systemStatus.totalScanners} Scanners ({systemStatus.activeScanners} Active)
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<SettingsIcon />} label="Configuration" />
          <Tab icon={<HealthAndSafetyIcon />} label="Status & Monitoring" />
          <Tab icon={<EventNoteIcon />} label="Calibration" />
          <Tab icon={<PersonIcon />} label="Profiles" />
          <Tab icon={<TemplateIcon />} label="Templates" />
          <Tab icon={<EventNoteIcon />} label="Event Log" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {selectedTab === 0 ? (
            <ScannerConfig scannerId={selectedScanner} />
          ) : selectedTab === 1 ? (
            selectedScanner && <ScannerStatus scannerId={selectedScanner} />
          ) : selectedTab === 2 ? (
            selectedScanner && <ScannerCalibration scannerId={selectedScanner} />
          ) : selectedTab === 3 ? (
            <ScannerProfiles scannerId={selectedScanner} />
          ) : selectedTab === 4 ? (
            <ScannerTemplates onSelect={handleTemplateSelect} />
          ) : (
            <ScannerEventLog scannerId={selectedScanner} />
          )}
        </Box>
      </Paper>

      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Scanner</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                autoFocus
                margin="dense"
                label="Scanner Name"
                fullWidth
                value={newScanner.name}
                onChange={handleNewScannerChange('name')}
              />
              <FormControl fullWidth margin="dense">
                <InputLabel>Scanner Type</InputLabel>
                <Select
                  value={newScanner.type}
                  onChange={handleNewScannerChange('type')}
                  label="Scanner Type"
                >
                  {scannerService.getAvailableScanners().map((scanner) => (
                    <MenuItem key={scanner.type} value={scanner.type}>
                      {scanner.description}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <ScannerTemplates onSelect={handleTemplateSelect} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddScanner} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScannerManagement; 