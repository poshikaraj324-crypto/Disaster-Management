import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiMapPin, FiClock, FiUser, FiEye, FiShare2, FiDownload } from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import AlertCard from '../components/common/AlertCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const AlertDetail = () => {
  const { id } = useParams();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedAlerts, setRelatedAlerts] = useState([]);

  useEffect(() => {
    fetchAlertDetails();
  }, [id]);

  const fetchAlertDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/alerts/${id}`);
      if (response.data.success) {
        setAlert(response.data.data.alert);
        
        // Fetch related alerts
        const relatedResponse = await axios.get(
          `/api/alerts?type=${response.data.data.alert.type}&limit=3&status=active`
        );
        if (relatedResponse.data.success) {
          setRelatedAlerts(
            relatedResponse.data.data.alerts.filter(a => a._id !== id)
          );
        }
      }
    } catch (error) {
      console.error('Error fetching alert details:', error);
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

  if (!alert) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Alert Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The alert you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/alerts" className="btn btn-primary">
            View All Alerts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>{alert.title} - Disaster Management System</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Link
            to="/alerts"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Alerts
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Alert Header */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{getTypeIcon(alert.type)}</span>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {alert.title}
                    </h1>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {alert.type.replace('_', ' ')}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        alert.severity === 'critical' ? 'severity-critical' :
                        alert.severity === 'high' ? 'severity-high' :
                        alert.severity === 'medium' ? 'severity-medium' :
                        'severity-low'
                      }`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-500 hover:text-primary-600 transition-colors">
                    <FiShare2 className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-primary-600 transition-colors">
                    <FiDownload className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                {alert.description}
              </p>

              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <FiClock className="w-4 h-4" />
                    <span>
                      {alert.createdAt && !isNaN(new Date(alert.createdAt).getTime()) 
                        ? `${new Date(alert.createdAt).toLocaleDateString()} at ${new Date(alert.createdAt).toLocaleTimeString()}`
                        : 'Recently'
                      }
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FiEye className="w-4 h-4" />
                    <span>{alert.statistics?.views || 0} views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FiUser className="w-4 h-4" />
                    <span>By {alert.createdBy?.name || 'System'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <FiMapPin className="w-5 h-5 mr-2" />
                Location
              </h2>
              
              <div className="h-64 rounded-lg overflow-hidden">
                <MapContainer
                  center={[alert.location.coordinates[1], alert.location.coordinates[0]]}
                  zoom={12}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  <Marker
                    position={[alert.location.coordinates[1], alert.location.coordinates[0]]}
                    icon={L.divIcon({
                      className: 'custom-div-icon',
                      html: `<div style="background-color: ${getSeverityColor(alert.severity)}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-size: 14px;">${getTypeIcon(alert.type)}</div>`,
                      iconSize: [24, 24],
                      iconAnchor: [12, 12]
                    })}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold text-sm mb-1">{alert.title}</h3>
                        <p className="text-xs text-gray-600 mb-2">{alert.description}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className={`px-2 py-1 rounded-full text-white ${
                            alert.severity === 'high' || alert.severity === 'critical' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}>
                            {alert.severity.toUpperCase()}
                          </span>
                          <span className="text-gray-500">{alert.type}</span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                  
                  {alert.location.radius && (
                    <Circle
                      center={[alert.location.coordinates[1], alert.location.coordinates[0]]}
                      radius={alert.location.radius * 1000}
                      pathOptions={{
                        color: getSeverityColor(alert.severity),
                        fillColor: getSeverityColor(alert.severity),
                        fillOpacity: 0.1,
                        weight: 2
                      }}
                    />
                  )}
                </MapContainer>
              </div>

              {alert.location.address && (
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  <FiMapPin className="w-4 h-4 inline mr-1" />
                  {alert.location.address}
                </p>
              )}
            </div>

            {/* Safety Instructions */}
            {alert.safetyInstructions && alert.safetyInstructions.length > 0 && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Safety Instructions
                </h2>
                <div className="space-y-4">
                  {alert.safetyInstructions.map((instruction, index) => (
                    <div key={index} className="border-l-4 border-primary-500 pl-4">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {instruction.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {instruction.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Emergency Contacts */}
            {alert.emergencyContacts && alert.emergencyContacts.length > 0 && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Emergency Contacts
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {alert.emergencyContacts.map((contact, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {contact.name}
                      </h3>
                      <p className="text-primary-600 dark:text-primary-400 font-mono">
                        {contact.phone}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {contact.type}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Alert Status */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Alert Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    alert.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200'
                  }`}>
                    {alert.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Valid Until</span>
                  <span className="font-medium">
                    {alert.validUntil && !isNaN(new Date(alert.validUntil).getTime()) 
                      ? new Date(alert.validUntil).toLocaleDateString()
                      : 'Not specified'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Created</span>
                  <span className="font-medium">
                    {alert.createdAt && !isNaN(new Date(alert.createdAt).getTime()) 
                      ? new Date(alert.createdAt).toLocaleDateString()
                      : 'Recently'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Weather Data */}
            {alert.weatherData && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Weather Conditions
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Temperature</span>
                    <span className="font-medium">{alert.weatherData.temperature}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Humidity</span>
                    <span className="font-medium">{alert.weatherData.humidity}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Wind Speed</span>
                    <span className="font-medium">{alert.weatherData.windSpeed} km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Precipitation</span>
                    <span className="font-medium">{alert.weatherData.precipitation} mm</span>
                  </div>
                </div>
              </div>
            )}

            {/* Related Alerts */}
            {relatedAlerts.length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Related Alerts
                </h3>
                <div className="space-y-4">
                  {relatedAlerts.map((relatedAlert) => (
                    <div key={relatedAlert._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <Link
                        to={`/alerts/${relatedAlert._id}`}
                        className="block hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 -m-2 transition-colors"
                      >
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                          {relatedAlert.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {relatedAlert.description.substring(0, 80)}...
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            relatedAlert.severity === 'high' || relatedAlert.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
                          }`}>
                            {relatedAlert.severity}
                          </span>
                          <span className="text-xs text-gray-500">
                            {relatedAlert.createdAt && !isNaN(new Date(relatedAlert.createdAt).getTime()) 
                              ? new Date(relatedAlert.createdAt).toLocaleDateString()
                              : 'Recently'
                            }
                          </span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AlertDetail;
