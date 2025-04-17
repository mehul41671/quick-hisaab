import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { format } from 'date-fns';

const CommissionManagement = ({ scannerId }) => {
  const [commissions, setCommissions] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newCommission, setNewCommission] = useState({
    amount: '',
    commissionRate: '',
    notes: ''
  });

  useEffect(() => {
    fetchCommissions();
    fetchSummary();
  }, [scannerId]);

  const fetchCommissions = async () => {
    try {
      const response = await fetch(`/api/scanners/${scannerId}/commissions`);
      if (!response.ok) throw new Error('Failed to fetch commissions');
      const data = await response.json();
      setCommissions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch(`/api/scanners/${scannerId}/commissions/summary`);
      if (!response.ok) throw new Error('Failed to fetch summary');
      const data = await response.json();
      setSummary(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddCommission = async () => {
    try {
      const response = await fetch(`/api/scanners/${scannerId}/commissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCommission)
      });
      if (!response.ok) throw new Error('Failed to add commission');
      await fetchCommissions();
      await fetchSummary();
      setOpenDialog(false);
      setNewCommission({ amount: '', commissionRate: '', notes: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateStatus = async (commissionId, newStatus) => {
    try {
      const response = await fetch(`/api/scanners/${scannerId}/commissions/${commissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Failed to update status');
      await fetchCommissions();
      await fetchSummary();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Commission Management
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {Object.entries(summary).map(([status, data]) => (
          <Grid item xs={12} sm={4} key={status}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" color="textSecondary">
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Typography>
              <Typography variant="h4">${data.totalAmount.toFixed(2)}</Typography>
              <Typography color="textSecondary">
                {data.count} {data.count === 1 ? 'commission' : 'commissions'}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenDialog(true)}
        >
          Add Commission
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Rate</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {commissions.map((commission) => (
              <TableRow key={commission._id}>
                <TableCell>
                  {format(new Date(commission.createdAt), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>${commission.amount.toFixed(2)}</TableCell>
                <TableCell>{commission.commissionRate}%</TableCell>
                <TableCell>
                  <Chip
                    label={commission.status}
                    color={commission.status === 'paid' ? 'success' : 'warning'}
                  />
                </TableCell>
                <TableCell>{commission.notes}</TableCell>
                <TableCell>
                  {commission.status === 'pending' && (
                    <Button
                      size="small"
                      onClick={() => handleUpdateStatus(commission._id, 'paid')}
                    >
                      Mark as Paid
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Commission</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Amount"
            type="number"
            value={newCommission.amount}
            onChange={(e) =>
              setNewCommission({ ...newCommission, amount: e.target.value })
            }
          />
          <TextField
            fullWidth
            margin="normal"
            label="Commission Rate (%)"
            type="number"
            value={newCommission.commissionRate}
            onChange={(e) =>
              setNewCommission({ ...newCommission, commissionRate: e.target.value })
            }
          />
          <TextField
            fullWidth
            margin="normal"
            label="Notes"
            multiline
            rows={3}
            value={newCommission.notes}
            onChange={(e) =>
              setNewCommission({ ...newCommission, notes: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddCommission} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommissionManagement; 