const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Alert = require('./models/Alert');
const Notification = require('./models/Notification');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/disaster_management';

// Global data configuration
const GLOBAL_DATA = {
  // Major Indian cities with coordinates
  cities: [
    { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, population: 12478447 },
    { name: 'Delhi', state: 'Delhi', lat: 28.7041, lng: 77.1025, population: 11007835 },
    { name: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946, population: 8443675 },
    { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, population: 4646732 },
    { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, population: 4496694 },
    { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, population: 6809970 },
    { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, population: 3124458 },
    { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, population: 5570585 },
    { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, population: 3073350 },
    { name: 'Surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311, population: 4467797 }
  ],

  // Emergency contacts by state
  emergencyContacts: {
    'Maharashtra': [
      { name: 'Mumbai Police', phone: '100', type: 'police' },
      { name: 'BMC Disaster Management', phone: '1916', type: 'emergency' },
      { name: 'Fire Brigade', phone: '101', type: 'fire' },
      { name: 'Ambulance', phone: '108', type: 'medical' }
    ],
    'Delhi': [
      { name: 'Delhi Police', phone: '100', type: 'police' },
      { name: 'Delhi Disaster Management', phone: '1077', type: 'emergency' },
      { name: 'Fire Brigade', phone: '101', type: 'fire' },
      { name: 'Ambulance', phone: '108', type: 'medical' }
    ],
    'Karnataka': [
      { name: 'Bangalore Police', phone: '100', type: 'police' },
      { name: 'Karnataka State Disaster Management', phone: '1070', type: 'emergency' },
      { name: 'Fire Brigade', phone: '101', type: 'fire' },
      { name: 'Ambulance', phone: '108', type: 'medical' }
    ],
    'Tamil Nadu': [
      { name: 'Chennai Police', phone: '100', type: 'police' },
      { name: 'Tamil Nadu Disaster Management', phone: '1070', type: 'emergency' },
      { name: 'Fire Brigade', phone: '101', type: 'fire' },
      { name: 'Ambulance', phone: '108', type: 'medical' }
    ]
  },

  // Sample disaster scenarios
  disasterScenarios: [
    {
      type: 'flood',
      severity: 'high',
      title: 'Urban Flood Alert',
      description: 'Heavy rainfall causing urban flooding in low-lying areas. Avoid flooded roads and move to higher ground.',
      safetyInstructions: [
        { title: 'Avoid flooded areas', description: 'Do not walk or drive through floodwaters', priority: 'high' },
        { title: 'Move to higher ground', description: 'If in a low-lying area, move to higher elevation', priority: 'high' },
        { title: 'Turn off electricity', description: 'Switch off main power if water enters your home', priority: 'high' }
      ]
    },
    {
      type: 'landslide',
      severity: 'critical',
      title: 'Landslide Warning',
      description: 'Continuous heavy rainfall increasing landslide risk. Avoid steep slopes and follow evacuation orders.',
      safetyInstructions: [
        { title: 'Evacuate immediately', description: 'Leave the area immediately if near steep slopes', priority: 'high' },
        { title: 'Avoid travel', description: 'Do not drive near hill cuts or landslide-prone zones', priority: 'high' },
        { title: 'Stay alert', description: 'Listen for unusual sounds that might indicate moving debris', priority: 'medium' }
      ]
    },
    {
      type: 'severe_weather',
      severity: 'high',
      title: 'Severe Weather Alert',
      description: 'Severe weather conditions including high winds and heavy rain. Secure loose objects and stay indoors.',
      safetyInstructions: [
        { title: 'Stay indoors', description: 'Remain inside and away from windows during high winds', priority: 'high' },
        { title: 'Secure loose objects', description: 'Bring in outdoor furniture and secure loose items', priority: 'medium' },
        { title: 'Prepare emergency kit', description: 'Water, non-perishable food, torch, power bank, medicines', priority: 'medium' }
      ]
    }
  ]
};

async function connectDb() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

async function clearExistingData() {
  console.log('Clearing existing data...');
  await User.deleteMany({});
  await Alert.deleteMany({});
  await Notification.deleteMany({});
  console.log('Existing data cleared');
}

async function createUsers() {
  console.log('Creating users...');
  const users = [];

  // Create admin users
  const adminUsers = [
    {
      name: 'System Administrator',
      email: 'admin@disastermanagement.com',
      password: 'admin123',
      role: 'admin',
      phone: '+91-9876543210',
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139], // Delhi
        address: 'New Delhi',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India'
      },
      preferences: {
        emailNotifications: true,
        pushNotifications: true,
        alertRadius: 100
      }
    },
    {
      name: 'Emergency Coordinator',
      email: 'coordinator@disastermanagement.com',
      password: 'coordinator123',
      role: 'admin',
      phone: '+91-9876543211',
      location: {
        type: 'Point',
        coordinates: [72.8777, 19.0760], // Mumbai
        address: 'Mumbai',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India'
      },
      preferences: {
        emailNotifications: true,
        pushNotifications: true,
        alertRadius: 150
      }
    }
  ];

  // Create regular users for each major city
  for (const city of GLOBAL_DATA.cities) {
    const userCount = Math.floor(Math.random() * 5) + 1; // 1-5 users per city
    
    for (let i = 0; i < userCount; i++) {
      const user = {
        name: `User ${i + 1} - ${city.name}`,
        email: `user${i + 1}@${city.name.toLowerCase().replace(' ', '')}.com`,
        password: 'user123',
        role: 'user',
        phone: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        location: {
          type: 'Point',
          coordinates: [city.lng, city.lat],
          address: city.name,
          city: city.name,
          state: city.state,
          country: 'India'
        },
        preferences: {
          emailNotifications: Math.random() > 0.3,
          pushNotifications: Math.random() > 0.2,
          alertRadius: Math.floor(Math.random() * 50) + 25 // 25-75 km
        }
      };
      users.push(user);
    }
  }

  // Add admin users
  users.push(...adminUsers);

  // Hash passwords and create users
  for (const userData of users) {
    const salt = await bcrypt.genSalt(12);
    userData.password = await bcrypt.hash(userData.password, salt);
    
    const user = new User(userData);
    await user.save();
  }

  console.log(`Created ${users.length} users`);
  return users;
}

async function createAlerts(users) {
  console.log('Creating alerts...');
  const alerts = [];
  const now = new Date();
  const adminUser = users.find(u => u.role === 'admin');

  // Create alerts for each city
  for (const city of GLOBAL_DATA.cities) {
    const scenario = GLOBAL_DATA.disasterScenarios[Math.floor(Math.random() * GLOBAL_DATA.disasterScenarios.length)];
    const severityLevels = ['low', 'medium', 'high', 'critical'];
    const severity = severityLevels[Math.floor(Math.random() * severityLevels.length)];
    
    const alert = {
      title: `${scenario.title} - ${city.name}`,
      description: `${scenario.description} in ${city.name} and surrounding areas. ${city.name} has a population of ${city.population.toLocaleString()} people.`,
      type: scenario.type,
      severity: severity,
      status: 'active',
      location: {
        type: 'Point',
        coordinates: [city.lng, city.lat],
        address: city.name,
        city: city.name,
        state: city.state,
        country: 'India',
        radius: Math.floor(Math.random() * 30) + 20 // 20-50 km radius
      },
      affectedAreas: [
        {
          name: city.name,
          coordinates: [city.lng, city.lat],
          population: city.population,
          riskLevel: severity
        }
      ],
      weatherData: {
        temperature: Math.floor(Math.random() * 20) + 20, // 20-40°C
        humidity: Math.floor(Math.random() * 40) + 60, // 60-100%
        precipitation: Math.floor(Math.random() * 100) + 10, // 10-110mm
        windSpeed: Math.floor(Math.random() * 30) + 10, // 10-40 km/h
        windDirection: Math.floor(Math.random() * 360),
        pressure: Math.floor(Math.random() * 50) + 1000, // 1000-1050 hPa
        visibility: Math.floor(Math.random() * 10) + 5, // 5-15 km
        lastUpdated: now
      },
      safetyInstructions: scenario.safetyInstructions,
      emergencyContacts: GLOBAL_DATA.emergencyContacts[city.state] || GLOBAL_DATA.emergencyContacts['Maharashtra'],
      shelters: [
        {
          name: `${city.name} Emergency Shelter`,
          address: city.name,
          coordinates: [city.lng + (Math.random() - 0.5) * 0.01, city.lat + (Math.random() - 0.5) * 0.01],
          capacity: Math.floor(Math.random() * 500) + 100,
          currentOccupancy: Math.floor(Math.random() * 50),
          facilities: ['water', 'food', 'medical', 'blankets'],
          contact: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`
        }
      ],
      resources: [
        {
          title: `${scenario.type.charAt(0).toUpperCase() + scenario.type.slice(1)} Safety Guide`,
          description: `Comprehensive safety guide for ${scenario.type} situations`,
          type: 'document',
          url: 'https://ndma.gov.in',
          fileSize: Math.floor(Math.random() * 5000) + 1000
        }
      ],
      validFrom: now,
      validUntil: new Date(now.getTime() + (Math.floor(Math.random() * 48) + 12) * 60 * 60 * 1000), // 12-60 hours
      createdBy: adminUser._id,
      isPublic: true,
      tags: [scenario.type, city.name.toLowerCase(), city.state.toLowerCase()],
      metadata: {
        source: 'global-seed',
        externalId: `global_${city.name}_${Date.now()}`,
        confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
        verified: Math.random() > 0.2
      },
      statistics: {
        views: Math.floor(Math.random() * 100),
        shares: Math.floor(Math.random() * 20),
        acknowledgments: Math.floor(Math.random() * 50)
      }
    };

    alerts.push(alert);
  }

  // Create some additional historical alerts
  for (let i = 0; i < 10; i++) {
    const city = GLOBAL_DATA.cities[Math.floor(Math.random() * GLOBAL_DATA.cities.length)];
    const scenario = GLOBAL_DATA.disasterScenarios[Math.floor(Math.random() * GLOBAL_DATA.disasterScenarios.length)];
    const daysAgo = Math.floor(Math.random() * 30) + 1;
    const alertDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    const alert = {
      title: `Historical ${scenario.title} - ${city.name}`,
      description: `Past ${scenario.type} event in ${city.name} that occurred ${daysAgo} days ago.`,
      type: scenario.type,
      severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      status: 'expired',
      location: {
        type: 'Point',
        coordinates: [city.lng, city.lat],
        address: city.name,
        city: city.name,
        state: city.state,
        country: 'India',
        radius: 25
      },
      validFrom: alertDate,
      validUntil: new Date(alertDate.getTime() + 24 * 60 * 60 * 1000),
      createdBy: adminUser._id,
      isPublic: true,
      tags: [scenario.type, city.name.toLowerCase(), 'historical'],
      metadata: {
        source: 'global-seed',
        externalId: `historical_${city.name}_${alertDate.getTime()}`,
        confidence: 0.9,
        verified: true
      },
      statistics: {
        views: Math.floor(Math.random() * 200),
        shares: Math.floor(Math.random() * 30),
        acknowledgments: Math.floor(Math.random() * 80)
      }
    };

    alerts.push(alert);
  }

  await Alert.insertMany(alerts);
  console.log(`Created ${alerts.length} alerts`);
  return alerts;
}

async function createNotifications(users, alerts) {
  console.log('Creating notifications...');
  const notifications = [];

  // Create notifications for recent alerts
  const recentAlerts = alerts.filter(alert => alert.status === 'active');
  const regularUsers = users.filter(u => u.role === 'user');

  for (const alert of recentAlerts.slice(0, 5)) { // Create notifications for first 5 active alerts
    const affectedUsers = regularUsers.filter(user => {
      if (!user.location || !user.location.coordinates) return false;
      
      // Simple distance calculation (in a real app, use proper geospatial queries)
      const distance = Math.sqrt(
        Math.pow(user.location.coordinates[0] - alert.location.coordinates[0], 2) +
        Math.pow(user.location.coordinates[1] - alert.location.coordinates[1], 2)
      );
      
      return distance < 0.5; // Roughly 50km radius
    });

    for (const user of affectedUsers.slice(0, 3)) { // Limit to 3 users per alert
      const notification = new Notification({
        user: user._id,
        alert: alert._id,
        type: 'alert',
        title: alert.title,
        message: alert.description,
        priority: alert.severity === 'critical' ? 'urgent' : 'normal',
        status: Math.random() > 0.2 ? 'sent' : 'pending',
        createdAt: new Date(alert.createdAt.getTime() + Math.random() * 3600000) // Within 1 hour of alert
      });

      notifications.push(notification);
    }
  }

  await Notification.insertMany(notifications);
  console.log(`Created ${notifications.length} notifications`);
  return notifications;
}

async function createIndexes() {
  console.log('Creating database indexes...');
  
  // User indexes
  await User.collection.createIndex({ email: 1 }, { unique: true });
  await User.collection.createIndex({ location: '2dsphere' });
  await User.collection.createIndex({ role: 1, isActive: 1 });
  
  // Alert indexes
  await Alert.collection.createIndex({ location: '2dsphere' });
  await Alert.collection.createIndex({ type: 1, severity: 1, status: 1 });
  await Alert.collection.createIndex({ validFrom: 1, validUntil: 1 });
  await Alert.collection.createIndex({ createdAt: -1 });
  await Alert.collection.createIndex({ 'metadata.source': 1 });
  
  // Notification indexes
  await Notification.collection.createIndex({ user: 1, status: 1 });
  await Notification.collection.createIndex({ createdAt: -1 });
  await Notification.collection.createIndex({ priority: 1, status: 1 });
  
  console.log('Database indexes created');
}

async function globalSeed() {
  try {
    console.log('Starting global database seeding...');
    
    await connectDb();
    await clearExistingData();
    await createIndexes();
    
    const users = await createUsers();
    const alerts = await createAlerts(users);
    const notifications = await createNotifications(users, alerts);
    
    console.log('\n=== GLOBAL SEEDING COMPLETED ===');
    console.log(`Users created: ${users.length}`);
    console.log(`Alerts created: ${alerts.length}`);
    console.log(`Notifications created: ${notifications.length}`);
    console.log('\nDefault login credentials:');
    console.log('Admin: admin@disastermanagement.com / admin123');
    console.log('Coordinator: coordinator@disastermanagement.com / coordinator123');
    console.log('Regular users: user1@[city].com / user123');
    
  } catch (error) {
    console.error('Global seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
}

// Run if called directly
if (require.main === module) {
  globalSeed();
}

module.exports = { globalSeed, GLOBAL_DATA };
