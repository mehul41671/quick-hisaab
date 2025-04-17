import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import { VpnKey as LicenseIcon, CheckCircle as CheckIcon } from '@mui/icons-material';
import axios from 'axios';

function License() {
  const [licenseKey, setLicenseKey] = useState('');
  const [storeId, setStoreId] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [licenseInfo, setLicenseInfo] = useState(null);

  useEffect(() => {
    // Load store ID from localStorage or settings
    const savedStoreId = localStorage.getItem('storeId');
    if (savedStoreId) {
      setStoreId(savedStoreId);
      checkLicenseStatus(savedStoreId);
    }
  }, []);

  const checkLicenseStatus = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/licenses/status/${id}`);
      setLicenseInfo(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error checking license status');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/licenses/activate', {
        licenseKey,
        storeId,
      });
      setStatus('activated');
      setError(null);
      checkLicenseStatus(storeId);
    } catch (err) {
      setError(err.response?.data?.message || 'Error activating license');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        License Management
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Activate License
              </Typography>
              <TextField
                fullWidth
                label="Store ID"
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="License Key"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                margin="normal"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleActivate}
                disabled={loading || !licenseKey || !storeId}
                startIcon={loading ? <CircularProgress size={20} /> : <LicenseIcon />}
                sx={{ mt: 2 }}
              >
                {loading ? 'Activating...' : 'Activate License'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                License Status
              </Typography>
              {licenseInfo ? (
                <Box>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: licenseInfo.isValid ? 'success.light' : 'error.light',
                      color: 'white',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckIcon sx={{ mr: 1 }} />
                      <Typography variant="subtitle1">
                        Status: {licenseInfo.status.toUpperCase()}
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      Expiration Date: {new Date(licenseInfo.expirationDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2">
                      Remaining Days: {licenseInfo.remainingDays}
                    </Typography>
                  </Paper>
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No license information available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {status === 'activated' && (
        <Alert severity="success" sx={{ mt: 2 }}>
          License activated successfully!
        </Alert>
      )}
    </Box>
  );
}

export default License; 