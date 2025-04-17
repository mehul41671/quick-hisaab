import React, { useState, useEffect } from 'react';
import scannerService from '../services/scannerService';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Grid
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';

const ScannerEventLog = ({ scannerId }) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    level: 'all',
    type: 'all',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [scannerId, filters]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const data = await scannerService.getScannerEvents(scannerId, filters);
      setEvents(data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (field) => (event) => {
    setFilters({
      ...filters,
      [field]: event.target.value
    });
  };

  const handleSearchChange = (event) => {
    setFilters({
      ...filters,
      search: event.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      level: 'all',
      type: 'all',
      search: ''
    });
  };

  const getEventLevelColor = (level) => {
    switch (level) {
      case 'info':
        return 'info';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'success':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Event Log
        </Typography>
        <Box>
          <Tooltip title="Toggle Filters">
            <IconButton onClick={() => setShowFilters(!showFilters)} sx={{ mr: 1 }}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchEvents}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {showFilters && (
        <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Search"
                value={filters.search}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Event Level</InputLabel>
                <Select
                  value={filters.level}
                  onChange={handleFilterChange('level')}
                  label="Event Level"
                >
                  <MenuItem value="all">All Levels</MenuItem>
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                  <MenuItem value="success">Success</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Event Type</InputLabel>
                <Select
                  value={filters.type}
                  onChange={handleFilterChange('type')}
                  label="Event Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="scan">Scan</MenuItem>
                  <MenuItem value="calibration">Calibration</MenuItem>
                  <MenuItem value="configuration">Configuration</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button
                startIcon={<ClearIcon />}
                onClick={clearFilters}
                sx={{ mt: 1 }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No events found
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event._id}>
                  <TableCell>
                    {new Date(event.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={event.level.toUpperCase()}
                      color={getEventLevelColor(event.level)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{event.type}</TableCell>
                  <TableCell>{event.message}</TableCell>
                  <TableCell>
                    {event.details && (
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(event.details, null, 2)}
                      </pre>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ScannerEventLog; 