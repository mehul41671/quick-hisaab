import React, { useState, useEffect } from 'react';
import scannerService from '../services/scannerService';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import CalibrationIcon from '@mui/icons-material/Calibration';

const ScannerCalibration = ({ scannerId }) => {
  const [calibration, setCalibration] = useState(null);
  const [history, setHistory] = useState([]);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openCalibrationDialog, setOpenCalibrationDialog] = useState(false);
  const [calibrationSettings, setCalibrationSettings] = useState({
    type: 'auto',
    parameters: {}
  });

  useEffect(() => {
    const fetchCalibrationData = async () => {
      try {
        const [currentCalibration, calibrationHistory] = await Promise.all([
          scannerService.getCalibration(scannerId),
          scannerService.getCalibrationHistory(scannerId)
        ]);
        setCalibration(currentCalibration);
        setHistory(calibrationHistory);
      } catch (error) {
        setError('Failed to fetch calibration data');
      }
    };

    fetchCalibrationData();
  }, [scannerId]);

  const handleCalibrate = async () => {
    try {
      setIsCalibrating(true);
      setError(null);
      setSuccess(null);

      const result = await scannerService.calibrate(scannerId, calibrationSettings);
      setCalibration(result);
      setHistory([result, ...history]);
      setSuccess('Calibration completed successfully');
      setOpenCalibrationDialog(false);
    } catch (error) {
      setError('Calibration failed');
    } finally {
      setIsCalibrating(false);
    }
  };

  const handleSettingsChange = (field) => (event) => {
    setCalibrationSettings({
      ...calibrationSettings,
      [field]: event.target.value
    });
  };

  const renderCalibrationStatus = () => {
    if (!calibration) return null;

    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current Calibration
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2">Status</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Chip
                  label={calibration.status}
                  color={calibration.status === 'success' ? 'success' : 'error'}
                  size="small"
                />
                <LinearProgress
                  variant="determinate"
                  value={calibration.progress || 100}
                  sx={{ ml: 2, flexGrow: 1 }}
                />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2">Last Calibrated</Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(calibration.timestamp).toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderCalibrationHistory = () => {
    if (history.length === 0) return null;

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Calibration History
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Results</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((record, index) => (
                <TableRow key={index}>
                  <TableCell>{new Date(record.timestamp).toLocaleString()}</TableCell>
                  <TableCell>{record.type}</TableCell>
                  <TableCell>
                    <Chip
                      label={record.status}
                      color={record.status === 'success' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <pre style={{ margin: 0 }}>
                      {JSON.stringify(record.results, null, 2)}
                    </pre>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Scanner Calibration
        </Typography>
        <Button
          variant="contained"
          startIcon={<CalibrationIcon />}
          onClick={() => setOpenCalibrationDialog(true)}
          disabled={isCalibrating}
        >
          Calibrate Scanner
        </Button>
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

      {isCalibrating && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CircularProgress size={20} sx={{ mr: 2 }} />
          <Typography>Calibrating scanner...</Typography>
        </Box>
      )}

      {renderCalibrationStatus()}
      {renderCalibrationHistory()}

      <Dialog open={openCalibrationDialog} onClose={() => setOpenCalibrationDialog(false)}>
        <DialogTitle>Calibrate Scanner</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Calibration Type</InputLabel>
            <Select
              value={calibrationSettings.type}
              onChange={handleSettingsChange('type')}
              label="Calibration Type"
            >
              <MenuItem value="auto">Automatic</MenuItem>
              <MenuItem value="manual">Manual</MenuItem>
              <MenuItem value="advanced">Advanced</MenuItem>
            </Select>
          </FormControl>

          {calibrationSettings.type === 'manual' && (
            <TextField
              margin="normal"
              label="Calibration Pattern"
              fullWidth
              value={calibrationSettings.parameters.pattern || ''}
              onChange={handleSettingsChange('parameters.pattern')}
            />
          )}

          {calibrationSettings.type === 'advanced' && (
            <>
              <TextField
                margin="normal"
                label="Exposure"
                type="number"
                fullWidth
                value={calibrationSettings.parameters.exposure || ''}
                onChange={handleSettingsChange('parameters.exposure')}
              />
              <TextField
                margin="normal"
                label="Contrast"
                type="number"
                fullWidth
                value={calibrationSettings.parameters.contrast || ''}
                onChange={handleSettingsChange('parameters.contrast')}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCalibrationDialog(false)}>Cancel</Button>
          <Button onClick={handleCalibrate} variant="contained" disabled={isCalibrating}>
            Start Calibration
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ScannerCalibration; 