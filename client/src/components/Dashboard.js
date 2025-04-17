import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';

const Dashboard = ({ isAuthenticated, onLogout }) => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get('/api/dashboard');
        setData(response.data);
      } catch (error) {
        setError('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography color="error" align="center">
            {error}
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Dashboard</Typography>
        <Button variant="contained" color="primary" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        {data && (
          <Typography>
            Welcome to your dashboard! Here's your data: {JSON.stringify(data)}
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default Dashboard; 