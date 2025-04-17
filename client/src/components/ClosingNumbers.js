import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  QrCodeScanner as ScannerIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import axios from 'axios';
import scannerService from '../services/scannerService';

const ClosingNumbers = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [manualNumber, setManualNumber] = useState('');
  const [useScanner, setUseScanner] = useState(true);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const storeId = localStorage.getItem('storeId');
      const response = await axios.get(`/api/tickets/active/${storeId}`);
      setTickets(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (serialNumber) => {
    try {
      setLoading(true);
      await axios.patch(`/api/tickets/${selectedTicket._id}`, {
        scannedSerial: serialNumber,
      });
      fetchTickets();
      setScanDialogOpen(false);
      setSuccess('Closing number updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to update closing number');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    try {
      setLoading(true);
      await axios.patch(`/api/tickets/${selectedTicket._id}`, {
        scannedSerial: manualNumber,
      });
      fetchTickets();
      setManualDialogOpen(false);
      setSuccess('Closing number updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to update closing number');
    } finally {
      setLoading(false);
    }
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
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Closing Numbers</Typography>
        <FormControlLabel
          control={
            <Switch
              checked={useScanner}
              onChange={(e) => setUseScanner(e.target.checked)}
            />
          }
          label="Use Scanner"
        />
      </Box>

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

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Game Name</TableCell>
                  <TableCell>Game Number</TableCell>
                  <TableCell>Today's Opening</TableCell>
                  <TableCell>Today's Closing</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket._id}>
                    <TableCell>{ticket.gameName}</TableCell>
                    <TableCell>{ticket.gameNumber}</TableCell>
                    <TableCell>{ticket.todayOpenNumber || 'Not set'}</TableCell>
                    <TableCell>{ticket.lastClosingNumber || 'Not set'}</TableCell>
                    <TableCell>
                      <Tooltip title="Update closing number">
                        <IconButton
                          onClick={() => {
                            setSelectedTicket(ticket);
                            if (useScanner) {
                              setScanDialogOpen(true);
                            } else {
                              setManualDialogOpen(true);
                            }
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Scanner Dialog */}
      <Dialog open={scanDialogOpen} onClose={() => setScanDialogOpen(false)}>
        <DialogTitle>Scan Closing Number</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              Ready to Scan
            </Typography>
            <Typography color="text.secondary">
              Press the scanner trigger to scan the closing number
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScanDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={startScanning}
            disabled={scanning}
            startIcon={scanning ? <CircularProgress size={20} /> : <ScannerIcon />}
          >
            {scanning ? 'Scanning...' : 'Start Scanning'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manual Input Dialog */}
      <Dialog open={manualDialogOpen} onClose={() => setManualDialogOpen(false)}>
        <DialogTitle>Enter Closing Number</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Closing Number"
            value={manualNumber}
            onChange={(e) => setManualNumber(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManualDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleManualSubmit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClosingNumbers; 