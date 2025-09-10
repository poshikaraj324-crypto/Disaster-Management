import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiPlus,
  FiAlertTriangle,
  FiUsers,
  FiBell,
  FiTrendingUp,
  FiEye,
  FiTrash2,
  FiDownload,
  FiUpload,
  FiRefreshCw
} from 'react-icons/fi';
import axios from '../../config/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalAlerts: 0,
    activeAlerts: 0,
    totalUsers: 0,
    recentAlerts: 0
  });
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertFetcherStatus, setAlertFetcherStatus] = useState(null);
  const [cronStatus, setCronStatus] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch alert statistics
      const alertStatsResponse = await axios.get('/api/alerts/stats/overview');
      if (alertStatsResponse.data.success) {
        const alertStats = alertStatsResponse.data.data.stats;
        setStats(prev => ({
          ...prev,
          totalAlerts: alertStats.totalAlerts[0]?.count || 0,
          activeAlerts: alertStats.activeAlerts[0]?.count || 0,
          recentAlerts: alertStats.recentAlerts[0]?.count || 0
        }));
      }

      // Fetch user statistics
      const userStatsResponse = await axios.get('/api/users/stats/overview');
      if (userStatsResponse.data.success) {
        const userStats = userStatsResponse.data.data.stats;
        setStats(prev => ({
          ...prev,
          totalUsers: userStats.totalUsers[0]?.count || 0
        }));
      }

      // Fetch recent alerts
      const alertsResponse = await axios.get('/api/alerts?limit=5&status=active');
      if (alertsResponse.data.success) {
        setAlerts(alertsResponse.data.data.alerts);
      }

      // Fetch alert management status
      const statusResponse = await axios.get('/api/alert-management/status');
      if (statusResponse.data.success) {
        setAlertFetcherStatus(statusResponse.data.data.alertFetcher);
        setCronStatus(statusResponse.data.data.cronService);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlert = async (alertId) => {
    if (window.confirm('Are you sure you want to delete this alert?')) {
      try {
        await axios.delete(`/api/alerts/${alertId}`);
        setAlerts(alerts.filter(alert => alert._id !== alertId));
        fetchDashboardData(); // Refresh stats
      } catch (error) {
        console.error('Error deleting alert:', error);
      }
    }
  };

  const handleManualFetch = async () => {
    try {
      setIsFetching(true);
      const response = await axios.post('/api/alert-management/fetch');
      if (response.data.success) {
        alert('Alerts fetched successfully!');
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
      alert('Error fetching alerts: ' + error.response?.data?.message || error.message);
    } finally {
      setIsFetching(false);
    }
  };

  const handleExportAlerts = async () => {
    try {
      const response = await axios.get('/api/alert-management/export/csv', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'alerts_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting alerts:', error);
      alert('Error exporting alerts: ' + error.response?.data?.message || error.message);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/alert-management/import/csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        alert(`Successfully imported ${response.data.data.imported} alerts!`);
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error importing alerts:', error);
      alert('Error importing alerts: ' + error.response?.data?.message || error.message);
    }
  };

  if (loading) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>Admin Dashboard - Disaster Management System</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage disaster alerts, users, and system settings.
              </p>
            </div>
            <Link
              to="/admin/alerts/create"
              className="btn btn-primary flex items-center space-x-2"
            >
              <FiPlus className="w-4 h-4" />
              <span>Create Alert</span>
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                <FiAlertTriangle className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Alerts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalAlerts}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-warning-100 dark:bg-warning-900/20 rounded-lg">
                <FiBell className="w-6 h-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Alerts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.activeAlerts}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-success-100 dark:bg-success-900/20 rounded-lg">
                <FiUsers className="w-6 h-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-danger-100 dark:bg-danger-900/20 rounded-lg">
                <FiTrendingUp className="w-6 h-6 text-danger-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Alerts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.recentAlerts}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Alerts */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Recent Alerts
                </h2>
                <Link
                  to="/admin/alerts"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-4">
                {alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <FiAlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No alerts found</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">
                            {alert.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {alert.description.substring(0, 100)}...
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              alert.severity === 'critical' ? 'severity-critical' :
                              alert.severity === 'high' ? 'severity-high' :
                              alert.severity === 'medium' ? 'severity-medium' :
                              'severity-low'
                            }`}>
                              {alert.severity.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(alert.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Link
                            to={`/alerts/${alert._id}`}
                            className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
                            title="View"
                          >
                            <FiEye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteAlert(alert._id)}
                            className="p-2 text-gray-500 hover:text-danger-600 transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  to="/admin/alerts/create"
                  className="w-full btn btn-primary flex items-center space-x-2"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Create Alert</span>
                </Link>
                <button
                  onClick={handleManualFetch}
                  disabled={isFetching}
                  className="w-full btn btn-secondary flex items-center space-x-2"
                >
                  <FiRefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                  <span>{isFetching ? 'Fetching...' : 'Fetch Alerts'}</span>
                </button>
                <button
                  onClick={handleExportAlerts}
                  className="w-full btn btn-secondary flex items-center space-x-2"
                >
                  <FiDownload className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
                <label className="w-full btn btn-secondary flex items-center space-x-2 cursor-pointer">
                  <FiUpload className="w-4 h-4" />
                  <span>Import CSV</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <Link
                  to="/admin/users"
                  className="w-full btn btn-secondary flex items-center space-x-2"
                >
                  <FiUsers className="w-4 h-4" />
                  <span>Manage Users</span>
                </Link>
                <Link
                  to="/admin/notifications"
                  className="w-full btn btn-secondary flex items-center space-x-2"
                >
                  <FiBell className="w-4 h-4" />
                  <span>Send Notification</span>
                </Link>
              </div>
            </div>

            {/* System Status */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                System Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">API Status</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200 rounded-full text-xs font-medium">
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Database</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200 rounded-full text-xs font-medium">
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Alert Fetcher</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    alertFetcherStatus?.weatherApiConfigured 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
                  }`}>
                    {alertFetcherStatus?.weatherApiConfigured ? 'Configured' : 'Mock Mode'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Cron Service</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    cronStatus?.isRunning 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                  }`}>
                    {cronStatus?.isRunning ? 'Running' : 'Stopped'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Last Fetch</span>
                  <span className="text-xs text-gray-500">
                    {alertFetcherStatus?.lastFetchTime 
                      ? new Date(alertFetcherStatus.lastFetchTime).toLocaleTimeString()
                      : 'Never'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="text-gray-900 dark:text-gray-100">New alert created</p>
                  <p className="text-gray-500 text-xs">2 hours ago</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-900 dark:text-gray-100">User registered</p>
                  <p className="text-gray-500 text-xs">4 hours ago</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-900 dark:text-gray-100">Alert updated</p>
                  <p className="text-gray-500 text-xs">6 hours ago</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
