const express = require('express');
const Alert = require('../models/Alert');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { validateAlertCreation } = require('../middleware/validation');

const router = express.Router();

// @desc      Get all alerts (with optional filtering)
// @route     GET /api/alerts
// @access    Public (with optional user context)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      type,
      severity,
      status, // We will now handle this field dynamically
      lat,
      lng,
      radius = 50,
      limit = 20,
      page = 1,
      sort = '-createdAt'
    } = req.query;

    // Build filter object
    const filter = { isPublic: true };
    
    if (type) filter.type = type;
    if (severity) filter.severity = severity;

    // --- THIS IS THE CORRECTED LOGIC ---
    // If a user specifically asks for 'expired' alerts, we show them.
    // For ALL other cases (including 'active' or no status provided),
    // we will dynamically find currently active alerts based on the date.
    if (status === 'expired') {
      filter.status = 'expired'; // You can keep this if you want a way to see old alerts
      const now = new Date();
      filter.validUntil = { $lt: now }; // Also ensure expired means the date has passed
    } else {
      const now = new Date();
      filter.validFrom = { $lte: now };
      filter.validUntil = { $gte: now };
    }
    // --- END OF CORRECTION ---

    // Build query
    let query = Alert.find(filter)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // If location is provided, find alerts within radius
    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const searchRadius = parseFloat(radius) / 6371; // Convert km to radians

      query = query.where({
        location: {
          $geoWithin: {
            $centerSphere: [[longitude, latitude], searchRadius]
          }
        }
      });
    }

    const alerts = await query.exec();
    const total = await Alert.countDocuments(filter);

    res.json({
      success: true,
      data: {
        alerts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching alerts'
    });
  }
});

// @desc      Get single alert
// @route     GET /api/alerts/:id
// @access    Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Increment view count if it exists
    if (alert.statistics) {
        alert.statistics.views = (alert.statistics.views || 0) + 1;
        await alert.save();
    }

    res.json({
      success: true,
      data: { alert }
    });
  } catch (error) {
    console.error('Get alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching alert'
    });
  }
});


// --- ALL OTHER ROUTES (POST, PUT, DELETE) REMAIN THE SAME. ---
// --- NO CHANGES ARE NEEDED FOR THEM. ---


// @desc      Create new alert
// @route     POST /api/alerts
// @access    Private (Admin only)
router.post('/', protect, authorize('admin'), validateAlertCreation, async (req, res) => {
  try {
    const alertData = {
      ...req.body,
      createdBy: req.user._id,
      location: {
        type: 'Point',
        coordinates: req.body.location.coordinates,
        address: req.body.location.address,
        city: req.body.location.city,
        state: req.body.location.state,
        country: req.body.location.country,
        radius: req.body.location.radius || 50
      }
    };

    const alert = await Alert.create(alertData);
    await alert.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: { alert }
    });
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating alert'
    });
  }
});

// @desc      Update alert
// @route     PUT /api/alerts/:id
// @access    Private (Admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user._id
    };

    if (req.body.location) {
      updateData.location = {
        ...alert.location,
        ...req.body.location,
        type: 'Point',
      };
    }

    const updatedAlert = await Alert.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
     .populate('updatedBy', 'name email');

    res.json({
      success: true,
      message: 'Alert updated successfully',
      data: { alert: updatedAlert }
    });
  } catch (error) {
    console.error('Update alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating alert'
    });
  }
});


// @desc      Delete alert
// @route     DELETE /api/alerts/:id
// @access    Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    await Alert.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting alert'
    });
  }
});


// @desc      Get alerts for user's location with preferences
// @route     GET /api/alerts/nearby
// @access    Private
router.get('/nearby', protect, async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    
    let latitude, longitude, searchRadius;
    
    if (lat && lng) {
      latitude = parseFloat(lat);
      longitude = parseFloat(lng);
      searchRadius = parseFloat(radius) || req.user.preferences?.alertRadius || 50;
    } else if (req.user.location && req.user.location.coordinates.length === 2) {
      latitude = req.user.location.coordinates[1];
      longitude = req.user.location.coordinates[0];
      searchRadius = req.user.preferences?.alertRadius || 50;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Location not provided and user location not set'
      });
    }

    const radiusInRadians = searchRadius / 6371;

    // --- CORRECTED LOGIC: Removed status: 'active' and rely only on date ---
    const filter = {
      isPublic: true,
      location: {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], radiusInRadians]
        }
      },
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    };
    // --- END OF CORRECTION ---

    const alerts = await Alert.find(filter)
      .populate('createdBy', 'name email')
      .sort({ severity: -1, createdAt: -1 })
      .limit(100);
      
    res.json({
      success: true,
      data: { 
        alerts: alerts,
        count: alerts.length,
      }
    });
  } catch (error) {
    console.error('Get nearby alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching nearby alerts'
    });
  }
});


// @desc      Get alert statistics
// @route     GET /api/alerts/stats/overview
// @access    Private (Admin only)
router.get('/stats/overview', protect, authorize('admin'), async (req, res) => {
  try {
    const now = new Date();
    
    const stats = await Alert.aggregate([
      {
        $facet: {
          totalAlerts: [ { $count: 'count' } ],
          activeAlerts: [
            {
              // --- CORRECTED LOGIC: Use date instead of status field ---
              $match: {
                validFrom: { $lte: now },
                validUntil: { $gte: now }
              }
              // --- END OF CORRECTION ---
            },
            { $count: 'count' }
          ],
          alertsByType: [ { $group: { _id: '$type', count: { $sum: 1 } } } ],
          alertsBySeverity: [ { $group: { _id: '$severity', count: { $sum: 1 } } } ],
          recentAlerts: [
            { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
            { $count: 'count' }
          ]
        }
      }
    ]);

    const formattedStats = {
        totalAlerts: stats[0].totalAlerts[0]?.count || 0,
        activeAlerts: stats[0].activeAlerts[0]?.count || 0,
        alertsByType: stats[0].alertsByType,
        alertsBySeverity: stats[0].alertsBySeverity,
        recentAlerts: stats[0].recentAlerts[0]?.count || 0
    };

    res.json({
      success: true,
      data: { stats: formattedStats }
    });
  } catch (error) {
    console.error('Get alert stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching alert statistics'
    });
  }
});


module.exports = router;

