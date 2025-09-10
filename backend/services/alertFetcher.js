const axios = require('axios');
const Alert = require('../models/Alert');
const User = require('../models/User');
const Notification = require('../models/Notification');
const webpush = require('web-push');

class AlertFetcher {
  constructor() {
    this.weatherApiKey = process.env.WEATHER_API_KEY;
    this.weatherApiUrl = process.env.WEATHER_API_URL || 'https://api.openweathermap.org/data/2.5';
    this.lastFetchTime = null;
  }

  // Fetch weather alerts from OpenWeatherMap
  async fetchWeatherAlerts() {
    if (!this.weatherApiKey || this.weatherApiKey === 'your_weather_api_key') {
      console.log('Weather API key not configured, using mock data');
      return this.getMockWeatherAlerts();
    }

    try {
      const alerts = [];
      
      // Major Indian cities for monitoring
      const cities = [
        { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
        { name: 'Delhi', lat: 28.7041, lng: 77.1025 },
        { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
        { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
        { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
        { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
        { name: 'Pune', lat: 18.5204, lng: 73.8567 },
        { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 }
      ];

      for (const city of cities) {
        try {
          // Get current weather
          const weatherResponse = await axios.get(`${this.weatherApiUrl}/weather`, {
            params: {
              lat: city.lat,
              lon: city.lng,
              appid: this.weatherApiKey,
              units: 'metric'
            }
          });

          const weather = weatherResponse.data;
          
          // Analyze weather conditions for disaster risks
          const alertsForCity = this.analyzeWeatherForDisasters(weather, city);
          alerts.push(...alertsForCity);

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error fetching weather for ${city.name}:`, error.message);
        }
      }

      return alerts;
    } catch (error) {
      console.error('Error fetching weather alerts:', error.message);
      return this.getMockWeatherAlerts();
    }
  }

  // Analyze weather data for disaster risks
  analyzeWeatherForDisasters(weather, city) {
    const alerts = [];
    const now = new Date();
    const validUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    // Flood risk analysis
    if (weather.rain && weather.rain['1h'] > 20) {
      alerts.push({
        title: `Flood Warning - ${city.name}`,
        description: `Heavy rainfall (${weather.rain['1h']}mm/h) detected in ${city.name}. Risk of urban flooding in low-lying areas. Avoid flooded roads and move to higher ground if necessary.`,
        type: 'flood',
        severity: weather.rain['1h'] > 50 ? 'high' : 'medium',
        status: 'active',
        location: {
          type: 'Point',
          coordinates: [city.lng, city.lat],
          address: city.name,
          city: city.name,
          state: this.getStateFromCity(city.name),
          country: 'India',
          radius: 25
        },
        weatherData: {
          temperature: weather.main.temp,
          humidity: weather.main.humidity,
          precipitation: weather.rain['1h'] || 0,
          windSpeed: weather.wind.speed,
          windDirection: weather.wind.deg,
          pressure: weather.main.pressure,
          visibility: weather.visibility / 1000,
          lastUpdated: now
        },
        safetyInstructions: [
          {
            title: 'Avoid flooded areas',
            description: 'Do not walk or drive through floodwaters',
            priority: 'high'
          },
          {
            title: 'Move to higher ground',
            description: 'If in a low-lying area, move to higher elevation',
            priority: 'high'
          }
        ],
        emergencyContacts: [
          { name: 'Emergency Services', phone: '100', type: 'emergency' },
          { name: 'Disaster Management', phone: '108', type: 'emergency' }
        ],
        validFrom: now,
        validUntil: validUntil,
        isPublic: true,
        tags: ['flood', 'rain', city.name.toLowerCase()],
        metadata: {
          source: 'api',
          externalId: `weather_${city.name}_${now.getTime()}`,
          confidence: 0.8,
          verified: true
        },
        statistics: { views: 0, shares: 0, acknowledgments: 0 }
      });
    }

    // Severe weather analysis
    if (weather.wind.speed > 15 || weather.main.temp > 35 || weather.main.temp < 5) {
      let severity = 'medium';
      let description = '';
      
      if (weather.wind.speed > 25) {
        severity = 'high';
        description = `Severe wind conditions (${weather.wind.speed} m/s) in ${city.name}. Secure loose objects and avoid outdoor activities.`;
      } else if (weather.main.temp > 40) {
        severity = 'high';
        description = `Extreme heat (${weather.main.temp}°C) in ${city.name}. Risk of heat-related illnesses. Stay hydrated and avoid outdoor activities.`;
      } else if (weather.main.temp < 0) {
        severity = 'high';
        description = `Extreme cold (${weather.main.temp}°C) in ${city.name}. Risk of hypothermia. Dress warmly and limit outdoor exposure.`;
      } else {
        description = `Severe weather conditions in ${city.name}. Monitor weather updates and take necessary precautions.`;
      }

      alerts.push({
        title: `Severe Weather Alert - ${city.name}`,
        description: description,
        type: 'severe_weather',
        severity: severity,
        status: 'active',
        location: {
          type: 'Point',
          coordinates: [city.lng, city.lat],
          address: city.name,
          city: city.name,
          state: this.getStateFromCity(city.name),
          country: 'India',
          radius: 30
        },
        weatherData: {
          temperature: weather.main.temp,
          humidity: weather.main.humidity,
          precipitation: weather.rain?.['1h'] || 0,
          windSpeed: weather.wind.speed,
          windDirection: weather.wind.deg,
          pressure: weather.main.pressure,
          visibility: weather.visibility / 1000,
          lastUpdated: now
        },
        safetyInstructions: [
          {
            title: 'Stay indoors',
            description: 'Remain inside during severe weather conditions',
            priority: 'high'
          },
          {
            title: 'Monitor updates',
            description: 'Stay tuned to weather updates and official advisories',
            priority: 'medium'
          }
        ],
        emergencyContacts: [
          { name: 'Weather Helpline', phone: '1800-180-1551', type: 'emergency' }
        ],
        validFrom: now,
        validUntil: validUntil,
        isPublic: true,
        tags: ['severe-weather', city.name.toLowerCase()],
        metadata: {
          source: 'api',
          externalId: `weather_${city.name}_${now.getTime()}`,
          confidence: 0.7,
          verified: true
        },
        statistics: { views: 0, shares: 0, acknowledgments: 0 }
      });
    }

    return alerts;
  }

  // Mock weather alerts for demo purposes
  getMockWeatherAlerts() {
    const now = new Date();
    const validUntil = new Date(now.getTime() + 6 * 60 * 60 * 1000); // 6 hours

    return [
      {
        title: 'Heavy Rainfall Alert - Mumbai',
        description: 'Heavy rainfall (45mm/h) detected in Mumbai. Risk of urban flooding in low-lying areas. Avoid flooded roads and move to higher ground if necessary.',
        type: 'flood',
        severity: 'high',
        status: 'active',
        location: {
          type: 'Point',
          coordinates: [72.8777, 19.0760],
          address: 'Mumbai',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          radius: 25
        },
        weatherData: {
          temperature: 26,
          humidity: 95,
          precipitation: 45,
          windSpeed: 18,
          windDirection: 180,
          pressure: 1008,
          visibility: 2,
          lastUpdated: now
        },
        safetyInstructions: [
          {
            title: 'Avoid flooded areas',
            description: 'Do not walk or drive through floodwaters',
            priority: 'high'
          },
          {
            title: 'Move to higher ground',
            description: 'If in a low-lying area, move to higher elevation',
            priority: 'high'
          }
        ],
        emergencyContacts: [
          { name: 'Mumbai Police', phone: '100', type: 'police' },
          { name: 'Municipal Helpline', phone: '1916', type: 'emergency' }
        ],
        validFrom: now,
        validUntil: validUntil,
        isPublic: true,
        tags: ['flood', 'rain', 'mumbai'],
        metadata: {
          source: 'mock',
          externalId: `mock_mumbai_${now.getTime()}`,
          confidence: 0.9,
          verified: true
        },
        statistics: { views: 0, shares: 0, acknowledgments: 0 }
      },
      {
        title: 'Cyclone Warning - Chennai',
        description: 'Cyclonic winds (35 m/s) approaching Chennai. Secure loose objects and avoid coastal areas. Follow evacuation orders if issued.',
        type: 'severe_weather',
        severity: 'critical',
        status: 'active',
        location: {
          type: 'Point',
          coordinates: [80.2707, 13.0827],
          address: 'Chennai',
          city: 'Chennai',
          state: 'Tamil Nadu',
          country: 'India',
          radius: 40
        },
        weatherData: {
          temperature: 28,
          humidity: 92,
          precipitation: 0,
          windSpeed: 35,
          windDirection: 210,
          pressure: 995,
          visibility: 5,
          lastUpdated: now
        },
        safetyInstructions: [
          {
            title: 'Stay indoors',
            description: 'Remain inside and away from windows during high winds',
            priority: 'high'
          },
          {
            title: 'Secure loose objects',
            description: 'Bring in outdoor furniture and secure loose items',
            priority: 'medium'
          }
        ],
        emergencyContacts: [
          { name: 'Cyclone Control Room', phone: '+91-44-28593900', type: 'emergency' }
        ],
        validFrom: now,
        validUntil: validUntil,
        isPublic: true,
        tags: ['severe-weather', 'cyclone', 'chennai'],
        metadata: {
          source: 'mock',
          externalId: `mock_chennai_${now.getTime()}`,
          confidence: 0.95,
          verified: true
        },
        statistics: { views: 0, shares: 0, acknowledgments: 0 }
      }
    ];
  }

  // Get state from city name
  getStateFromCity(cityName) {
    const cityStateMap = {
      'Mumbai': 'Maharashtra',
      'Delhi': 'Delhi',
      'Bangalore': 'Karnataka',
      'Chennai': 'Tamil Nadu',
      'Kolkata': 'West Bengal',
      'Hyderabad': 'Telangana',
      'Pune': 'Maharashtra',
      'Ahmedabad': 'Gujarat'
    };
    return cityStateMap[cityName] || 'Unknown';
  }

  // Process and store alerts
  async processAlerts(alerts) {
    const processedAlerts = [];
    
    for (const alertData of alerts) {
      try {
        // Check if similar alert already exists
        const existingAlert = await Alert.findOne({
          'metadata.externalId': alertData.metadata.externalId,
          status: 'active'
        });

        if (existingAlert) {
          // Update existing alert
          const updatedAlert = await Alert.findByIdAndUpdate(
            existingAlert._id,
            {
              ...alertData,
              updatedAt: new Date()
            },
            { new: true }
          );
          processedAlerts.push(updatedAlert);
        } else {
          // Create new alert
          const newAlert = await Alert.create(alertData);
          processedAlerts.push(newAlert);
          
          // Send notifications to affected users
          await this.notifyAffectedUsers(newAlert);
        }
      } catch (error) {
        console.error('Error processing alert:', error.message);
      }
    }

    return processedAlerts;
  }

  // Notify users affected by new alerts
  async notifyAffectedUsers(alert) {
    try {
      // Find users within the alert radius
      const affectedUsers = await User.find({
        isActive: true,
        location: {
          $geoWithin: {
            $centerSphere: [
              alert.location.coordinates,
              (alert.location.radius || 50) / 6371 // Convert km to radians
            ]
          }
        }
      });

      for (const user of affectedUsers) {
        // Create notification record
        const notification = new Notification({
          user: user._id,
          alert: alert._id,
          type: 'alert',
          title: alert.title,
          message: alert.description,
          priority: alert.severity === 'critical' ? 'urgent' : 'normal',
          status: 'pending'
        });

        // Send push notification if user has subscription
        if (user.subscription && user.preferences?.pushNotifications) {
          try {
            const payload = JSON.stringify({
              title: `🚨 ${alert.title}`,
              body: alert.description,
              icon: '/icon-192x192.png',
              badge: '/badge-72x72.png',
              data: {
                alertId: alert._id.toString(),
                url: `/alerts/${alert._id}`
              }
            });

            await webpush.sendNotification(user.subscription, payload);
            notification.markAsSent();
          } catch (error) {
            console.error('Push notification error:', error.message);
            notification.markAsFailed(error.message);
          }
        }

        await notification.save();
      }

      console.log(`Notified ${affectedUsers.length} users about alert: ${alert.title}`);
    } catch (error) {
      console.error('Error notifying users:', error.message);
    }
  }

  // Main fetch method
  async fetchAndProcessAlerts() {
    try {
      console.log('Starting alert fetch process...');
      this.lastFetchTime = new Date();

      // Fetch alerts from external sources
      const alerts = await this.fetchWeatherAlerts();
      
      // Process and store alerts
      const processedAlerts = await this.processAlerts(alerts);

      console.log(`Alert fetch completed. Processed ${processedAlerts.length} alerts.`);
      
      return {
        success: true,
        alertsProcessed: processedAlerts.length,
        timestamp: this.lastFetchTime
      };
    } catch (error) {
      console.error('Alert fetch process failed:', error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  // Get fetch status
  getStatus() {
    return {
      lastFetchTime: this.lastFetchTime,
      weatherApiConfigured: !!(this.weatherApiKey && this.weatherApiKey !== 'your_weather_api_key'),
      weatherApiUrl: this.weatherApiUrl
    };
  }
}

module.exports = AlertFetcher;
