#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🌍 Global Disaster Management Database Setup');
console.log('============================================\n');

// Configuration
const config = {
  database: {
    name: 'disaster_management_global',
    host: 'localhost',
    port: 27017
  },
  environments: {
    development: 'mongodb://localhost:27017/disaster_management_dev',
    staging: 'mongodb://localhost:27017/disaster_management_staging',
    production: 'mongodb://localhost:27017/disaster_management_prod'
  }
};

// Create necessary directories
function createDirectories() {
  console.log('📁 Creating necessary directories...');
  
  const dirs = [
    'backend/exports',
    'backend/backups',
    'backend/logs',
    'data/samples',
    'data/templates'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`   ✓ Created: ${dir}`);
    } else {
      console.log(`   ✓ Exists: ${dir}`);
    }
  });
}

// Create environment-specific configuration files
function createEnvironmentConfigs() {
  console.log('\n⚙️  Creating environment configurations...');
  
  const environments = ['development', 'staging', 'production'];
  
  environments.forEach(env => {
    const envFile = `backend/.env.${env}`;
    const envContent = `# ${env.toUpperCase()} Environment Configuration
NODE_ENV=${env}
PORT=5000
MONGODB_URI=${config.environments[env]}

# JWT Configuration
JWT_SECRET=${env}_super_secret_jwt_key_${Date.now()}
JWT_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Web Push Configuration
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=mailto:your_email@gmail.com

# Weather API Configuration
WEATHER_API_KEY=your_weather_api_key
WEATHER_API_URL=https://api.openweathermap.org/data/2.5

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Database Sync Configuration
TARGET_MONGODB_URI=${config.environments[env]}_target
`;

    fs.writeFileSync(envFile, envContent);
    console.log(`   ✓ Created: ${envFile}`);
  });
}

// Create sample data files
function createSampleData() {
  console.log('\n📊 Creating sample data files...');
  
  // Sample CSV for alerts
  const sampleCSV = `title,description,type,severity,latitude,longitude,address,city,state,country,radius,tags
"Monsoon Flood Alert - Mumbai","Heavy rainfall causing urban flooding","flood","high",19.0760,72.8777,"Mumbai","Mumbai","Maharashtra","India",25,"flood,mumbai,monsoon"
"Landslide Warning - Kerala","Continuous heavy rainfall increasing landslide risk","landslide","critical",9.9312,76.2711,"Idukki District","Idukki","Kerala","India",30,"landslide,kerala,rainfall"
"Cyclone Alert - Chennai","Severe cyclonic storm approaching coastal areas","severe_weather","high",13.0827,80.2707,"Chennai","Chennai","Tamil Nadu","India",40,"cyclone,chennai,severe-weather"
"Earthquake Alert - Delhi","Seismic activity detected in NCR region","other","medium",28.7041,77.1025,"New Delhi","New Delhi","Delhi","India",50,"earthquake,delhi,seismic"
"Heat Wave Warning - Rajasthan","Extreme temperature conditions expected","severe_weather","medium",26.9124,75.7873,"Jaipur","Jaipur","Rajasthan","India",35,"heat-wave,rajasthan,temperature"`;

  fs.writeFileSync('data/samples/sample-alerts.csv', sampleCSV);
  console.log('   ✓ Created: data/samples/sample-alerts.csv');
  
  // Sample JSON for users
  const sampleUsers = [
    {
      name: "Emergency Response Team",
      email: "emergency@disastermanagement.gov.in",
      role: "admin",
      location: {
        type: "Point",
        coordinates: [77.2090, 28.6139],
        city: "New Delhi",
        state: "Delhi",
        country: "India"
      }
    },
    {
      name: "Meteorological Officer",
      email: "meteorology@disastermanagement.gov.in",
      role: "admin",
      location: {
        type: "Point",
        coordinates: [72.8777, 19.0760],
        city: "Mumbai",
        state: "Maharashtra",
        country: "India"
      }
    }
  ];
  
  fs.writeFileSync('data/samples/sample-users.json', JSON.stringify(sampleUsers, null, 2));
  console.log('   ✓ Created: data/samples/sample-users.json');
}

// Create database management scripts
function createManagementScripts() {
  console.log('\n🔧 Creating database management scripts...');
  
  // Global seed script
  const globalSeedScript = `#!/bin/bash
# Global Database Seeding Script

echo "🌍 Starting Global Database Seeding..."

# Set environment
export NODE_ENV=${process.argv[2] || 'development'}

# Run global seed
cd backend
node global-seed.js

echo "✅ Global seeding completed!"
`;

  fs.writeFileSync('scripts/global-seed.sh', globalSeedScript);
  fs.chmodSync('scripts/global-seed.sh', '755');
  console.log('   ✓ Created: scripts/global-seed.sh');
  
  // Production seed script
  const productionSeedScript = `#!/bin/bash
# Production Database Seeding Script

echo "🏭 Starting Production Database Seeding..."

# Set production environment
export NODE_ENV=production

# Run production seed
cd backend
node production-seed.js

echo "✅ Production seeding completed!"
`;

  fs.writeFileSync('scripts/production-seed.sh', productionSeedScript);
  fs.chmodSync('scripts/production-seed.sh', '755');
  console.log('   ✓ Created: scripts/production-seed.sh');
  
  // Data sync script
  const dataSyncScript = `#!/bin/bash
# Data Synchronization Script

echo "🔄 Starting Data Synchronization..."

# Set environment
export NODE_ENV=${process.argv[2] || 'development'}

# Run data sync
cd backend
node data-sync.js $1

echo "✅ Data synchronization completed!"
`;

  fs.writeFileSync('scripts/data-sync.sh', dataSyncScript);
  fs.chmodSync('scripts/data-sync.sh', '755');
  console.log('   ✓ Created: scripts/data-sync.sh');
}

// Create Docker Compose for multiple environments
function createDockerCompose() {
  console.log('\n🐳 Creating Docker Compose configurations...');
  
  const dockerComposeGlobal = `version: '3.8'

services:
  # Global MongoDB Database
  mongodb-global:
    image: mongo:7.0
    container_name: disaster-mgmt-global-db
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: global_password_2024
      MONGO_INITDB_DATABASE: disaster_management_global
    ports:
      - "27017:27017"
    volumes:
      - mongodb_global_data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    networks:
      - disaster-global-network

  # Development Database
  mongodb-dev:
    image: mongo:7.0
    container_name: disaster-mgmt-dev-db
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: dev_password_2024
      MONGO_INITDB_DATABASE: disaster_management_dev
    ports:
      - "27018:27017"
    volumes:
      - mongodb_dev_data:/data/db
    networks:
      - disaster-global-network

  # Staging Database
  mongodb-staging:
    image: mongo:7.0
    container_name: disaster-mgmt-staging-db
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: staging_password_2024
      MONGO_INITDB_DATABASE: disaster_management_staging
    ports:
      - "27019:27017"
    volumes:
      - mongodb_staging_data:/data/db
    networks:
      - disaster-global-network

  # Production Database
  mongodb-prod:
    image: mongo:7.0
    container_name: disaster-mgmt-prod-db
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: prod_password_2024
      MONGO_INITDB_DATABASE: disaster_management_prod
    ports:
      - "27020:27017"
    volumes:
      - mongodb_prod_data:/data/db
    networks:
      - disaster-global-network

  # Data Sync Service
  data-sync:
    build:
      context: ./backend
      dockerfile: Dockerfile.sync
    container_name: disaster-mgmt-sync
    restart: unless-stopped
    environment:
      SOURCE_MONGODB_URI: mongodb://admin:global_password_2024@mongodb-global:27017/disaster_management_global?authSource=admin
      TARGET_MONGODB_URI: mongodb://admin:dev_password_2024@mongodb-dev:27017/disaster_management_dev?authSource=admin
    depends_on:
      - mongodb-global
      - mongodb-dev
    networks:
      - disaster-global-network
    command: ["node", "data-sync.js", "sync"]

volumes:
  mongodb_global_data:
    driver: local
  mongodb_dev_data:
    driver: local
  mongodb_staging_data:
    driver: local
  mongodb_prod_data:
    driver: local

networks:
  disaster-global-network:
    driver: bridge
`;

  fs.writeFileSync('docker-compose.global.yml', dockerComposeGlobal);
  console.log('   ✓ Created: docker-compose.global.yml');
}

// Create README for global setup
function createGlobalREADME() {
  console.log('\n📚 Creating global setup documentation...');
  
  const globalREADME = `# Global Disaster Management Database Setup

This setup provides a comprehensive global database solution for the Disaster Management System with consistent data across multiple environments.

## 🌍 Features

- **Multi-Environment Support**: Development, Staging, and Production databases
- **Data Synchronization**: Automated data sync between environments
- **Comprehensive Seeding**: Real-world data for testing and development
- **Backup & Restore**: Automated backup and restore capabilities
- **Production Ready**: Real emergency contacts and safety guidelines

## 🚀 Quick Start

### 1. Setup Global Database
\`\`\`bash
# Run the global setup script
node setup-global-database.js

# Start global database services
docker-compose -f docker-compose.global.yml up -d
\`\`\`

### 2. Seed Development Database
\`\`\`bash
# Seed with comprehensive test data
cd backend
node global-seed.js

# Or use the script
./scripts/global-seed.sh development
\`\`\`

### 3. Seed Production Database
\`\`\`bash
# Seed with production-ready data
cd backend
node production-seed.js

# Or use the script
./scripts/production-seed.sh
\`\`\`

## 📊 Database Structure

### Development Database
- **Purpose**: Development and testing
- **Data**: Comprehensive test data with multiple users and alerts
- **Port**: 27018
- **URI**: mongodb://localhost:27018/disaster_management_dev

### Staging Database
- **Purpose**: Pre-production testing
- **Data**: Production-like data for testing
- **Port**: 27019
- **URI**: mongodb://localhost:27019/disaster_management_staging

### Production Database
- **Purpose**: Live production environment
- **Data**: Real emergency contacts and safety guidelines
- **Port**: 27020
- **URI**: mongodb://localhost:27020/disaster_management_prod

## 🔄 Data Synchronization

### Sync from Global to Development
\`\`\`bash
cd backend
node data-sync.js sync
\`\`\`

### Create Backup
\`\`\`bash
cd backend
node data-sync.js backup
\`\`\`

### Restore from Backup
\`\`\`bash
cd backend
node data-sync.js restore /path/to/backup.json
\`\`\`

## 📁 Sample Data

### CSV Import Template
Use \`data/samples/sample-alerts.csv\` for testing CSV import functionality.

### JSON Data
Use \`data/samples/sample-users.json\` for testing user management.

## 🔐 Default Credentials

### Development
- **Admin**: admin@disastermanagement.com / admin123
- **Coordinator**: coordinator@disastermanagement.com / coordinator123

### Production
- **Admin**: admin@disastermanagement.gov.in / SecureAdmin@2024
- **Coordinator**: coordinator@disastermanagement.gov.in / EmergencyCoord@2024
- **Meteorology**: meteorology@disastermanagement.gov.in / WeatherOfficer@2024

## 🛠️ Management Commands

### Global Seeding
\`\`\`bash
# Development
./scripts/global-seed.sh development

# Staging
./scripts/global-seed.sh staging

# Production
./scripts/production-seed.sh
\`\`\`

### Data Synchronization
\`\`\`bash
# Export data
./scripts/data-sync.sh export

# Import data
./scripts/data-sync.sh import /path/to/data.json

# Sync between environments
./scripts/data-sync.sh sync
\`\`\`

## 📈 Monitoring

### Database Health
\`\`\`bash
# Check MongoDB status
docker-compose -f docker-compose.global.yml ps

# View logs
docker-compose -f docker-compose.global.yml logs mongodb-global
\`\`\`

### Data Statistics
\`\`\`bash
# Connect to database
mongo mongodb://localhost:27017/disaster_management_global

# Check collections
db.users.count()
db.alerts.count()
db.notifications.count()
\`\`\`

## 🔧 Configuration

### Environment Variables
Each environment has its own configuration file:
- \`backend/.env.development\`
- \`backend/.env.staging\`
- \`backend/.env.production\`

### Database URLs
- **Global**: mongodb://localhost:27017/disaster_management_global
- **Development**: mongodb://localhost:27018/disaster_management_dev
- **Staging**: mongodb://localhost:27019/disaster_management_staging
- **Production**: mongodb://localhost:27020/disaster_management_prod

## 🚨 Emergency Contacts

The production database includes real emergency contacts for major Indian states:
- Maharashtra, Delhi, Karnataka, Tamil Nadu, West Bengal, Gujarat

## 📚 Safety Guidelines

Comprehensive safety guidelines for:
- Floods
- Landslides
- Severe Weather
- Earthquakes

## 🤝 Contributing

1. Use development database for testing
2. Sync changes to staging before production
3. Always backup before major changes
4. Follow the established data structure

## 📞 Support

For issues with global database setup:
1. Check Docker containers are running
2. Verify MongoDB connections
3. Check environment variables
4. Review logs for errors
`;

  fs.writeFileSync('GLOBAL_DATABASE_SETUP.md', globalREADME);
  console.log('   ✓ Created: GLOBAL_DATABASE_SETUP.md');
}

// Main setup function
async function main() {
  try {
    console.log('Starting global database setup...\n');
    
    createDirectories();
    createEnvironmentConfigs();
    createSampleData();
    createManagementScripts();
    createDockerCompose();
    createGlobalREADME();
    
    console.log('\n🎉 Global Database Setup Completed!');
    console.log('\nNext steps:');
    console.log('1. Run: docker-compose -f docker-compose.global.yml up -d');
    console.log('2. Run: cd backend && node global-seed.js');
    console.log('3. Check: GLOBAL_DATABASE_SETUP.md for detailed instructions');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, config };
