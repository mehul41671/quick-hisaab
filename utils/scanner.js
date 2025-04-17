const zebraScanner = require('zebra-scanner');

class ScannerManager {
  constructor() {
    this.scanner = null;
    this.isConnected = false;
    this.scanCallbacks = new Set();
  }

  async initializeScanner(deviceType, deviceId) {
    try {
      if (deviceType === 'zebra') {
        this.scanner = new zebraScanner.Scanner({
          deviceId: deviceId,
          onScan: this.handleScan.bind(this)
        });
        await this.scanner.connect();
        this.isConnected = true;
      } else if (deviceType === 'mobile') {
        // Mobile camera scanning will be handled by the frontend
        this.isConnected = true;
      }
      return { success: true, message: 'Scanner initialized successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  handleScan(data) {
    // Process scanned data
    const scanData = {
      serialNumber: data.code,
      timestamp: new Date(),
      deviceType: this.scanner ? 'zebra' : 'mobile'
    };

    // Notify all registered callbacks
    this.scanCallbacks.forEach(callback => callback(scanData));
  }

  registerScanCallback(callback) {
    this.scanCallbacks.add(callback);
    return () => this.scanCallbacks.delete(callback);
  }

  async disconnect() {
    if (this.scanner) {
      await this.scanner.disconnect();
    }
    this.isConnected = false;
    this.scanCallbacks.clear();
  }

  validateSerialNumber(serialNumber, startSerial, endSerial) {
    // Convert serial numbers to numbers for comparison
    const serial = parseInt(serialNumber);
    const start = parseInt(startSerial);
    const end = parseInt(endSerial);

    return serial >= start && serial <= end;
  }

  formatSerialNumber(serialNumber) {
    // Format serial number for display
    return serialNumber.toString().padStart(8, '0');
  }
}

module.exports = new ScannerManager(); 