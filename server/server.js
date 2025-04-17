const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const boxRoutes = require('./routes/boxRoutes');
const scannerRoutes = require('./routes/scannerRoutes');
const commissionRoutes = require('./routes/commissionRoutes');
const alertRoutes = require('./routes/alertRoutes');
const facialRecognitionRoutes = require('./routes/facialRecognitionRoutes');
const errorFixer = require('./services/errorFixer');
const facialRecognition = require('./services/facialRecognition');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Initialize facial recognition
facialRecognition.initialize()
  .then(() => console.log('Facial recognition initialized'))
  .catch(err => console.error('Error initializing facial recognition:', err));

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New WebSocket connection');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received message:', data);

      // Handle different message types
      switch (data.type) {
        case 'subscribe':
          // Handle subscription to scanner updates
          ws.subscribedScanners = data.scannerIds;
          break;
        case 'unsubscribe':
          // Handle unsubscription from scanner updates
          ws.subscribedScanners = ws.subscribedScanners.filter(
            id => !data.scannerIds.includes(id)
          );
          break;
        case 'acknowledgeAlert':
          // Handle alert acknowledgment
          broadcast('alert:acknowledged', {
            alertId: data.alertId,
            acknowledgedBy: data.userId
          });
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// Broadcast function for WebSocket messages
function broadcast(type, data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type, data }));
    }
  });
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/boxes', boxRoutes);
app.use('/api/scanners', scannerRoutes);
app.use('/api/commissions', commissionRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/facial-recognition', facialRecognitionRoutes);

// Error handling middleware
app.use(async (err, req, res, next) => {
  console.error('Error:', err);
  
  // Try to automatically fix the error
  const fixResult = await errorFixer.detectAndFix(err);
  
  if (fixResult.success) {
    console.log('Error automatically fixed:', fixResult.message);
    res.status(200).json({
      message: 'Error was automatically fixed',
      details: fixResult.details
    });
  } else {
    res.status(500).json({
      message: 'An error occurred',
      error: err.message,
      fixAttempt: fixResult
    });
  }
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/scanner-system', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export broadcast functions for use in other files
module.exports = {
  broadcastScannerUpdate,
  broadcastCommissionUpdate,
  broadcastAlertUpdate
}; 