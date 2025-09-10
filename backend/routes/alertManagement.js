const express = require('express');
const AlertFetcher = require('../services/alertFetcher');
const CronService = require('../services/cronService');
const Alert = require('../models/Alert');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

const router = express.Router();

// Initialize services
const alertFetcher = new AlertFetcher();
const cronService = new CronService();

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// @desc    Fetch alerts from external APIs
// @route   POST /api/alert-management/fetch
// @access  Private (Admin only)
router.post('/fetch', protect, authorize('admin'), async (req, res) => {
  try {
    const result = await alertFetcher.fetchAndProcessAlerts();
    
    res.json({
      success: true,
      message: 'Alert fetch completed',
      data: result
    });
  } catch (error) {
    console.error('Manual alert fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts',
      error: error.message
    });
  }
});

// @desc    Get alert fetcher status
// @route   GET /api/alert-management/status
// @access  Private (Admin only)
router.get('/status', protect, authorize('admin'), async (req, res) => {
  try {
    const status = alertFetcher.getStatus();
    const cronStatus = cronService.getStatus();
    
    res.json({
      success: true,
      data: {
        alertFetcher: status,
        cronService: cronStatus
      }
    });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting status',
      error: error.message
    });
  }
});

// @desc    Get cron service status
// @route   GET /api/alert-management/cron/status
// @access  Private (Admin only)
router.get('/cron/status', protect, authorize('admin'), async (req, res) => {
  try {
    const status = cronService.getStatus();
    
    res.json({
      success: true,
      data: { status }
    });
  } catch (error) {
    console.error('Get cron status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting cron status',
      error: error.message
    });
  }
});

// @desc    Start cron service
// @route   POST /api/alert-management/cron/start
// @access  Private (Admin only)
router.post('/cron/start', protect, authorize('admin'), async (req, res) => {
  try {
    cronService.start();
    
    res.json({
      success: true,
      message: 'Cron service started successfully'
    });
  } catch (error) {
    console.error('Start cron service error:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting cron service',
      error: error.message
    });
  }
});

// @desc    Stop cron service
// @route   POST /api/alert-management/cron/stop
// @access  Private (Admin only)
router.post('/cron/stop', protect, authorize('admin'), async (req, res) => {
  try {
    cronService.stop();
    
    res.json({
      success: true,
      message: 'Cron service stopped successfully'
    });
  } catch (error) {
    console.error('Stop cron service error:', error);
    res.status(500).json({
      success: false,
      message: 'Error stopping cron service',
      error: error.message
    });
  }
});

// @desc    Manual cleanup of expired alerts
// @route   POST /api/alert-management/cleanup
// @access  Private (Admin only)
router.post('/cleanup', protect, authorize('admin'), async (req, res) => {
  try {
    const result = await cronService.cleanupExpiredAlerts();
    
    res.json({
      success: true,
      message: 'Cleanup completed successfully',
      data: result
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during cleanup',
      error: error.message
    });
  }
});

// @desc    Bulk import alerts from CSV
// @route   POST /api/alert-management/import/csv
// @access  Private (Admin only)
router.post('/import/csv', protect, authorize('admin'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'CSV file is required'
      });
    }

    const alerts = [];
    const errors = [];

    // Parse CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
          try {
            // Validate required fields
            if (!row.title || !row.type || !row.severity || !row.latitude || !row.longitude) {
              errors.push(`Row ${alerts.length + 1}: Missing required fields`);
              return;
            }

            const alert = {
              title: row.title,
              description: row.description || '',
              type: row.type.toLowerCase(),
              severity: row.severity.toLowerCase(),
              status: 'active',
              location: {
                type: 'Point',
                coordinates: [parseFloat(row.longitude), parseFloat(row.latitude)],
                address: row.address || '',
                city: row.city || '',
                state: row.state || '',
                country: row.country || 'India',
                radius: parseFloat(row.radius) || 25
              },
              validFrom: new Date(),
              validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
              createdBy: req.user._id,
              isPublic: true,
              tags: row.tags ? row.tags.split(',').map(tag => tag.trim()) : [],
              metadata: {
                source: 'import',
                externalId: `import_${Date.now()}_${alerts.length}`,
                confidence: 0.8,
                verified: false
              },
              statistics: { views: 0, shares: 0, acknowledgments: 0 }
            };

            alerts.push(alert);
          } catch (error) {
            errors.push(`Row ${alerts.length + 1}: ${error.message}`);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    if (alerts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid alerts found in CSV file',
        errors
      });
    }

    // Insert alerts into database
    const insertedAlerts = await Alert.insertMany(alerts);

    res.json({
      success: true,
      message: `Successfully imported ${insertedAlerts.length} alerts`,
      data: {
        imported: insertedAlerts.length,
        errors: errors.length,
        errorDetails: errors
      }
    });
  } catch (error) {
    console.error('CSV import error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Error importing CSV file',
      error: error.message
    });
  }
});

// @desc    Bulk import alerts from JSON
// @route   POST /api/alert-management/import/json
// @access  Private (Admin only)
router.post('/import/json', protect, authorize('admin'), async (req, res) => {
  try {
    const { alerts } = req.body;

    if (!alerts || !Array.isArray(alerts)) {
      return res.status(400).json({
        success: false,
        message: 'Alerts array is required'
      });
    }

    const processedAlerts = [];
    const errors = [];

    for (let i = 0; i < alerts.length; i++) {
      try {
        const alertData = alerts[i];
        
        // Validate required fields
        if (!alertData.title || !alertData.type || !alertData.severity || 
            !alertData.location || !alertData.location.coordinates) {
          errors.push(`Alert ${i + 1}: Missing required fields`);
          continue;
        }

        const alert = {
          title: alertData.title,
          description: alertData.description || '',
          type: alertData.type.toLowerCase(),
          severity: alertData.severity.toLowerCase(),
          status: 'active',
          location: {
            type: 'Point',
            coordinates: alertData.location.coordinates,
            address: alertData.location.address || '',
            city: alertData.location.city || '',
            state: alertData.location.state || '',
            country: alertData.location.country || 'India',
            radius: alertData.location.radius || 25
          },
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
          createdBy: req.user._id,
          isPublic: true,
          tags: alertData.tags || [],
          metadata: {
            source: 'import',
            externalId: `import_${Date.now()}_${i}`,
            confidence: 0.8,
            verified: false
          },
          statistics: { views: 0, shares: 0, acknowledgments: 0 }
        };

        processedAlerts.push(alert);
      } catch (error) {
        errors.push(`Alert ${i + 1}: ${error.message}`);
      }
    }

    if (processedAlerts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid alerts found in JSON data',
        errors
      });
    }

    // Insert alerts into database
    const insertedAlerts = await Alert.insertMany(processedAlerts);

    res.json({
      success: true,
      message: `Successfully imported ${insertedAlerts.length} alerts`,
      data: {
        imported: insertedAlerts.length,
        errors: errors.length,
        errorDetails: errors
      }
    });
  } catch (error) {
    console.error('JSON import error:', error);
    res.status(500).json({
      success: false,
      message: 'Error importing JSON data',
      error: error.message
    });
  }
});

// @desc    Export alerts to CSV
// @route   GET /api/alert-management/export/csv
// @access  Private (Admin only)
router.get('/export/csv', protect, authorize('admin'), async (req, res) => {
  try {
    const { type, severity, status } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;

    const alerts = await Alert.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    // Convert to CSV format
    const csvData = [
      'Title,Description,Type,Severity,Status,Latitude,Longitude,Address,City,State,Country,Radius,ValidFrom,ValidUntil,CreatedBy,Tags',
      ...alerts.map(alert => [
        `"${alert.title}"`,
        `"${alert.description}"`,
        alert.type,
        alert.severity,
        alert.status,
        alert.location.coordinates[1],
        alert.location.coordinates[0],
        `"${alert.location.address || ''}"`,
        `"${alert.location.city || ''}"`,
        `"${alert.location.state || ''}"`,
        `"${alert.location.country || ''}"`,
        alert.location.radius || 25,
        alert.validFrom.toISOString(),
        alert.validUntil.toISOString(),
        `"${alert.createdBy?.name || ''}"`,
        `"${alert.tags.join(',')}"`
      ].join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=alerts_export.csv');
    res.send(csvData);
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting alerts to CSV',
      error: error.message
    });
  }
});

module.exports = router;
