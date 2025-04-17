import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  IconButton,
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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  CameraAlt as CameraIcon,
  QrCodeScanner as ScannerIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import Webcam from 'react-webcam';
import axios from 'axios';
import scannerService from '../services/scannerService';

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [scannerConfigDialogOpen, setScannerConfigDialogOpen] = useState(false);
  const [selectedScanner, setSelectedScanner] = useState(scannerService.scannerType);
  const [scannerConfig, setScannerConfig] = useState(scannerService.scannerConfig);
  const [availableScanners, setAvailableScanners] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [newTicket, setNewTicket] = useState({
    gameNumber: '',
    gameName: '',
    startSerial: '',
    endSerial: '',
    ticketPrice: '',
    totalTickets: '',
  });

  const webcamRef = React.useRef(null);

  useEffect(() => {
    fetchTickets();
    setAvailableScanners(scannerService.getAvailableScanners());
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const storeId = localStorage.getItem('storeId');
      const response = await axios.get(`/api/tickets/active/${storeId}`);
      setTickets(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (serialNumber) => {
    try {
      setLoading(true);
      const response = await axios.patch(`/api/tickets/${serialNumber}`, {
        scannedSerial: serialNumber,
      });
      fetchTickets();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error scanning ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTicket = async () => {
    try {
      setLoading(true);
      const storeId = localStorage.getItem('storeId');
      await axios.post('/api/tickets', {
        ...newTicket,
        storeId,
      });
      setAddDialogOpen(false);
      fetchTickets();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleScannerChange = async (scannerId) => {
    setSelectedScanner(scannerId);
    const scanner = availableScanners.find(s => s.id === scannerId);
    if (scanner && scanner.requiresConfig) {
      setScannerConfigDialogOpen(true);
    } else {
      await scannerService.setScanner(scannerId);
    }
  };

  const handleScannerConfigSave = async () => {
    await scannerService.setScanner(selectedScanner, scannerConfig);
    setScannerConfigDialogOpen(false);
  };

  const startScanning = async () => {
    try {
      setScanning(true);
      const result = await scannerService.scan();
      await handleScan(result.serialNumber);
    } catch (err) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Tickets</Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
            sx={{ mr: 2 }}
          >
            Add Ticket
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ScannerIcon />}
            onClick={() => setScanDialogOpen(true)}
            sx={{ mr: 2 }}
          >
            Scan Ticket
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<SettingsIcon />}
            onClick={() => setScannerConfigDialogOpen(true)}
          >
            Scanner Settings
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {tickets.map((ticket) => (
          <Grid item xs={12} sm={6} md={4} key={ticket._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {ticket.gameName}
                </Typography>
                <Typography color="text.secondary">
                  Game #{ticket.gameNumber}
                </Typography>
                <Typography variant="body2">
                  Price: ${ticket.ticketPrice}
                </Typography>
                <Typography variant="body2">
                  Remaining: {ticket.remainingTickets}/{ticket.totalTickets}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Today's Numbers:</Typography>
                  <Typography variant="body2">
                    Opening: {ticket.todayOpenNumber || 'Not set'}
                  </Typography>
                  <Typography variant="body2">
                    Closing: {ticket.lastClosingNumber || 'Not set'}
                  </Typography>
                </Box>
                {ticket.lastResetDate && (
                  <Typography variant="caption" color="text.secondary">
                    Last reset: {new Date(ticket.lastResetDate).toLocaleString()}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Ticket Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Add New Ticket</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Game Number"
            value={newTicket.gameNumber}
            onChange={(e) => setNewTicket({ ...newTicket, gameNumber: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Game Name"
            value={newTicket.gameName}
            onChange={(e) => setNewTicket({ ...newTicket, gameName: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Start Serial"
            value={newTicket.startSerial}
            onChange={(e) => setNewTicket({ ...newTicket, startSerial: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="End Serial"
            value={newTicket.endSerial}
            onChange={(e) => setNewTicket({ ...newTicket, endSerial: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Ticket Price"
            type="number"
            value={newTicket.ticketPrice}
            onChange={(e) => setNewTicket({ ...newTicket, ticketPrice: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Total Tickets"
            type="number"
            value={newTicket.totalTickets}
            onChange={(e) => setNewTicket({ ...newTicket, totalTickets: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddTicket}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Scanner Configuration Dialog */}
      <Dialog open={scannerConfigDialogOpen} onClose={() => setScannerConfigDialogOpen(false)}>
        <DialogTitle>Scanner Configuration</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Scanner Type</InputLabel>
            <Select
              value={selectedScanner}
              onChange={(e) => handleScannerChange(e.target.value)}
              label="Scanner Type"
            >
              {availableScanners.map((scanner) => (
                <MenuItem key={scanner.id} value={scanner.id}>
                  {scanner.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {availableScanners.find(s => s.id === selectedScanner)?.requiresConfig && (
            <Box sx={{ mt: 2 }}>
              {availableScanners
                .find(s => s.id === selectedScanner)
                ?.configFields.map((field) => (
                  <TextField
                    key={field.name}
                    fullWidth
                    label={field.label}
                    type={field.type}
                    value={scannerConfig[field.name] || field.default || ''}
                    onChange={(e) =>
                      setScannerConfig({
                        ...scannerConfig,
                        [field.name]: e.target.value,
                      })
                    }
                    margin="normal"
                    required={field.required}
                  />
                ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScannerConfigDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleScannerConfigSave}
            variant="contained"
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Scan Dialog */}
      <Dialog open={scanDialogOpen} onClose={() => setScanDialogOpen(false)}>
        <DialogTitle>Scan Ticket</DialogTitle>
        <DialogContent>
          {selectedScanner === 'webcam' ? (
            <Box sx={{ position: 'relative', width: '100%', height: 300 }}>
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode: 'environment',
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                Ready to Scan
              </Typography>
              <Typography color="text.secondary">
                Press the scanner trigger to scan a ticket
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScanDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={startScanning}
            disabled={scanning}
            startIcon={scanning ? <CircularProgress size={20} /> : null}
          >
            {scanning ? 'Scanning...' : 'Start Scanning'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Tickets; 