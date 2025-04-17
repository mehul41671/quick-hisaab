import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert
} from '@mui/material';
import { CameraAlt, Delete, CheckCircle, Cancel } from '@mui/icons-material';
import axios from 'axios';

const FacialRecognition = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [knownFaces, setKnownFaces] = useState([]);
  const [recognitionResult, setRecognitionResult] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [userId, setUserId] = useState('');
  const [label, setLabel] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    fetchKnownFaces();
    initializeCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Error accessing camera: ' + err.message);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const captureImage = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      return canvasRef.current.toDataURL('image/jpeg');
    }
    return null;
  };

  const fetchKnownFaces = async () => {
    try {
      const response = await axios.get('/api/facial-recognition/faces');
      setKnownFaces(response.data.faces);
    } catch (err) {
      setError('Error fetching known faces: ' + err.message);
    }
  };

  const addFace = async () => {
    try {
      setLoading(true);
      setError(null);
      const imageData = captureImage();
      if (!imageData) {
        throw new Error('Failed to capture image');
      }

      const response = await axios.post('/api/facial-recognition/faces', {
        image: imageData,
        userId,
        label
      });

      setSuccess('Face added successfully');
      setOpenDialog(false);
      fetchKnownFaces();
    } catch (err) {
      setError('Error adding face: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const recognizeFace = async () => {
    try {
      setLoading(true);
      setError(null);
      const imageData = captureImage();
      if (!imageData) {
        throw new Error('Failed to capture image');
      }

      const response = await axios.post('/api/facial-recognition/recognize', {
        image: imageData
      });

      setRecognitionResult(response.data);
    } catch (err) {
      setError('Error recognizing face: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyFace = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      const imageData = captureImage();
      if (!imageData) {
        throw new Error('Failed to capture image');
      }

      const response = await axios.post(`/api/facial-recognition/verify/${userId}`, {
        image: imageData
      });

      setVerificationResult(response.data);
    } catch (err) {
      setError('Error verifying face: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeFace = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      await axios.delete(`/api/facial-recognition/faces/${userId}`);
      setSuccess('Face removed successfully');
      fetchKnownFaces();
    } catch (err) {
      setError('Error removing face: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Camera Feed */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Camera Feed
              </Typography>
              <Box sx={{ position: 'relative', width: '100%', height: 400 }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </Box>
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<CameraAlt />}
                  onClick={recognizeFace}
                  disabled={loading}
                >
                  Recognize Face
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setOpenDialog(true)}
                  disabled={loading}
                >
                  Add New Face
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Results */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recognition Results
              </Typography>
              {recognitionResult && (
                <Box sx={{ mb: 2 }}>
                  {recognitionResult.success ? (
                    <Alert severity="success">
                      Face recognized: {recognitionResult.match.label}
                      <br />
                      Confidence: {(recognitionResult.match.confidence * 100).toFixed(2)}%
                    </Alert>
                  ) : (
                    <Alert severity="warning">
                      {recognitionResult.message}
                    </Alert>
                  )}
                </Box>
              )}
              {verificationResult && (
                <Box sx={{ mb: 2 }}>
                  {verificationResult.verified ? (
                    <Alert severity="success">
                      Face verified successfully
                      <br />
                      Confidence: {(verificationResult.confidence * 100).toFixed(2)}%
                    </Alert>
                  ) : (
                    <Alert severity="error">
                      Face verification failed
                    </Alert>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Known Faces List */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Known Faces
              </Typography>
              <List>
                {knownFaces.map((face) => (
                  <ListItem
                    key={face.userId}
                    secondaryAction={
                      <Box>
                        <IconButton
                          edge="end"
                          onClick={() => verifyFace(face.userId)}
                          disabled={loading}
                        >
                          <CheckCircle />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => removeFace(face.userId)}
                          disabled={loading}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar>{face.label[0]}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={face.label}
                      secondary={`ID: ${face.userId}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Face Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Face</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="User ID"
            fullWidth
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Label"
            fullWidth
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={addFace} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error and Success Messages */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {success}
        </Alert>
      )}
    </Box>
  );
};

export default FacialRecognition; 