import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  FiAlertTriangle,
  FiMap,
  FiBell,
  FiTrendingUp,
  FiShield,
  FiUsers,
  FiClock,
  FiEye,
  FiMapPin
} from 'react-icons/fi';
import { Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import axios from '../config/axios';
import { useAuth } from '../contexts/AuthContext';
import AlertCard from '../components/common/AlertCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SafeMapContainer from '../components/common/SafeMapContainer';

const Dashboard = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]); // Default to Delhi
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError(error.message);
          // Use user's saved location if available
          if (user?.location?.coordinates) {
            setMapCenter([user.location.coordinates[1], user.location.coordinates[0]]);
          }
        }
      );
    } else if (user?.location?.coordinates) {
      setMapCenter([user.location.coordinates[1], user.location.coordinates[0]]);
    }

    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(refreshInterval);
  }, [user]);

  // Separate effect for fetching data when location changes
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, userLocation]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch location-based alerts
      if (userLocation && userLocation.length === 2) {
        try {
          const alertsResponse = await axios.get(
            `/api/alerts/nearby?lat=${userLocation[0]}&lng=${userLocation[1]}&radius=50`
          );
          if (alertsResponse.data.success) {
            setAlerts(alertsResponse.data.data.alerts || []);
          }
        } catch (alertError) {
          console.error('Error fetching location-based alerts:', alertError);
          // Fallback to general alerts
          const fallbackResponse = await axios.get('/api/alerts?limit=10&status=active');
          if (fallbackResponse.data.success) {
            setAlerts(fallbackResponse.data.data.alerts || []);
          }
        }
      } else {
        // Fallback to general alerts if no location
        try {
          const alertsResponse = await axios.get('/api/alerts?limit=10&status=active');
          if (alertsResponse.data.success) {
            setAlerts(alertsResponse.data.data.alerts || []);
          }
        } catch (alertError) {
          console.error('Error fetching general alerts:', alertError);
          setAlerts([]);
        }
      }

      // Fetch weather data
      if (userLocation && userLocation.length === 2) {
        try {
          const weatherResponse = await axios.get(
            `/api/weather/current?lat=${userLocation[0]}&lng=${userLocation[1]}`
          );
          if (weatherResponse.data.success) {
            setWeather(weatherResponse.data.data.weather);
          }
        } catch (weatherError) {
          console.error('Error fetching weather data:', weatherError);
          // Set mock weather data
          setWeather({
            temperature: 28,
            condition: 'Partly Cloudy',
            humidity: 65,
            windSpeed: 12
          });
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low':
        return '#22c55e';
      case 'medium':
        return '#f59e0b';
      case 'high':
        return '#ef4444';
      case 'critical':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'landslide':
        return '🏔️';
      case 'flood':
        return '🌊';
      case 'severe_weather':
        return '⛈️';
      case 'evacuation':
        return '🚨';
      default:
        return '⚠️';
    }
  };

  if (loading) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  // Error boundary for the entire dashboard
  try {

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>Dashboard - Disaster Management System</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's what's happening in your area and important alerts you should know about.
          </p>
        </motion.div>

        {/* Location Error Banner */}
        {locationError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
          >
            <div className="flex items-center">
              <FiMapPin className="w-5 h-5 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Location Access Issue
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  {locationError}. Using default location for alerts.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-danger-100 dark:bg-danger-900/20 rounded-lg">
                <FiAlertTriangle className="w-6 h-6 text-danger-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Alerts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {alerts.filter(alert => alert.severity === 'high' || alert.severity === 'critical').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-warning-100 dark:bg-warning-900/20 rounded-lg">
                <FiBell className="w-6 h-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Alerts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{alerts.length}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                <FiShield className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Safety Score</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">85%</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-success-100 dark:bg-success-900/20 rounded-lg">
                <FiUsers className="w-6 h-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Community</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">1,250</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                  <FiMap className="w-5 h-5 mr-2" />
                  Alert Map
                </h2>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {alerts.length} active alerts
                </div>
              </div>

              <SafeMapContainer
                center={mapCenter}
                zoom={10}
                className="h-96 rounded-lg overflow-hidden"
              >
                {/* User Location */}
                {userLocation && (
                  <Marker position={userLocation}>
                    <Popup>
                      <div className="text-center">
                        <p className="font-semibold">Your Location</p>
                        <p className="text-sm text-gray-600">Current position</p>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Alert Markers */}
                {alerts.map((alert) => (
                  <React.Fragment key={alert._id}>
                    <Marker
                      position={[alert.location.coordinates[1], alert.location.coordinates[0]]}
                      icon={L.divIcon({
                        className: 'custom-div-icon',
                        html: `<div style="background-color: ${getSeverityColor(alert.severity)}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${getTypeIcon(alert.type)}</div>`,
                        iconSize: [24, 24],
                        iconAnchor: [12, 12]
                      })}
                    >
                      <Popup>
                        <div className="p-3 min-w-[250px]">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 pr-2">
                              {alert.title}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                              alert.severity === 'critical' ? 'bg-red-600' :
                              alert.severity === 'high' ? 'bg-red-500' :
                              alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}>
                              {alert.severity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                            {alert.description}
                          </p>
                          <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex justify-between">
                              <span>Type:</span>
                              <span className="capitalize">{alert.type.replace('_', ' ')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Location:</span>
                              <span>{alert.location.city || alert.location.address || 'Unknown'}</span>
                            </div>
                            {alert.distance && (
                              <div className="flex justify-between">
                                <span>Distance:</span>
                                <span>{alert.distance} km</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span>Updated:</span>
                              <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <a 
                              href={`/alerts/${alert._id}`}
                              className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                            >
                              View Details →
                            </a>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                    
                    {/* Alert Radius */}
                    {alert.location.radius && (
                      <Circle
                        center={[alert.location.coordinates[1], alert.location.coordinates[0]]}
                        radius={alert.location.radius * 1000} // Convert km to meters
                        pathOptions={{
                          color: getSeverityColor(alert.severity),
                          fillColor: getSeverityColor(alert.severity),
                          fillOpacity: 0.1,
                          weight: 2
                        }}
                      />
                    )}
                  </React.Fragment>
                ))}
              </SafeMapContainer>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Weather Widget */}
            {weather && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Current Weather
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Temperature</span>
                    <span className="font-medium">{weather.temperature}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Humidity</span>
                    <span className="font-medium">{weather.humidity}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Wind Speed</span>
                    <span className="font-medium">{weather.windSpeed} km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Condition</span>
                    <span className="font-medium capitalize">{weather.description}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Alerts */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Recent Alerts
              </h3>
              <div className="space-y-4">
                {alerts.slice(0, 3).map((alert) => (
                  <div key={alert._id} className="border-l-4 border-primary-500 pl-4">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {alert.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {alert.description.substring(0, 80)}...
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${alert.severity === 'high' || alert.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'}`}>
                        {alert.severity}
                      </span>
                      <span className="text-xs text-gray-500">
                        <FiClock className="w-3 h-3 inline mr-1" />
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full btn btn-primary text-left">
                  <FiBell className="w-4 h-4 mr-2" />
                  View All Alerts
                </button>
                <button className="w-full btn btn-secondary text-left">
                  <FiShield className="w-4 h-4 mr-2" />
                  Safety Guidelines
                </button>
                <button className="w-full btn btn-secondary text-left">
                  <FiUsers className="w-4 h-4 mr-2" />
                  Emergency Contacts
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
  } catch (error) {
    console.error('Dashboard rendering error:', error);
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Dashboard Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Something went wrong while loading the dashboard.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
};

export default Dashboard;
