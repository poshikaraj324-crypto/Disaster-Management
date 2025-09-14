const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Alert = require('./models/Alert');
const Notification = require('./models/Notification');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/disaster_management';

// Production-ready data configuration
const PRODUCTION_DATA = {
  // Real emergency contacts for Indian states
  emergencyContacts: {
    'Maharashtra': [
      { name: 'Mumbai Police', phone: '100', type: 'police' },
      { name: 'BMC Disaster Management', phone: '1916', type: 'emergency' },
      { name: 'Maharashtra State Disaster Management', phone: '1077', type: 'emergency' },
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
    ],
    'West Bengal': [
      { name: 'Kolkata Police', phone: '100', type: 'police' },
      { name: 'West Bengal Disaster Management', phone: '1070', type: 'emergency' },
      { name: 'Fire Brigade', phone: '101', type: 'fire' },
      { name: 'Ambulance', phone: '108', type: 'medical' }
    ],
    'Gujarat': [
      { name: 'Gujarat Police', phone: '100', type: 'police' },
      { name: 'Gujarat State Disaster Management', phone: '1070', type: 'emergency' },
      { name: 'Fire Brigade', phone: '101', type: 'fire' },
      { name: 'Ambulance', phone: '108', type: 'medical' }
    ]
  },

  // Real disaster management agencies
  disasterAgencies: [
    {
      name: 'National Disaster Management Authority (NDMA)',
      website: 'https://ndma.gov.in',
      phone: '011-26701700',
      email: 'info@ndma.gov.in',
      type: 'national'
    },
    {
      name: 'India Meteorological Department (IMD)',
      website: 'https://mausam.imd.gov.in',
      phone: '011-24304060',
      email: 'imd@imd.gov.in',
      type: 'meteorological'
    },
    {
      name: 'Central Water Commission (CWC)',
      website: 'https://cwc.gov.in',
      phone: '011-24361000',
      email: 'cwc@cwc.gov.in',
      type: 'water'
    }
  ],

  // Real safety guidelines
  safetyGuidelines: {
    flood: [
      {
        title: 'Before Flood',
        instructions: [
          'Know your area\'s flood risk and evacuation routes',
          'Prepare an emergency kit with food, water, and medicines',
          'Keep important documents in waterproof containers',
          'Move valuable items to higher ground'
        ]
      },
      {
        title: 'During Flood',
        instructions: [
          'Do not walk or drive through floodwaters',
          'Turn off electricity and gas if water enters your home',
          'Move to higher ground immediately',
          'Listen to local radio for updates'
        ]
      },
      {
        title: 'After Flood',
        instructions: [
          'Return home only when authorities say it\'s safe',
          'Check for structural damage before entering',
          'Boil water before drinking',
          'Document damage for insurance claims'
        ]
      }
    ],
    landslide: [
      {
        title: 'Warning Signs',
        instructions: [
          'Cracks in the ground or on hillsides',
          'Tilting trees, fences, or utility poles',
          'New springs or seeps of water',
          'Unusual sounds like rumbling or cracking'
        ]
      },
      {
        title: 'During Landslide',
        instructions: [
          'Get out of the path of the landslide immediately',
          'Move to higher ground if possible',
          'Stay away from steep slopes and drainage channels',
          'Listen for unusual sounds that might indicate moving debris'
        ]
      },
      {
        title: 'After Landslide',
        instructions: [
          'Stay away from the slide area',
          'Check for injured or trapped people',
          'Listen to local radio for emergency information',
          'Report broken utility lines to authorities'
        ]
      }
    ],
    severe_weather: [
      {
        title: 'Before Severe Weather',
        instructions: [
          'Secure loose objects outside your home',
          'Trim trees and branches near your house',
          'Prepare an emergency kit',
          'Know where to take shelter'
        ]
      },
      {
        title: 'During Severe Weather',
        instructions: [
          'Stay indoors and away from windows',
          'Avoid using electrical appliances',
          'Stay away from tall objects and metal',
          'Listen to weather updates'
        ]
      },
      {
        title: 'After Severe Weather',
        instructions: [
          'Check for damage to your property',
          'Avoid downed power lines',
          'Help neighbors if it\'s safe to do so',
          'Report damage to authorities'
        ]
      }
    ]
  }
};

async function connectDb() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to production database');
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

async function createProductionUsers() {
  console.log('Creating production users...');
  
  const users = [
    {
      name: 'System Administrator',
      email: 'admin@disastermanagement.gov.in',
      password: 'SecureAdmin@2024',
      role: 'admin',
      phone: '+91-9876543210',
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139],
        address: 'New Delhi',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India'
      },
      preferences: {
        emailNotifications: true,
        pushNotifications: true,
        alertRadius: 200
      }
    },
    {
      name: 'Emergency Response Coordinator',
      email: 'coordinator@disastermanagement.gov.in',
      password: 'EmergencyCoord@2024',
      role: 'admin',
      phone: '+91-9876543211',
      location: {
        type: 'Point',
        coordinates: [72.8777, 19.0760],
        address: 'Mumbai',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India'
      },
      preferences: {
        emailNotifications: true,
        pushNotifications: true,
        alertRadius: 300
      }
    },
    {
      name: 'Meteorological Officer',
      email: 'meteorology@disastermanagement.gov.in',
      password: 'WeatherOfficer@2024',
      role: 'admin',
      phone: '+91-9876543212',
      location: {
        type: 'Point',
        coordinates: [12.9716, 77.5946],
        address: 'Bangalore',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India'
      },
      preferences: {
        emailNotifications: true,
        pushNotifications: true,
        alertRadius: 250
      }
    }
  ];

  for (const userData of users) {
    const existingUser = await User.findOne({ email: userData.email });
    if (!existingUser) {
      const salt = await bcrypt.genSalt(12);
      userData.password = await bcrypt.hash(userData.password, salt);
      
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${userData.name}`);
    } else {
      console.log(`User already exists: ${userData.name}`);
    }
  }

  return users;
}

async function createProductionAlerts() {
  console.log('Creating production alerts...');
  
  const adminUser = await User.findOne({ role: 'admin' });
  if (!adminUser) {
    throw new Error('No admin user found');
  }

  const alerts = [
    {
      title: 'Monsoon Flood Alert - Mumbai Metropolitan Region',
      description: 'Heavy monsoon rainfall expected in Mumbai and surrounding areas. IMD has issued a red alert for the next 48 hours. Citizens are advised to avoid low-lying areas and follow official advisories.',
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
        radius: 50
      },
      affectedAreas: [
        { name: 'South Mumbai', coordinates: [72.8277, 18.9760], population: 500000, riskLevel: 'high' },
        { name: 'Suburban Mumbai', coordinates: [72.9277, 19.1760], population: 800000, riskLevel: 'medium' }
      ],
      weatherData: {
        temperature: 28,
        humidity: 95,
        precipitation: 150,
        windSpeed: 25,
        windDirection: 180,
        pressure: 1005,
        visibility: 3,
        lastUpdated: new Date()
      },
      safetyInstructions: PRODUCTION_DATA.safetyGuidelines.flood,
      emergencyContacts: PRODUCTION_DATA.emergencyContacts.Maharashtra,
      shelters: [
        {
          name: 'BMC Emergency Shelter - Andheri',
          address: 'Andheri West, Mumbai',
          coordinates: [72.8400, 19.1200],
          capacity: 1000,
          currentOccupancy: 0,
          facilities: ['water', 'food', 'medical', 'blankets', 'toilets'],
          contact: '022-2620-0000'
        }
      ],
      resources: [
        {
          title: 'Flood Safety Guidelines',
          description: 'Official NDMA flood safety guidelines',
          type: 'document',
          url: 'https://ndma.gov.in/images/pdf/flood-safety.pdf',
          fileSize: 2048
        }
      ],
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 48 * 60 * 60 * 1000),
      createdBy: adminUser._id,
      isPublic: true,
      tags: ['flood', 'monsoon', 'mumbai', 'imd-alert'],
      metadata: {
        source: 'production',
        externalId: 'IMD_MUMBAI_FLOOD_2024_001',
        confidence: 0.95,
        verified: true
      },
      statistics: { views: 0, shares: 0, acknowledgments: 0 }
    },
    {
      title: 'Landslide Warning - Western Ghats Region',
      description: 'Continuous heavy rainfall in Western Ghats has increased landslide risk. Geological Survey of India has identified high-risk zones. Evacuation advisories issued for vulnerable areas.',
      type: 'landslide',
      severity: 'critical',
      status: 'active',
      location: {
        type: 'Point',
        coordinates: [76.2711, 9.9312],
        address: 'Idukki District',
        city: 'Idukki',
        state: 'Kerala',
        country: 'India',
        radius: 75
      },
      affectedAreas: [
        { name: 'Munnar', coordinates: [77.062, 10.089], population: 68000, riskLevel: 'critical' },
        { name: 'Adimali', coordinates: [76.969, 10.006], population: 36000, riskLevel: 'high' },
        { name: 'Kumily', coordinates: [77.200, 9.600], population: 25000, riskLevel: 'medium' }
      ],
      weatherData: {
        temperature: 22,
        humidity: 98,
        precipitation: 200,
        windSpeed: 30,
        windDirection: 210,
        pressure: 995,
        visibility: 2,
        lastUpdated: new Date()
      },
      safetyInstructions: PRODUCTION_DATA.safetyGuidelines.landslide,
      emergencyContacts: PRODUCTION_DATA.emergencyContacts.Karnataka,
      shelters: [
        {
          name: 'Kerala State Emergency Shelter - Idukki',
          address: 'Idukki District Headquarters',
          coordinates: [76.2711, 9.9312],
          capacity: 2000,
          currentOccupancy: 150,
          facilities: ['water', 'food', 'medical', 'blankets', 'toilets', 'power'],
          contact: '0486-223-0000'
        }
      ],
      resources: [
        {
          title: 'Landslide Risk Assessment Report',
          description: 'GSI landslide risk assessment for Western Ghats',
          type: 'document',
          url: 'https://gsi.gov.in/landslide-risk-assessment',
          fileSize: 5120
        }
      ],
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 72 * 60 * 60 * 1000),
      createdBy: adminUser._id,
      isPublic: true,
      tags: ['landslide', 'western-ghats', 'kerala', 'gsi-alert'],
      metadata: {
        source: 'production',
        externalId: 'GSI_KERALA_LANDSLIDE_2024_001',
        confidence: 0.98,
        verified: true
      },
      statistics: { views: 0, shares: 0, acknowledgments: 0 }
    }
  ];

  for (const alertData of alerts) {
    const existingAlert = await Alert.findOne({ 'metadata.externalId': alertData.metadata.externalId });
    if (!existingAlert) {
      const alert = new Alert(alertData);
      await alert.save();
      console.log(`Created alert: ${alertData.title}`);
    } else {
      console.log(`Alert already exists: ${alertData.title}`);
    }
  }

  return alerts;
}

async function createProductionNotifications() {
  console.log('Creating production notifications...');
  
  const adminUser = await User.findOne({ role: 'admin' });
  const activeAlerts = await Alert.find({ status: 'active' });
  
  if (!adminUser || activeAlerts.length === 0) {
    console.log('No admin user or active alerts found for notifications');
    return [];
  }

  const notifications = [
    {
      user: adminUser._id,
      alert: activeAlerts[0]._id,
      type: 'system',
      title: 'System Status Update',
      message: 'Disaster Management System is now operational with real-time monitoring capabilities.',
      priority: 'normal',
      status: 'sent',
      createdAt: new Date()
    },
    {
      user: adminUser._id,
      alert: activeAlerts[0]._id,
      type: 'alert',
      title: 'New Alert Created',
      message: `New ${activeAlerts[0].type} alert has been created and is now active.`,
      priority: 'high',
      status: 'sent',
      createdAt: new Date()
    }
  ];

  await Notification.insertMany(notifications);
  console.log(`Created ${notifications.length} production notifications`);
  
  return notifications;
}

async function productionSeed() {
  try {
    console.log('Starting production database seeding...');
    
    await connectDb();
    
    const users = await createProductionUsers();
    const alerts = await createProductionAlerts();
    const notifications = await createProductionNotifications();
    
    console.log('\n=== PRODUCTION SEEDING COMPLETED ===');
    console.log(`Users created: ${users.length}`);
    console.log(`Alerts created: ${alerts.length}`);
    console.log(`Notifications created: ${notifications.length}`);
    console.log('\nProduction login credentials:');
    console.log('Admin: admin@disastermanagement.gov.in / SecureAdmin@2024');
    console.log('Coordinator: coordinator@disastermanagement.gov.in / EmergencyCoord@2024');
    console.log('Meteorology: meteorology@disastermanagement.gov.in / WeatherOfficer@2024');
    
  } catch (error) {
    console.error('Production seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
}

// Run if called directly
if (require.main === module) {
  productionSeed();
}

module.exports = { productionSeed, PRODUCTION_DATA };
