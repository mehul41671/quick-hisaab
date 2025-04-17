const express = require('express');
const router = express.Router();
const facialRecognition = require('../services/facialRecognition');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Initialize facial recognition
router.post('/initialize', async (req, res) => {
  try {
    await facialRecognition.initialize();
    res.json({ success: true, message: 'Facial recognition initialized' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add a new face
router.post('/faces', upload.single('image'), async (req, res) => {
  try {
    const { userId, label } = req.body;
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image provided' });
    }
    const result = await facialRecognition.addFace(req.file.buffer, userId, label);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Recognize a face
router.post('/recognize', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image provided' });
    }
    const result = await facialRecognition.recognizeFace(req.file.buffer);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verify a face
router.post('/verify/:userId', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image provided' });
    }
    const result = await facialRecognition.verifyFace(req.file.buffer, req.params.userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Remove a face
router.delete('/faces/:userId', async (req, res) => {
  try {
    const result = await facialRecognition.removeFace(req.params.userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// List known faces
router.get('/faces', async (req, res) => {
  try {
    const faces = await facialRecognition.listKnownFaces();
    res.json({ success: true, faces });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router; 