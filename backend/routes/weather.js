const express = require('express');
const axios = require('axios');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Mock weather data for demo purposes
const mockWeatherData = {
  current: {
    temperature: 25,
    humidity: 65,
    precipitation: 0,
    windSpeed: 12,
    windDirection: 180,
    pressure: 1013,
    visibility: 10,
    condition: 'clear',
    description: 'Clear sky'
  },
  forecast: [
    {
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      temperature: { min: 20, max: 28 },
      precipitation: 0,
      windSpeed: 10,
      condition: 'partly_cloudy',
      description: 'Partly cloudy'
    },
    {
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      temperature: { min: 18, max: 25 },
      precipitation: 5,
      windSpeed: 15,
      condition: 'rain',
      description: 'Light rain'
    },
    {
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      temperature: { min: 15, max: 22 },
      precipitation: 15,
      windSpeed: 20,
      condition: 'heavy_rain',
      description: 'Heavy rain'
    }
  ],
  alerts: [
    {
      id: 'weather_001',
      type: 'flood_warning',
      severity: 'medium',
      title: 'Flood Watch',
      description: 'Heavy rainfall expected in the next 24-48 hours may cause localized flooding.',
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      areas: ['Low-lying areas', 'Near rivers and streams']
    }
  ]
};

// @desc    Get current weather
// @route   GET /api/weather/current
// @access  Public
router.get('/current', optionalAuth, async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // In a real implementation, you would call a weather API here
    // For demo purposes, we'll return mock data
    const weatherData = {
      ...mockWeatherData.current,
      location: {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng)
      },
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: { weather: weatherData }
    });
  } catch (error) {
    console.error('Get current weather error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching weather data'
    });
  }
});

// @desc    Get weather forecast
// @route   GET /api/weather/forecast
// @access  Public
router.get('/forecast', optionalAuth, async (req, res) => {
  try {
    const { lat, lng, days = 5 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // In a real implementation, you would call a weather API here
    const forecastData = {
      location: {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng)
      },
      forecast: mockWeatherData.forecast.slice(0, parseInt(days)),
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: { forecast: forecastData }
    });
  } catch (error) {
    console.error('Get weather forecast error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching weather forecast'
    });
  }
});

// @desc    Get weather alerts
// @route   GET /api/weather/alerts
// @access  Public
router.get('/alerts', optionalAuth, async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // In a real implementation, you would call a weather API here
    const alertsData = {
      location: {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        radius: parseFloat(radius)
      },
      alerts: mockWeatherData.alerts,
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: { alerts: alertsData }
    });
  } catch (error) {
    console.error('Get weather alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching weather alerts'
    });
  }
});

// @desc    Get disaster risk assessment
// @route   GET /api/weather/risk-assessment
// @access  Public
router.get('/risk-assessment', optionalAuth, async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Mock risk assessment based on weather conditions
    const riskAssessment = {
      location: {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng)
      },
      overallRisk: 'medium',
      risks: [
        {
          type: 'flood',
          level: 'medium',
          probability: 0.6,
          factors: ['Heavy rainfall forecast', 'Proximity to water bodies'],
          recommendations: [
            'Monitor water levels',
            'Prepare emergency supplies',
            'Avoid low-lying areas'
          ]
        },
        {
          type: 'landslide',
          level: 'low',
          probability: 0.3,
          factors: ['Moderate rainfall', 'Stable terrain'],
          recommendations: [
            'Monitor soil conditions',
            'Avoid steep slopes during heavy rain'
          ]
        }
      ],
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: { riskAssessment }
    });
  } catch (error) {
    console.error('Get risk assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching risk assessment'
    });
  }
});

// @desc    Get historical weather data
// @route   GET /api/weather/historical
// @access  Public
router.get('/historical', optionalAuth, async (req, res) => {
  try {
    const { lat, lng, days = 7 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Generate mock historical data
    const historicalData = [];
    for (let i = parseInt(days); i > 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      historicalData.push({
        date: date.toISOString().split('T')[0],
        temperature: { min: 15 + Math.random() * 10, max: 25 + Math.random() * 10 },
        precipitation: Math.random() * 20,
        windSpeed: 5 + Math.random() * 15,
        humidity: 50 + Math.random() * 30
      });
    }

    res.json({
      success: true,
      data: {
        location: {
          latitude: parseFloat(lat),
          longitude: parseFloat(lng)
        },
        historical: historicalData,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get historical weather error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching historical weather data'
    });
  }
});

module.exports = router;
