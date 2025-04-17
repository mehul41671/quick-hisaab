import axios from 'axios';

class ScannerService {
  constructor() {
    this.scannerType = localStorage.getItem('scannerType') || 'webcam';
    this.config = JSON.parse(localStorage.getItem('scannerConfig') || '{}');
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
    this.eventListeners = {
      scannerUpdate: [],
      commissionUpdate: [],
      alert: []
    };
    this.initializeWebSocket();
  }

  // WebSocket Management
  initializeWebSocket() {
    this.ws = new WebSocket(process.env.REACT_APP_WS_URL || 'ws://localhost:5000');
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.broadcastEvent('connection', 'success', 'WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleWebSocketMessage(data);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.broadcastEvent('connection', 'error', 'WebSocket error');
    };
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.initializeWebSocket();
      }, this.reconnectInterval);
    } else {
      this.broadcastEvent('connection', 'error', 'Max reconnection attempts reached');
    }
  }

  handleWebSocketMessage(data) {
    switch (data.type) {
      case 'scannerUpdate':
        this.eventListeners.scannerUpdate.forEach(callback => callback(data.payload));
        break;
      case 'commissionUpdate':
        this.eventListeners.commissionUpdate.forEach(callback => callback(data.payload));
        break;
      case 'alert':
        this.eventListeners.alert.forEach(callback => callback(data.payload));
        break;
      default:
        console.warn('Unknown message type:', data.type);
    }
  }

  // Event Management
  addEventListener(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].push(callback);
    }
  }

  removeEventListener(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }

  broadcastEvent(type, status, message, data = {}) {
    if (this.eventListeners[type]) {
      this.eventListeners[type].forEach(callback => {
        callback({ type, status, message, ...data });
      });
    }
  }

  // Scanner Management
  async getScanners() {
    try {
      const response = await fetch('/api/scanner');
      if (!response.ok) throw new Error('Failed to fetch scanners');
      return await response.json();
    } catch (error) {
      console.error('Error fetching scanners:', error);
      throw error;
    }
  }

  async createScanner(scannerData) {
    try {
      const response = await fetch('/api/scanner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scannerData)
      });
      if (!response.ok) throw new Error('Failed to create scanner');
      return await response.json();
    } catch (error) {
      console.error('Error creating scanner:', error);
      throw error;
    }
  }

  async updateScanner(id, scannerData) {
    try {
      const response = await fetch(`/api/scanner/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scannerData)
      });
      if (!response.ok) throw new Error('Failed to update scanner');
      return await response.json();
    } catch (error) {
      console.error('Error updating scanner:', error);
      throw error;
    }
  }

  async deleteScanner(id) {
    try {
      const response = await fetch(`/api/scanner/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete scanner');
      return await response.json();
    } catch (error) {
      console.error('Error deleting scanner:', error);
      throw error;
    }
  }

  // Scanner Health and Status
  async checkHealth(id) {
    try {
      const response = await fetch(`/api/scanner/${id}/health`);
      if (!response.ok) throw new Error('Failed to check scanner health');
      return await response.json();
    } catch (error) {
      console.error('Error checking scanner health:', error);
      throw error;
    }
  }

  async getMetrics(id) {
    try {
      const response = await fetch(`/api/scanner/${id}/metrics`);
      if (!response.ok) throw new Error('Failed to fetch scanner metrics');
      return await response.json();
    } catch (error) {
      console.error('Error fetching scanner metrics:', error);
      throw error;
    }
  }

  // Scanner Profiles
  async getProfiles() {
    try {
      const response = await fetch('/api/scanner/profiles');
      if (!response.ok) throw new Error('Failed to fetch scanner profiles');
      return await response.json();
    } catch (error) {
      console.error('Error fetching scanner profiles:', error);
      throw error;
    }
  }

  async saveProfile(profileData) {
    try {
      const response = await fetch('/api/scanner/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      if (!response.ok) throw new Error('Failed to save scanner profile');
      return await response.json();
    } catch (error) {
      console.error('Error saving scanner profile:', error);
      throw error;
    }
  }

  // Firmware Management
  async updateFirmware(id, firmwareData) {
    try {
      const response = await fetch(`/api/scanner/${id}/firmware`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(firmwareData)
      });
      if (!response.ok) throw new Error('Failed to update firmware');
      return await response.json();
    } catch (error) {
      console.error('Error updating firmware:', error);
      throw error;
    }
  }

  async getFirmwareVersion(id) {
    try {
      const response = await fetch(`/api/scanner/${id}/firmware/version`);
      if (!response.ok) throw new Error('Failed to fetch firmware version');
      return await response.json();
    } catch (error) {
      console.error('Error fetching firmware version:', error);
      throw error;
    }
  }

  // Scanner Calibration
  async calibrate(id) {
    try {
      const response = await fetch(`/api/scanner/${id}/calibrate`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to calibrate scanner');
      return await response.json();
    } catch (error) {
      console.error('Error calibrating scanner:', error);
      throw error;
    }
  }

  async getCalibration(id) {
    try {
      const response = await fetch(`/api/scanner/${id}/calibration`);
      if (!response.ok) throw new Error('Failed to fetch calibration data');
      return await response.json();
    } catch (error) {
      console.error('Error fetching calibration data:', error);
      throw error;
    }
  }

  // Diagnostics
  async runDiagnostics(id) {
    try {
      const response = await fetch(`/api/scanner/${id}/diagnostics`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to run diagnostics');
      return await response.json();
    } catch (error) {
      console.error('Error running diagnostics:', error);
      throw error;
    }
  }

  async getDiagnosticReport(id) {
    try {
      const response = await fetch(`/api/scanner/${id}/diagnostics/report`);
      if (!response.ok) throw new Error('Failed to fetch diagnostic report');
      return await response.json();
    } catch (error) {
      console.error('Error fetching diagnostic report:', error);
      throw error;
    }
  }

  // Scanner Configuration
  setScanner(type, config) {
    this.scannerType = type;
    this.config = config;
    localStorage.setItem('scannerType', type);
    localStorage.setItem('scannerConfig', JSON.stringify(config));
  }

  getAvailableScanners() {
    return [
      {
        type: 'webcam',
        description: 'Webcam Scanner',
        configFields: []
      },
      {
        type: 'serial',
        description: 'Serial Scanner',
        configFields: ['port', 'baudRate', 'dataBits', 'stopBits', 'parity']
      },
      {
        type: 'zebra',
        description: 'Zebra Scanner',
        configFields: ['port', 'baudRate', 'dataBits', 'stopBits', 'parity']
      }
    ];
  }

  // Scanner Initialization
  async initializeScanner() {
    try {
      switch (this.scannerType) {
        case 'webcam':
          return await this.initializeWebcamScanner();
        case 'serial':
          return await this.initializeSerialScanner();
        case 'zebra':
          return await this.initializeZebraScanner();
        default:
          throw new Error('Unsupported scanner type');
      }
    } catch (error) {
      console.error('Error initializing scanner:', error);
      throw error;
    }
  }

  async initializeWebcamScanner() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      return { success: true, stream };
    } catch (error) {
      throw new Error('Failed to initialize webcam scanner');
    }
  }

  async initializeSerialScanner() {
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: this.config.baudRate });
      return { success: true, port };
    } catch (error) {
      throw new Error('Failed to initialize serial scanner');
    }
  }

  async initializeZebraScanner() {
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: this.config.baudRate });
      return { success: true, port };
    } catch (error) {
      throw new Error('Failed to initialize Zebra scanner');
    }
  }

  // Scanner Operations
  async scan() {
    try {
      switch (this.scannerType) {
        case 'webcam':
          return await this.scanWithWebcam();
        case 'serial':
          return await this.scanWithSerial();
        case 'zebra':
          return await this.scanWithZebra();
        default:
          throw new Error('Unsupported scanner type');
      }
    } catch (error) {
      console.error('Error scanning:', error);
      throw error;
    }
  }

  async testConnection() {
    try {
      const response = await fetch('/api/scanner/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: this.scannerType,
          config: this.config
        })
      });
      if (!response.ok) throw new Error('Failed to test connection');
      return await response.json();
    } catch (error) {
      console.error('Error testing connection:', error);
      throw error;
    }
  }

  // Profile Management
  async getScannerProfiles(scannerId) {
    const response = await fetch(`/api/scanners/${scannerId}/profiles`);
    if (!response.ok) throw new Error('Failed to fetch profiles');
    return response.json();
  }

  async saveScannerProfile(scannerId, profile) {
    const response = await fetch(`/api/scanners/${scannerId}/profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    if (!response.ok) throw new Error('Failed to save profile');
    return response.json();
  }

  async deleteScannerProfile(scannerId, profileId) {
    const response = await fetch(`/api/scanners/${scannerId}/profiles/${profileId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete profile');
  }

  async applyScannerProfile(scannerId, profileId) {
    const response = await fetch(`/api/scanners/${scannerId}/profiles/${profileId}/apply`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to apply profile');
  }

  // Template Management
  async getScannerTemplates() {
    const response = await fetch('/api/scanners/templates');
    if (!response.ok) throw new Error('Failed to fetch templates');
    return response.json();
  }

  async createScannerTemplate(template) {
    const response = await fetch('/api/scanners/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template)
    });
    if (!response.ok) throw new Error('Failed to create template');
    return response.json();
  }

  async updateScannerTemplate(templateId, template) {
    const response = await fetch(`/api/scanners/templates/${templateId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template)
    });
    if (!response.ok) throw new Error('Failed to update template');
    return response.json();
  }

  async deleteScannerTemplate(templateId) {
    const response = await fetch(`/api/scanners/templates/${templateId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete template');
  }

  // System Health
  async getSystemHealth() {
    const response = await fetch('/api/scanners/health');
    if (!response.ok) throw new Error('Failed to fetch health data');
    return response.json();
  }

  // Event Log
  async getScannerEvents(scannerId, filters = {}) {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`/api/scanners/${scannerId}/events?${queryParams}`);
    if (!response.ok) throw new Error('Failed to fetch events');
    return response.json();
  }

  // Commission Management
  async getScannerCommissions(scannerId) {
    const response = await fetch(`/api/scanners/${scannerId}/commissions`);
    if (!response.ok) throw new Error('Failed to fetch commissions');
    return response.json();
  }

  async addScannerCommission(scannerId, commission) {
    const response = await fetch(`/api/scanners/${scannerId}/commissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commission)
    });
    if (!response.ok) throw new Error('Failed to add commission');
    return response.json();
  }

  async updateCommissionStatus(scannerId, commissionId, status) {
    const response = await fetch(`/api/scanners/${scannerId}/commissions/${commissionId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update commission status');
    return response.json();
  }

  async getCommissionSummary(scannerId) {
    const response = await fetch(`/api/scanners/${scannerId}/commissions/summary`);
    if (!response.ok) throw new Error('Failed to fetch commission summary');
    return response.json();
  }

  // New methods for real-time data
  async getActiveScans(scannerId) {
    const response = await fetch(`${this.baseUrl}/scanners/${scannerId}/active-scans`);
    if (!response.ok) throw new Error('Failed to fetch active scans');
    return response.json();
  }

  async getSystemStatus() {
    const response = await fetch(`${this.baseUrl}/system/status`);
    if (!response.ok) throw new Error('Failed to fetch system status');
    return response.json();
  }

  async getRecentAlerts() {
    const response = await fetch(`${this.baseUrl}/alerts/recent`);
    if (!response.ok) throw new Error('Failed to fetch recent alerts');
    return response.json();
  }

  async acknowledgeAlert(alertId) {
    const response = await fetch(`${this.baseUrl}/alerts/${alertId}/acknowledge`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to acknowledge alert');
    return response.json();
  }
}

export default new ScannerService(); 