import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import scannerService from '../services/scannerService';

const CommissionCalculator = ({ scannerId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commissionRules, setCommissionRules] = useState([]);
  const [calculation, setCalculation] = useState({
    amount: '',
    volume: '',
    selectedRule: '',
    customRate: ''
  });
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchCommissionRules();
  }, [scannerId]);

  const fetchCommissionRules = async () => {
    try {
      const rules = await scannerService.getCommissionRules(scannerId);
      setCommissionRules(rules);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async () => {
    try {
      setLoading(true);
      const response = await scannerService.calculateCommission({
        scannerId,
        amount: parseFloat(calculation.amount),
        volume: parseInt(calculation.volume),
        ruleId: calculation.selectedRule,
        customRate: calculation.customRate ? parseFloat(calculation.customRate) : null
      });
      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRule = async () => {
    try {
      setLoading(true);
      await scannerService.saveCommissionRule({
        scannerId,
        name: calculation.selectedRule,
        rate: parseFloat(calculation.customRate),
        conditions: {
          minAmount: parseFloat(calculation.amount),
          minVolume: parseInt(calculation.volume)
        }
      });
      await fetchCommissionRules();
      setCalculation({
        amount: '',
        volume: '',
        selectedRule: '',
        customRate: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Commission Calculator
      </Typography>

      <Grid container spacing={3}>
        {/* Commission Rules */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Commission Rules
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Rule Name</TableCell>
                    <TableCell>Rate</TableCell>
                    <TableCell>Min Amount</TableCell>
                    <TableCell>Min Volume</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {commissionRules.map((rule) => (
                    <TableRow key={rule._id}>
                      <TableCell>{rule.name}</TableCell>
                      <TableCell>{rule.rate}%</TableCell>
                      <TableCell>${rule.conditions.minAmount}</TableCell>
                      <TableCell>{rule.conditions.minVolume}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Calculator */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Calculate Commission
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Transaction Amount"
                  type="number"
                  value={calculation.amount}
                  onChange={(e) => setCalculation({ ...calculation, amount: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Volume (Number of Transactions)"
                  type="number"
                  value={calculation.volume}
                  onChange={(e) => setCalculation({ ...calculation, volume: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Commission Rule</InputLabel>
                  <Select
                    value={calculation.selectedRule}
                    label="Commission Rule"
                    onChange={(e) => setCalculation({ ...calculation, selectedRule: e.target.value })}
                  >
                    {commissionRules.map((rule) => (
                      <MenuItem key={rule._id} value={rule._id}>
                        {rule.name} ({rule.rate}%)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Custom Rate (%)"
                  type="number"
                  value={calculation.customRate}
                  onChange={(e) => setCalculation({ ...calculation, customRate: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCalculate}
                  fullWidth
                >
                  Calculate
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleSaveRule}
                  fullWidth
                >
                  Save as New Rule
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Results */}
        {result && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Calculation Results
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle1">Base Amount:</Typography>
                  <Typography variant="h5">${result.baseAmount.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle1">Commission Rate:</Typography>
                  <Typography variant="h5">{result.rate}%</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle1">Commission Amount:</Typography>
                  <Typography variant="h5">${result.commissionAmount.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle1">Total Amount:</Typography>
                  <Typography variant="h5">${result.totalAmount.toFixed(2)}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default CommissionCalculator; 