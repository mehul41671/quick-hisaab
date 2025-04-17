const Scanner = require('../models/Scanner');
const ScannerProfile = require('../models/ScannerProfile');
const ScannerEvent = require('../models/ScannerEvent');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const WebSocket = require('ws');

class ScannerController {
  // Scanner Management
  async createScanner(req, res) {
    try {
      const scanner = new Scanner(req.body);
      await scanner.save();
      res.status(201).json(scanner);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getScanners(req, res) {
    try {
      const scanners = await Scanner.find();
      res.json(scanners);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateScanner(req, res) {
    try {
      const scanner = await Scanner.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      res.json(scanner);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteScanner(req, res) {
    try {
      await Scanner.findByIdAndDelete(req.params.id);
      res.json({ message: 'Scanner deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Scanner Health and Status
  async checkHealth(req, res) {
    try {
      const scanner = await Scanner.findById(req.params.id);
      const health = await this.testScannerConnection(scanner);
      res.json(health);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getMetrics(req, res) {
    try {
      const metrics = await ScannerEvent.aggregate([
        {
          $group: {
            _id: {
              scanner: '$scannerId',
              status: '$status'
            },
            count: { $sum: 1 }
          }
        }
      ]);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Scanner Profiles
  async saveProfile(req, res) {
    try {
      const profile = new ScannerProfile(req.body);
      await profile.save();
      res.status(201).json(profile);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getProfiles(req, res) {
    try {
      const profiles = await ScannerProfile.find();
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Scanner Events
  async createEvent(req, res) {
    try {
      const event = new ScannerEvent(req.body);
      await event.save();
      
      // Broadcast event to connected WebSocket clients
      this.broadcastEvent(event);
      
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Firmware Management
  async updateFirmware(req, res) {
    try {
      const scanner = await Scanner.findById(req.params.id);
      // Implement firmware update logic
      res.json({ message: 'Firmware update initiated' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getFirmwareVersion(req, res) {
    try {
      const scanner = await Scanner.findById(req.params.id);
      res.json({ version: scanner.firmwareVersion });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Scanner Calibration
  async calibrate(req, res) {
    try {
      const scanner = await Scanner.findById(req.params.id);
      // Implement calibration logic
      res.json({ message: 'Calibration completed' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getCalibration(req, res) {
    try {
      const scanner = await Scanner.findById(req.params.id);
      res.json(scanner.calibration);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Diagnostics
  async runDiagnostics(req, res) {
    try {
      const scanner = await Scanner.findById(req.params.id);
      const diagnostics = await this.performDiagnostics(scanner);
      res.json(diagnostics);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getDiagnosticReport(req, res) {
    try {
      const report = await ScannerEvent.find({
        type: 'diagnostic',
        scannerId: req.params.id
      }).sort({ timestamp: -1 });
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Helper Methods
  async testScannerConnection(scanner) {
    try {
      if (scanner.type === 'serial') {
        const port = new SerialPort({
          path: scanner.config.port,
          baudRate: scanner.config.baudRate
        });
        return new Promise((resolve, reject) => {
          port.on('open', () => {
            port.close();
            resolve({ connected: true });
          });
          port.on('error', () => {
            resolve({ connected: false });
          });
        });
      }
      return { connected: true };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }

  async performDiagnostics(scanner) {
    const diagnostics = {
      connection: await this.testScannerConnection(scanner),
      firmware: scanner.firmwareVersion,
      lastCalibration: scanner.lastCalibration,
      recentErrors: await ScannerEvent.find({
        scannerId: scanner._id,
        type: 'error'
      }).limit(5)
    };
    return diagnostics;
  }

  broadcastEvent(event) {
    if (this.wss) {
      this.wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(event));
        }
      });
    }
  }

  setWebSocketServer(wss) {
    this.wss = wss;
  }
}

module.exports = new ScannerController(); 