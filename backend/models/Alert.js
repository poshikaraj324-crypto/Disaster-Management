const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Alert title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Alert description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  type: {
    type: String,
    enum: ['landslide', 'flood', 'severe_weather', 'evacuation', 'other'],
    required: [true, 'Alert type is required']
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: [true, 'Alert severity is required'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'active'
  },
  location: {
    type: {
      type: String,
      enum: ['Point', 'Polygon'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude] for Point, or array of arrays for Polygon
      required: true
    },
    address: String,
    city: String,
    state: String,
    country: String,
    radius: Number // in kilometers for Point type
  },
  affectedAreas: [{
    name: String,
    coordinates: [Number],
    population: Number,
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    }
  }],
  weatherData: {
    temperature: Number,
    humidity: Number,
    precipitation: Number,
    windSpeed: Number,
    windDirection: Number,
    pressure: Number,
    visibility: Number,
    lastUpdated: Date
  },
  safetyInstructions: [{
    title: String,
    description: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  }],
  emergencyContacts: [{
    name: String,
    phone: String,
    type: {
      type: String,
      enum: ['police', 'fire', 'medical', 'emergency', 'shelter', 'other']
    }
  }],
  shelters: [{
    name: String,
    address: String,
    coordinates: [Number],
    capacity: Number,
    currentOccupancy: Number,
    facilities: [String],
    contact: String
  }],
  resources: [{
    title: String,
    description: String,
    type: {
      type: String,
      enum: ['document', 'image', 'video', 'link']
    },
    url: String,
    fileSize: Number
  }],
  validFrom: {
    type: Date,
    required: true,
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  tags: [String],
  metadata: {
    source: String, // 'manual', 'api', 'system'
    externalId: String,
    confidence: Number, // 0-1
    verified: {
      type: Boolean,
      default: false
    }
  },
  statistics: {
    views: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    acknowledgments: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes
alertSchema.index({ location: '2dsphere' });
alertSchema.index({ type: 1, severity: 1, status: 1 });
alertSchema.index({ validFrom: 1, validUntil: 1 });
alertSchema.index({ createdAt: -1 });

// Update timestamp on save
alertSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for checking if alert is currently active
alertSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'active' && 
         this.validFrom <= now && 
         this.validUntil >= now;
});

// Method to check if alert affects a specific location
alertSchema.methods.affectsLocation = function(latitude, longitude, radius = 50) {
  if (this.location.type === 'Point') {
    const distance = this.calculateDistance(
      this.location.coordinates[1], 
      this.location.coordinates[0], 
      latitude, 
      longitude
    );
    return distance <= (this.location.radius || radius);
  }
  // For polygon type, you would implement polygon intersection logic
  return false;
};

// Calculate distance between two points using Haversine formula
alertSchema.methods.calculateDistance = function(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = this.toRadians(lat2 - lat1);
  const dLon = this.toRadians(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

alertSchema.methods.toRadians = function(degrees) {
  return degrees * (Math.PI/180);
};

module.exports = mongoose.model('Alert', alertSchema);
