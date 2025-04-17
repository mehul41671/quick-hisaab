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
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import axios from 'axios';

const PricingManagement = () => {
  const [prices, setPrices] = useState({
    pro: {
      monthly: 7.99,
      annual: 76.70,
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/pricing');
      setPrices(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch pricing data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (plan, cycle) => {
    setEditingPrice({
      plan,
      cycle,
      value: prices[plan][cycle],
    });
    setEditDialogOpen(true);
  };

  const handleSavePrice = async () => {
    try {
      setLoading(true);
      await axios.put('/api/pricing', {
        plan: editingPrice.plan,
        cycle: editingPrice.cycle,
        value: editingPrice.value,
      });
      setPrices(prev => ({
        ...prev,
        [editingPrice.plan]: {
          ...prev[editingPrice.plan],
          [editingPrice.cycle]: editingPrice.value,
        },
      }));
      setEditDialogOpen(false);
      setSuccess('Price updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to update price');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Pricing Management
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

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Plan</TableCell>
                  <TableCell>Monthly Price</TableCell>
                  <TableCell>Annual Price (20% Discount)</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Free</TableCell>
                  <TableCell>$0.00</TableCell>
                  <TableCell>$0.00</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Pro</TableCell>
                  <TableCell>
                    ${prices.pro.monthly}
                    <Tooltip title="Edit price">
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick('pro', 'monthly')}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    ${prices.pro.annual}
                    <Tooltip title="Edit price">
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick('pro', 'annual')}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setEditingPrice({
                          plan: 'pro',
                          cycle: 'monthly',
                          value: prices.pro.monthly,
                        });
                        setEditDialogOpen(true);
                      }}
                    >
                      Edit Both
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>
          Edit {editingPrice?.plan?.toUpperCase()} Plan Price
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={`${editingPrice?.cycle?.toUpperCase()} Price`}
            type="number"
            value={editingPrice?.value || ''}
            onChange={(e) =>
              setEditingPrice({
                ...editingPrice,
                value: parseFloat(e.target.value),
              })
            }
            margin="normal"
            InputProps={{
              startAdornment: '$',
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setEditDialogOpen(false)}
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSavePrice}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PricingManagement; 