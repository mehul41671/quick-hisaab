import React, { useState, useEffect } from 'react';
import scannerService from '../services/scannerService';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const ScannerTemplates = ({ onSelect }) => {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    type: 'webcam',
    config: {}
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const data = await scannerService.getScannerTemplates();
      setTemplates(data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      if (editingTemplate) {
        const updatedTemplate = await scannerService.updateScannerTemplate(editingTemplate._id, newTemplate);
        setTemplates(templates.map(t => t._id === updatedTemplate._id ? updatedTemplate : t));
      } else {
        const template = await scannerService.createScannerTemplate(newTemplate);
        setTemplates([...templates, template]);
      }
      setOpenDialog(false);
      setEditingTemplate(null);
      setNewTemplate({
        name: '',
        description: '',
        type: 'webcam',
        config: {}
      });
    } catch (error) {
      setError('Failed to save template');
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      await scannerService.deleteScannerTemplate(templateId);
      setTemplates(templates.filter(t => t._id !== templateId));
    } catch (error) {
      setError('Failed to delete template');
    }
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setNewTemplate({
      name: template.name,
      description: template.description,
      type: template.type,
      config: template.config
    });
    setOpenDialog(true);
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
          Scanner Templates
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingTemplate(null);
            setNewTemplate({
              name: '',
              description: '',
              type: 'webcam',
              config: {}
            });
            setOpenDialog(true);
          }}
        >
          New Template
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {templates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {template.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {template.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={template.type}
                    size="small"
                    color="primary"
                  />
                  {template.isDefault && (
                    <Chip
                      label="Default"
                      size="small"
                      color="success"
                    />
                  )}
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => handleEditTemplate(template)}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDeleteTemplate(template._id)}
                  color="error"
                >
                  Delete
                </Button>
                {onSelect && (
                  <Button
                    size="small"
                    onClick={() => onSelect(template)}
                    sx={{ ml: 'auto' }}
                  >
                    Use Template
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTemplate ? 'Edit Template' : 'New Template'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Template Name"
            fullWidth
            value={newTemplate.name}
            onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={newTemplate.description}
            onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Scanner Type</InputLabel>
            <Select
              value={newTemplate.type}
              onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value })}
              label="Scanner Type"
            >
              {scannerService.getAvailableScanners().map((scanner) => (
                <MenuItem key={scanner.type} value={scanner.type}>
                  {scanner.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveTemplate} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ScannerTemplates; 