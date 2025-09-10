import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  FiBell,
  FiSend,
  FiUsers,
  FiAlertTriangle,
  FiMail,
  FiMessageSquare,
  FiCalendar,
  FiCheck,
  FiX,
  FiEye,
  FiTrash2
} from 'react-icons/fi';
import axios from '../../config/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSendForm, setShowSendForm] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'general',
    priority: 'normal',
    targetUsers: 'all'
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/notifications?limit=50');
      if (response.data.success) {
        setNotifications(response.data.data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    try {
      setSending(true);
      const response = await axios.post('/api/notifications/emergency', newNotification);
      if (response.data.success) {
        alert('Notification sent successfully!');
        setNewNotification({
          title: '',
          message: '',
          type: 'general',
          priority: 'normal',
          targetUsers: 'all'
        });
        setShowSendForm(false);
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Error sending notification: ' + (error.response?.data?.message || error.message));
    } finally {
      setSending(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await axios.delete(`/api/notifications/${notificationId}`);
        setNotifications(notifications.filter(notif => notif._id !== notificationId));
      } catch (error) {
        console.error('Error deleting notification:', error);
        alert('Error deleting notification: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'alert':
        return <FiAlertTriangle className="w-4 h-4" />;
      case 'email':
        return <FiMail className="w-4 h-4" />;
      case 'push':
        return <FiBell className="w-4 h-4" />;
      default:
        return <FiMessageSquare className="w-4 h-4" />;
    }
  };

  if (loading) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>Notification Management - Admin Dashboard</title>
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
                Notification Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Send emergency notifications and manage notification history.
              </p>
            </div>
            <button
              onClick={() => setShowSendForm(!showSendForm)}
              className="btn btn-primary flex items-center space-x-2"
            >
              <FiSend className="w-4 h-4" />
              <span>Send Notification</span>
            </button>
          </div>
        </motion.div>

        {/* Send Notification Form */}
        {showSendForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="card p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Send Emergency Notification
            </h3>
            <form onSubmit={handleSendNotification} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Enter notification title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    value={newNotification.type}
                    onChange={(e) => setNewNotification({...newNotification, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="general">General</option>
                    <option value="alert">Alert</option>
                    <option value="emergency">Emergency</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter notification message"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={newNotification.priority}
                    onChange={(e) => setNewNotification({...newNotification, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Users
                  </label>
                  <select
                    value={newNotification.targetUsers}
                    onChange={(e) => setNewNotification({...newNotification, targetUsers: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="all">All Users</option>
                    <option value="active">Active Users Only</option>
                    <option value="admin">Admin Users Only</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  type="submit"
                  disabled={sending}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <FiSend className="w-4 h-4" />
                  <span>{sending ? 'Sending...' : 'Send Notification'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSendForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Notifications List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="card overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recent Notifications
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <FiBell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No notifications found</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div key={notification._id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="text-primary-600">
                          {getTypeIcon(notification.type)}
                        </div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {notification.title}
                        </h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(notification.priority)}`}>
                          {notification.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <FiCalendar className="w-3 h-3 mr-1" />
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                        <span className="flex items-center">
                          <FiUsers className="w-3 h-3 mr-1" />
                          {notification.targetUsers || 'All Users'}
                        </span>
                        <span className={`flex items-center ${notification.status === 'sent' ? 'text-green-600' : 'text-yellow-600'}`}>
                          <FiCheck className="w-3 h-3 mr-1" />
                          {notification.status || 'Pending'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleDeleteNotification(notification._id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete Notification"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotificationManagement;
