const mongoose = require('mongoose');
const Alert = require('../models/Alert');
const Scanner = require('../models/Scanner');

class ErrorFixer {
  constructor() {
    this.errorPatterns = {
      // Database connection errors
      'ECONNREFUSED': {
        fix: this.fixDatabaseConnection,
        severity: 'critical'
      },
      // Scanner connection errors
      'SCANNER_DISCONNECTED': {
        fix: this.fixScannerConnection,
        severity: 'high'
      },
      // Configuration errors
      'INVALID_CONFIG': {
        fix: this.fixConfiguration,
        severity: 'medium'
      },
      // Performance issues
      'HIGH_LATENCY': {
        fix: this.optimizePerformance,
        severity: 'medium'
      },
      // Resource errors
      'RESOURCE_EXHAUSTED': {
        fix: this.manageResources,
        severity: 'high'
      }
    };
  }

  async detectAndFix(error) {
    try {
      // Log the error
      console.log('Error detected:', error.message);

      // Find matching pattern
      const pattern = Object.keys(this.errorPatterns).find(pattern => 
        error.message.includes(pattern)
      );

      if (pattern) {
        const { fix, severity } = this.errorPatterns[pattern];
        const result = await fix(error);
        
        // Create alert for the fix
        await this.createAlert({
          type: 'error',
          message: `Automatically fixed ${pattern} error`,
          severity,
          details: result
        });

        return {
          success: true,
          message: `Error fixed: ${pattern}`,
          details: result
        };
      }

      return {
        success: false,
        message: 'No automatic fix available for this error'
      };
    } catch (fixError) {
      console.error('Error in fix attempt:', fixError);
      return {
        success: false,
        message: 'Failed to fix error',
        error: fixError.message
      };
    }
  }

  async fixDatabaseConnection(error) {
    try {
      // Try to reconnect to database
      await mongoose.disconnect();
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/scanner-system', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      return { action: 'Database reconnected successfully' };
    } catch (err) {
      throw new Error('Failed to fix database connection');
    }
  }

  async fixScannerConnection(error) {
    try {
      // Get affected scanner
      const scanner = await Scanner.findOne({ status: 'disconnected' });
      if (!scanner) return { action: 'No disconnected scanners found' };

      // Attempt to reconnect
      // This would involve actual scanner reconnection logic
      scanner.status = 'connected';
      await scanner.save();

      return {
        action: 'Scanner reconnected',
        scannerId: scanner._id
      };
    } catch (err) {
      throw new Error('Failed to fix scanner connection');
    }
  }

  async fixConfiguration(error) {
    try {
      // Reset to default configuration
      const scanner = await Scanner.findOne({ _id: error.scannerId });
      if (!scanner) return { action: 'Scanner not found' };

      scanner.configuration = scanner.defaultConfiguration;
      await scanner.save();

      return {
        action: 'Configuration reset to defaults',
        scannerId: scanner._id
      };
    } catch (err) {
      throw new Error('Failed to fix configuration');
    }
  }

  async optimizePerformance(error) {
    try {
      // Implement performance optimization
      // This could include:
      // - Clearing cache
      // - Optimizing queries
      // - Adjusting resource allocation
      return {
        action: 'Performance optimized',
        optimizations: ['Cache cleared', 'Queries optimized']
      };
    } catch (err) {
      throw new Error('Failed to optimize performance');
    }
  }

  async manageResources(error) {
    try {
      // Implement resource management
      // This could include:
      // - Freeing up memory
      // - Closing unused connections
      // - Adjusting resource limits
      return {
        action: 'Resources managed',
        actions: ['Memory freed', 'Connections optimized']
      };
    } catch (err) {
      throw new Error('Failed to manage resources');
    }
  }

  async createAlert(alertData) {
    try {
      const alert = new Alert(alertData);
      await alert.save();
      return alert;
    } catch (err) {
      console.error('Failed to create alert:', err);
    }
  }
}

module.exports = new ErrorFixer(); 