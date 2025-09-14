import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { 
  FiMapPin, 
  FiClock, 
  FiAlertTriangle, 
  FiEye,
  FiExternalLink 
} from 'react-icons/fi';

const AlertCard = ({ alert, showActions = false, onView, onEdit, onDelete }) => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low':
        return 'severity-low';
      case 'medium':
        return 'severity-medium';
      case 'high':
        return 'severity-high';
      case 'critical':
        return 'severity-critical';
      default:
        return 'severity-medium';
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

  const getTypeLabel = (type) => {
    switch (type) {
      case 'landslide':
        return 'Landslide';
      case 'flood':
        return 'Flood';
      case 'severe_weather':
        return 'Severe Weather';
      case 'evacuation':
        return 'Evacuation';
      default:
        return 'Other';
    }
  };

  return (
    <div className="card p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getTypeIcon(alert.type)}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {alert.title}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {getTypeLabel(alert.type)}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                {alert.severity.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        
        {showActions && (
          <div className="flex items-center space-x-2">
            {onView && (
              <button
                onClick={() => onView(alert)}
                className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
                title="View Details"
              >
                <FiEye className="w-4 h-4" />
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(alert)}
                className="p-2 text-gray-500 hover:text-warning-600 transition-colors"
                title="Edit Alert"
              >
                <FiExternalLink className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(alert)}
                className="p-2 text-gray-500 hover:text-danger-600 transition-colors"
                title="Delete Alert"
              >
                <FiAlertTriangle className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
        {alert.description}
      </p>

      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          {alert.location?.address && (
            <div className="flex items-center space-x-1">
              <FiMapPin className="w-4 h-4" />
              <span className="truncate max-w-32">
                {alert.location.address}
              </span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <FiClock className="w-4 h-4" />
            <span>
              {alert.createdAt && !isNaN(new Date(alert.createdAt).getTime()) 
                ? formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })
                : 'Recently'
              }
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <FiEye className="w-4 h-4" />
          <span>{alert.statistics?.views || 0}</span>
        </div>
      </div>

      {alert.validUntil && !isNaN(new Date(alert.validUntil).getTime()) && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Valid until:</span>
            <span className="font-medium">
              {new Date(alert.validUntil).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}

      {!showActions && (
        <div className="mt-4">
          <Link
            to={`/alerts/${alert._id}`}
            className="btn btn-primary w-full text-center"
          >
            View Details
          </Link>
        </div>
      )}
    </div>
  );
};

export default AlertCard;
