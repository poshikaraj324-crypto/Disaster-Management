import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  FiShield,
  FiAlertTriangle,
  FiMap,
  FiUsers,
  FiBell,
  FiTrendingUp,
  FiCheckCircle,
  FiArrowRight,
  FiPlay
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import axios from '../config/axios';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    totalAlerts: 0,
    activeAlerts: 0,
    usersProtected: 0,
    responseTime: '2.5 min'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/alerts/stats/overview');
        if (response.data.success) {
          const data = response.data.data.stats;
          setStats({
            totalAlerts: data.totalAlerts[0]?.count || 0,
            activeAlerts: data.activeAlerts[0]?.count || 0,
            usersProtected: 1250, // Mock data
            responseTime: '2.5 min'
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const features = [
    {
      icon: <FiAlertTriangle className="w-8 h-8" />,
      title: 'Real-time Alerts',
      description: 'Get instant notifications about landslides, floods, and severe weather conditions in your area.'
    },
    {
      icon: <FiMap className="w-8 h-8" />,
      title: 'Interactive Maps',
      description: 'View disaster zones, evacuation routes, and emergency shelters on detailed interactive maps.'
    },
    {
      icon: <FiUsers className="w-8 h-8" />,
      title: 'Community Safety',
      description: 'Connect with your community and emergency services for coordinated disaster response.'
    },
    {
      icon: <FiBell className="w-8 h-8" />,
      title: 'Smart Notifications',
      description: 'Receive personalized alerts based on your location and preferences via multiple channels.'
    }
  ];

  const benefits = [
    '24/7 monitoring of weather conditions',
    'Early warning system for natural disasters',
    'Emergency contact information',
    'Evacuation route planning',
    'Community safety coordination',
    'Real-time disaster tracking'
  ];

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Disaster Management System - Stay Safe, Stay Informed</title>
        <meta name="description" content="Comprehensive disaster management and alert system for landslides and floods. Get real-time alerts, emergency information, and community safety tools." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-shadow-lg">
              Stay Safe, Stay Informed
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Advanced disaster management system providing real-time alerts for landslides, floods, and severe weather conditions to keep your community safe.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg">
                    Get Started
                  </Link>
                  <Link to="/login" className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 text-lg">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                {stats.totalAlerts}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Total Alerts</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-warning-600 mb-2">
                {stats.activeAlerts}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Active Alerts</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-success-600 mb-2">
                {stats.usersProtected}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Users Protected</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-danger-600 mb-2">
                {stats.responseTime}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Avg Response Time</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Comprehensive Disaster Management
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our advanced system provides everything you need to stay safe during natural disasters and emergency situations.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card p-6 text-center hover:shadow-lg transition-shadow duration-300"
              >
                <div className="text-primary-600 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Why Choose Our System?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Our disaster management system is designed with cutting-edge technology to provide the most reliable and comprehensive protection for your community.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <FiCheckCircle className="w-5 h-5 text-success-600 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-8 text-white">
                <div className="text-center">
                  <FiShield className="w-16 h-16 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
                  <p className="text-primary-100 mb-6">
                    Join thousands of users who trust our system to keep them safe during emergencies.
                  </p>
                  {!isAuthenticated && (
                    <Link
                      to="/register"
                      className="btn bg-white text-primary-600 hover:bg-gray-100 inline-flex items-center space-x-2"
                    >
                      <span>Sign Up Now</span>
                      <FiArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Don't Wait for Disaster to Strike
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Be prepared and stay informed. Our system provides the tools and information you need to protect yourself and your loved ones.
            </p>
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg"
                >
                  Get Started Today
                </Link>
                <Link
                  to="/alerts"
                  className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 text-lg"
                >
                  View Current Alerts
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
