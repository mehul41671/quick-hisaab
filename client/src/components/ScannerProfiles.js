import React, { useState, useEffect } from 'react';
import scannerService from '../services/scannerService';
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RestoreIcon from '@mui/icons-material/Restore';

const ScannerProfiles = ({ scannerId }) => {
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newProfile, setNewProfile] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchProfiles();
  }, [scannerId]);

  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      const data = await scannerService.getScannerProfiles(scannerId);
      setProfiles(data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch profiles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const profile = await scannerService.saveScannerProfile(scannerId, newProfile);
      setProfiles([...profiles, profile]);
      setOpenDialog(false);
      setNewProfile({ name: '', description: '' });
      setSuccess('Profile saved successfully');
    } catch (error) {
      setError('Failed to save profile');
    }
  };

  const handleDeleteProfile = async (profileId) => {
    try {
      await scannerService.deleteScannerProfile(scannerId, profileId);
      setProfiles(profiles.filter(p => p._id !== profileId));
      setSuccess('Profile deleted successfully');
    } catch (error) {
      setError('Failed to delete profile');
    }
  };

  const handleApplyProfile = async (profileId) => {
    try {
      await scannerService.applyScannerProfile(scannerId, profileId);
      setSuccess('Profile applied successfully');
    } catch (error) {
      setError('Failed to apply profile');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Scanner Profiles
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          New Profile
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

      <List>
        {profiles.map((profile) => (
          <ListItem key={profile._id}>
            <ListItemText
              primary={profile.name}
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {profile.description}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={`Created: ${new Date(profile.createdAt).toLocaleDateString()}`}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    {profile.isDefault && (
                      <Chip
                        label="Default"
                        color="primary"
                        size="small"
                      />
                    )}
                  </Box>
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={() => handleApplyProfile(profile._id)}
                title="Apply Profile"
                sx={{ mr: 1 }}
              >
                <RestoreIcon />
              </IconButton>
              <IconButton
                edge="end"
                onClick={() => handleDeleteProfile(profile._id)}
                title="Delete Profile"
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Save New Profile</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Profile Name"
            fullWidth
            value={newProfile.name}
            onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={newProfile.description}
            onChange={(e) => setNewProfile({ ...newProfile, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveProfile} variant="contained" startIcon={<SaveIcon />}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ScannerProfiles; 