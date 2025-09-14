const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const User = require('./models/User');
const Alert = require('./models/Alert');
const Notification = require('./models/Notification');

dotenv.config();

class DataSync {
  constructor(sourceUri, targetUri) {
    this.sourceUri = sourceUri;
    this.targetUri = targetUri;
  }

  async connectToSource() {
    try {
      await mongoose.connect(this.sourceUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('Connected to source database');
    } catch (error) {
      console.error('Source database connection error:', error);
      throw error;
    }
  }

  async connectToTarget() {
    try {
      await mongoose.connect(this.targetUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('Connected to target database');
    } catch (error) {
      console.error('Target database connection error:', error);
      throw error;
    }
  }

  async exportData() {
    console.log('Exporting data from source database...');
    
    const data = {
      users: await User.find({}).lean(),
      alerts: await Alert.find({}).lean(),
      notifications: await Notification.find({}).lean(),
      exportDate: new Date(),
      version: '1.0.0'
    };

    const exportPath = path.join(__dirname, 'exports', `data-export-${Date.now()}.json`);
    
    // Ensure exports directory exists
    const exportsDir = path.dirname(exportPath);
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    fs.writeFileSync(exportPath, JSON.stringify(data, null, 2));
    console.log(`Data exported to: ${exportPath}`);
    
    return exportPath;
  }

  async importData(exportPath) {
    console.log(`Importing data from: ${exportPath}`);
    
    const data = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
    
    // Clear existing data
    await User.deleteMany({});
    await Alert.deleteMany({});
    await Notification.deleteMany({});
    
    // Import data
    if (data.users && data.users.length > 0) {
      await User.insertMany(data.users);
      console.log(`Imported ${data.users.length} users`);
    }
    
    if (data.alerts && data.alerts.length > 0) {
      await Alert.insertMany(data.alerts);
      console.log(`Imported ${data.alerts.length} alerts`);
    }
    
    if (data.notifications && data.notifications.length > 0) {
      await Notification.insertMany(data.notifications);
      console.log(`Imported ${data.notifications.length} notifications`);
    }
    
    console.log('Data import completed');
  }

  async syncToTarget() {
    try {
      // Export from source
      await this.connectToSource();
      const exportPath = await this.exportData();
      await mongoose.disconnect();
      
      // Import to target
      await this.connectToTarget();
      await this.importData(exportPath);
      await mongoose.disconnect();
      
      console.log('Data synchronization completed successfully');
    } catch (error) {
      console.error('Data synchronization failed:', error);
      throw error;
    }
  }

  async createBackup() {
    try {
      await this.connectToSource();
      const exportPath = await this.exportData();
      await mongoose.disconnect();
      
      console.log(`Backup created: ${exportPath}`);
      return exportPath;
    } catch (error) {
      console.error('Backup creation failed:', error);
      throw error;
    }
  }

  async restoreFromBackup(backupPath) {
    try {
      await this.connectToTarget();
      await this.importData(backupPath);
      await mongoose.disconnect();
      
      console.log('Data restored from backup successfully');
    } catch (error) {
      console.error('Data restoration failed:', error);
      throw error;
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const sourceUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/disaster_management';
  const targetUri = process.env.TARGET_MONGODB_URI || 'mongodb://localhost:27017/disaster_management_target';
  
  const sync = new DataSync(sourceUri, targetUri);
  
  switch (command) {
    case 'export':
      await sync.connectToSource();
      await sync.exportData();
      await mongoose.disconnect();
      break;
      
    case 'import':
      const importPath = args[1];
      if (!importPath) {
        console.error('Please provide path to import file');
        process.exit(1);
      }
      await sync.connectToTarget();
      await sync.importData(importPath);
      await mongoose.disconnect();
      break;
      
    case 'sync':
      await sync.syncToTarget();
      break;
      
    case 'backup':
      await sync.createBackup();
      break;
      
    case 'restore':
      const backupPath = args[1];
      if (!backupPath) {
        console.error('Please provide path to backup file');
        process.exit(1);
      }
      await sync.restoreFromBackup(backupPath);
      break;
      
    default:
      console.log('Usage: node data-sync.js <command> [options]');
      console.log('Commands:');
      console.log('  export                    - Export data from source database');
      console.log('  import <path>             - Import data to target database');
      console.log('  sync                      - Sync data from source to target');
      console.log('  backup                    - Create backup of source database');
      console.log('  restore <path>            - Restore data from backup');
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DataSync;
