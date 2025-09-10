# Disaster Management and Alert System

A comprehensive web application for managing disaster alerts, specifically designed for landslides and floods. The system provides real-time monitoring, alert management, and emergency response coordination.

## 🌟 Features

### Core Functionality
- **Real-time Disaster Alerts**: Get instant notifications about landslides, floods, and severe weather
- **Interactive Maps**: View disaster zones, evacuation routes, and emergency shelters with colored markers by severity
- **Location-based Alerts**: Filter alerts by user's location with customizable radius (default 50km)
- **User Authentication**: Secure signup/login with role-based access (Admin/User)
- **Weather Integration**: Real-time weather data and risk assessment from OpenWeatherMap API
- **Auto-refresh**: Dashboard updates every 5 minutes with latest alerts
- **Notification System**: Web push notifications and email alerts
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Mode**: User preference for interface themes

### Advanced Features
- **External API Integration**: Automatic fetching from weather APIs with cron jobs
- **Bulk Import/Export**: CSV and JSON support for managing large datasets
- **Geospatial Queries**: MongoDB 2dsphere indexing for efficient location-based searches
- **Distance Calculations**: Real-time distance calculations for alerts
- **Severity-based Visualization**: Color-coded markers (🟢 Low, 🟡 Medium, 🔴 High, ⚫ Critical)
- **Admin Management**: Comprehensive admin dashboard with system monitoring

### Admin Features
- **Alert Management**: Create, update, and delete disaster alerts
- **User Management**: Manage user accounts and permissions
- **Emergency Notifications**: Send urgent alerts to all users
- **Analytics Dashboard**: View system statistics and usage metrics
- **Map Visualization**: Monitor affected areas and alert distribution

### User Features
- **Personal Dashboard**: View relevant alerts and weather information
- **Location-based Alerts**: Receive notifications for your specific area
- **Emergency Contacts**: Access to local emergency services
- **Safety Guidelines**: Download safety instructions and resources
- **Profile Management**: Update personal information and preferences

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Leaflet** - Interactive maps
- **Framer Motion** - Smooth animations
- **React Hook Form** - Form management
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Nodemailer** - Email service
- **Web Push** - Push notifications

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and load balancer
- **MongoDB** - Database
- **Redis** - Caching and sessions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- Git

### Option 1: Docker Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd disaster-management-system
   ```

2. **Set up environment variables**
   ```bash
   cp backend/env.example backend/.env
   # Edit backend/.env with your configuration
   ```

3. **Start the application**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

### Option 2: Local Development Setup

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd disaster-management-system
   npm run install-all
   ```

2. **Set up MongoDB**
   ```bash
   # Install MongoDB locally or use MongoDB Atlas
   # Update MONGODB_URI in backend/.env
   ```

3. **Configure environment variables**
   ```bash
   cp backend/env.example backend/.env
   # Edit backend/.env with your settings
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

## 📋 Environment Configuration

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/disaster_management

# Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Web Push Configuration (Optional)
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=mailto:your_email@gmail.com

# Weather API Configuration
# Get your free API key from: https://openweathermap.org/api
WEATHER_API_KEY=your_openweathermap_api_key_here
WEATHER_API_URL=https://api.openweathermap.org/data/2.5

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 🔑 API Keys Setup

#### OpenWeatherMap API (Recommended)
1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add it to your `.env` file as `WEATHER_API_KEY`

**Note:** Without a valid API key, the system will use mock weather data for demonstration purposes.

#### Email Service (Optional)
For email notifications, configure SMTP settings:
- **Gmail**: Use App Password (not your regular password)
- **Other providers**: Use their SMTP settings

#### Web Push Notifications (Optional)
For browser push notifications:
1. Generate VAPID keys using: `npx web-push generate-vapid-keys`
2. Add the keys to your `.env` file

## 🔐 Default Accounts

The system comes with pre-configured demo accounts:

- **Admin Account**
  - Email: `admin@example.com`
  - Password: `admin123`
  - Access: Full admin privileges

- **User Account**
  - Email: `user@example.com`
  - Password: `user123`
  - Access: Standard user features

## 📱 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Alert Endpoints
- `GET /api/alerts` - Get all alerts (with filtering)
- `GET /api/alerts/:id` - Get specific alert
- `POST /api/alerts` - Create alert (Admin only)
- `PUT /api/alerts/:id` - Update alert (Admin only)
- `DELETE /api/alerts/:id` - Delete alert (Admin only)
- `GET /api/alerts/location/:lat/:lng` - Get alerts by location
- `GET /api/alerts/nearby` - Get alerts for user's location (with preferences)

### Alert Management Endpoints (Admin Only)
- `POST /api/alert-management/fetch` - Manually fetch alerts from external APIs
- `GET /api/alert-management/status` - Get alert fetcher and cron service status
- `POST /api/alert-management/import/csv` - Bulk import alerts from CSV
- `POST /api/alert-management/import/json` - Bulk import alerts from JSON
- `GET /api/alert-management/export/csv` - Export alerts to CSV
- `POST /api/alert-management/cleanup` - Clean up expired alerts

### Weather Endpoints
- `GET /api/weather/current` - Current weather
- `GET /api/weather/forecast` - Weather forecast
- `GET /api/weather/alerts` - Weather alerts
- `GET /api/weather/risk-assessment` - Risk assessment

### Notification Endpoints
- `POST /api/notifications/subscribe` - Subscribe to push notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `POST /api/notifications/emergency` - Send emergency notification (Admin only)

## 🗺️ Map Integration

The application uses Leaflet.js for interactive maps with the following features:

- **Alert Markers**: Visual representation of disaster alerts
- **Severity Colors**: Color-coded markers based on alert severity
- **Radius Circles**: Show affected areas around alerts
- **User Location**: Display user's current position
- **Popup Information**: Detailed alert information on marker click

### Map Configuration
- Default map provider: OpenStreetMap
- Customizable map styles and providers
- Responsive design for mobile devices
- Geospatial queries for location-based alerts

## 🔔 Notification System

### Web Push Notifications
- Real-time browser notifications
- Service worker implementation
- VAPID key configuration
- User subscription management

### Email Notifications
- SMTP configuration
- HTML email templates
- User preference settings
- Emergency broadcast capability

## 🤖 Automatic Alert System

### Real-time Data Fetching
- **Cron Jobs**: Automatic alert fetching every hour
- **Weather API Integration**: OpenWeatherMap API for real-time weather data
- **Smart Analysis**: AI-powered risk assessment based on weather conditions
- **Geographic Coverage**: Monitors major Indian cities automatically

### Alert Processing
- **Duplicate Detection**: Prevents duplicate alerts from external sources
- **Severity Assessment**: Automatic severity classification based on weather data
- **Location Mapping**: Automatic geocoding and radius calculation
- **User Notifications**: Automatic push/email notifications to affected users

### Admin Controls
- **Manual Fetch**: Trigger immediate alert fetching from admin dashboard
- **System Monitoring**: Real-time status of cron jobs and API connections
- **Bulk Operations**: Import/export alerts in CSV/JSON format
- **Cleanup Tools**: Automatic cleanup of expired alerts and old notifications

## 🎨 UI/UX Features

### Design System
- **Tailwind CSS**: Utility-first styling
- **Dark/Light Mode**: User preference toggle
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG 2.1 compliant
- **Animations**: Smooth transitions with Framer Motion

### Components
- Reusable UI components
- Form validation and error handling
- Loading states and skeletons
- Toast notifications
- Modal dialogs

## 🚀 Deployment

### Production Deployment with Docker

1. **Build production images**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. **Deploy to production**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Cloud Deployment Options

- **AWS**: EC2, ECS, or Elastic Beanstalk
- **Google Cloud**: Compute Engine or Cloud Run
- **Azure**: App Service or Container Instances
- **DigitalOcean**: Droplets or App Platform
- **Heroku**: Container deployment

### Environment Variables for Production

Ensure the following are set in production:
- Strong JWT secrets
- Secure database credentials
- Valid email service configuration
- VAPID keys for push notifications
- Weather API keys
- SSL certificates for HTTPS

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

### Test Coverage
- Unit tests for components and utilities
- Integration tests for API endpoints
- E2E tests for critical user flows
- Performance testing for map rendering

## 📊 Monitoring and Logging

### Application Monitoring
- Health check endpoints
- Error tracking and logging
- Performance metrics
- User analytics

### Log Management
- Structured logging with Winston
- Log rotation and retention
- Error alerting
- Performance monitoring

## 🔧 Development

### Project Structure
```
disaster-management-system/
├── backend/                 # Node.js API server
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   └── server.js           # Main server file
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   └── App.js          # Main app component
│   └── public/             # Static assets
├── docker-compose.yml      # Docker orchestration
├── Dockerfile              # Production container
└── README.md              # This file
```

### Development Scripts
```bash
# Install all dependencies
npm run install-all

# Start development servers
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- ESLint configuration for consistent code style
- Prettier for code formatting
- Conventional commits for commit messages
- TypeScript for type safety (optional)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- Check the [Issues](https://github.com/your-repo/issues) page
- Review the [Documentation](docs/)
- Contact the development team

### Common Issues

**MongoDB Connection Issues**
- Ensure MongoDB is running
- Check connection string in .env
- Verify network connectivity

**Map Not Loading**
- Check internet connection
- Verify Leaflet CSS/JS includes
- Check browser console for errors

**Push Notifications Not Working**
- Verify VAPID keys configuration
- Check browser notification permissions
- Ensure HTTPS in production

## 🔮 Future Enhancements

- **Mobile App**: React Native or Flutter app
- **AI Integration**: Machine learning for risk prediction
- **IoT Integration**: Sensor data integration
- **Multi-language Support**: Internationalization
- **Advanced Analytics**: Detailed reporting and insights
- **Social Features**: Community reporting and sharing
- **Offline Support**: Service worker for offline functionality

## 🙏 Acknowledgments

- OpenStreetMap for map data
- Leaflet.js for map functionality
- React community for excellent libraries
- Contributors and testers

---

**Built with ❤️ for community safety and disaster preparedness**
