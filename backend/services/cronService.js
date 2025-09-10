const cron = require('node-cron');
const AlertFetcher = require('./alertFetcher');

class CronService {
  constructor() {
    this.alertFetcher = new AlertFetcher();
    this.jobs = new Map();
    this.isRunning = false;
  }

  // Start all cron jobs
  start() {
    if (this.isRunning) {
      console.log('Cron service is already running');
      return;
    }

    console.log('Starting cron service...');

    // Alert fetching job - every hour
    const alertJob = cron.schedule('0 * * * *', async () => {
      console.log('Running scheduled alert fetch...');
      try {
        const result = await this.alertFetcher.fetchAndProcessAlerts();
        console.log('Scheduled alert fetch completed:', result);
      } catch (error) {
        console.error('Scheduled alert fetch failed:', error.message);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Kolkata'
    });

    // Cleanup expired alerts - every 6 hours
    const cleanupJob = cron.schedule('0 */6 * * *', async () => {
      console.log('Running scheduled cleanup...');
      try {
        await this.cleanupExpiredAlerts();
        console.log('Scheduled cleanup completed');
      } catch (error) {
        console.error('Scheduled cleanup failed:', error.message);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Kolkata'
    });

    // Store job references
    this.jobs.set('alertFetch', alertJob);
    this.jobs.set('cleanup', cleanupJob);

    // Start jobs
    alertJob.start();
    cleanupJob.start();

    this.isRunning = true;
    console.log('Cron service started successfully');
    console.log('Alert fetch job scheduled: every hour');
    console.log('Cleanup job scheduled: every 6 hours');
  }

  // Stop all cron jobs
  stop() {
    if (!this.isRunning) {
      console.log('Cron service is not running');
      return;
    }

    console.log('Stopping cron service...');

    for (const [name, job] of this.jobs) {
      job.stop();
      console.log(`Stopped job: ${name}`);
    }

    this.jobs.clear();
    this.isRunning = false;
    console.log('Cron service stopped');
  }

  // Get status of cron jobs
  getStatus() {
    const status = {
      isRunning: this.isRunning,
      jobs: {},
      alertFetcherStatus: this.alertFetcher.getStatus()
    };

    for (const [name, job] of this.jobs) {
      status.jobs[name] = {
        running: job.running,
        scheduled: job.scheduled
      };
    }

    return status;
  }

  // Manual alert fetch
  async manualAlertFetch() {
    console.log('Running manual alert fetch...');
    try {
      const result = await this.alertFetcher.fetchAndProcessAlerts();
      console.log('Manual alert fetch completed:', result);
      return result;
    } catch (error) {
      console.error('Manual alert fetch failed:', error.message);
      throw error;
    }
  }

  // Cleanup expired alerts
  async cleanupExpiredAlerts() {
    try {
      const now = new Date();
      
      // Find expired alerts
      const expiredAlerts = await require('../models/Alert').find({
        status: 'active',
        validUntil: { $lt: now }
      });

      if (expiredAlerts.length > 0) {
        // Update expired alerts
        await require('../models/Alert').updateMany(
          {
            status: 'active',
            validUntil: { $lt: now }
          },
          {
            status: 'expired',
            updatedAt: now
          }
        );

        console.log(`Marked ${expiredAlerts.length} alerts as expired`);
      }

      // Clean up old notifications (older than 30 days)
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const deletedNotifications = await require('../models/Notification').deleteMany({
        createdAt: { $lt: thirtyDaysAgo },
        status: { $in: ['read', 'failed'] }
      });

      if (deletedNotifications.deletedCount > 0) {
        console.log(`Deleted ${deletedNotifications.deletedCount} old notifications`);
      }

      return {
        expiredAlerts: expiredAlerts.length,
        deletedNotifications: deletedNotifications.deletedCount
      };
    } catch (error) {
      console.error('Cleanup failed:', error.message);
      throw error;
    }
  }

  // Restart a specific job
  restartJob(jobName) {
    const job = this.jobs.get(jobName);
    if (!job) {
      throw new Error(`Job ${jobName} not found`);
    }

    job.stop();
    job.start();
    console.log(`Restarted job: ${jobName}`);
  }

  // Add custom cron job
  addCustomJob(name, schedule, task, options = {}) {
    if (this.jobs.has(name)) {
      throw new Error(`Job ${name} already exists`);
    }

    const job = cron.schedule(schedule, task, {
      scheduled: false,
      timezone: 'Asia/Kolkata',
      ...options
    });

    this.jobs.set(name, job);
    job.start();
    console.log(`Added custom job: ${name} with schedule: ${schedule}`);
    
    return job;
  }

  // Remove custom cron job
  removeCustomJob(name) {
    const job = this.jobs.get(name);
    if (!job) {
      throw new Error(`Job ${name} not found`);
    }

    job.stop();
    this.jobs.delete(name);
    console.log(`Removed custom job: ${name}`);
  }
}

module.exports = CronService;
