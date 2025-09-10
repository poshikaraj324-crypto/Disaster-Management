// MongoDB initialization script
db = db.getSiblingDB('disaster_management');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email', 'password', 'role'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'Name must be a string and is required'
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
          description: 'Email must be a valid email address and is required'
        },
        password: {
          bsonType: 'string',
          minLength: 6,
          description: 'Password must be a string with at least 6 characters and is required'
        },
        role: {
          enum: ['user', 'admin'],
          description: 'Role must be either user or admin and is required'
        }
      }
    }
  }
});

db.createCollection('alerts', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'description', 'type', 'severity', 'location', 'validUntil', 'createdBy'],
      properties: {
        title: {
          bsonType: 'string',
          minLength: 5,
          maxLength: 200,
          description: 'Title must be a string between 5 and 200 characters and is required'
        },
        description: {
          bsonType: 'string',
          minLength: 10,
          maxLength: 1000,
          description: 'Description must be a string between 10 and 1000 characters and is required'
        },
        type: {
          enum: ['landslide', 'flood', 'severe_weather', 'evacuation', 'other'],
          description: 'Type must be one of the allowed values and is required'
        },
        severity: {
          enum: ['low', 'medium', 'high', 'critical'],
          description: 'Severity must be one of the allowed values and is required'
        },
        status: {
          enum: ['active', 'inactive', 'expired'],
          description: 'Status must be one of the allowed values'
        }
      }
    }
  }
});

db.createCollection('notifications');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ location: '2dsphere' });

db.alerts.createIndex({ location: '2dsphere' });
db.alerts.createIndex({ type: 1, severity: 1, status: 1 });
db.alerts.createIndex({ validFrom: 1, validUntil: 1 });
db.alerts.createIndex({ createdAt: -1 });

db.notifications.createIndex({ user: 1, status: 1 });
db.notifications.createIndex({ scheduledFor: 1, status: 1 });
db.notifications.createIndex({ createdAt: -1 });

// Create default admin user
const bcrypt = require('bcryptjs');
const saltRounds = 12;

const adminPassword = bcrypt.hashSync('admin123', saltRounds);

db.users.insertOne({
  name: 'System Administrator',
  email: 'admin@example.com',
  password: adminPassword,
  role: 'admin',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create default regular user
const userPassword = bcrypt.hashSync('user123', saltRounds);

db.users.insertOne({
  name: 'Test User',
  email: 'user@example.com',
  password: userPassword,
  role: 'user',
  isActive: true,
  location: {
    type: 'Point',
    coordinates: [77.2090, 28.6139], // Delhi coordinates
    address: 'New Delhi, India',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India'
  },
  preferences: {
    emailNotifications: true,
    pushNotifications: true,
    alertRadius: 50
  },
  createdAt: new Date(),
  updatedAt: new Date()
});

print('Database initialized successfully!');
print('Default users created:');
print('- Admin: admin@example.com / admin123');
print('- User: user@example.com / user123');
