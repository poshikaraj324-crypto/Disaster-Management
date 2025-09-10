import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import './LeafletFix.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Suppress Leaflet console errors
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('_leaflet_pos') || 
     args[0].includes('Cannot read properties of undefined') ||
     args[0].includes('Cannot read properties of null'))
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

// Suppress Leaflet warnings
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('_leaflet_pos') || 
     args[0].includes('Cannot read properties of undefined'))
  ) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

const SafeMapContainer = ({ 
  center, 
  zoom = 10, 
  style = { height: '100%', width: '100%' },
  children,
  className = '',
  ...props 
}) => {
  const [isReady, setIsReady] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Error boundary for map
  useEffect(() => {
    const handleError = (event) => {
      if (event.message && event.message.includes('_leaflet_pos')) {
        event.preventDefault();
        setMapError(true);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (mapError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`} style={style}>
        <div className="text-center p-4">
          <div className="text-gray-500 dark:text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Map temporarily unavailable</p>
          <button 
            onClick={() => setMapError(false)}
            className="mt-2 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`} style={style}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading map...</p>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className={className} style={style}>
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          {...props}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {children}
        </MapContainer>
      </div>
    );
  } catch (error) {
    console.warn('Map rendering error:', error);
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`} style={style}>
        <div className="text-center p-4">
          <div className="text-gray-500 dark:text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Map temporarily unavailable</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
};

export default SafeMapContainer;
