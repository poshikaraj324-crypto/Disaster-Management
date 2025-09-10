const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
  handleValidationErrors
];

// User login validation
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Alert creation validation
const validateAlertCreation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('type')
    .isIn(['landslide', 'flood', 'severe_weather', 'evacuation', 'other'])
    .withMessage('Invalid alert type'),
  body('severity')
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid severity level'),
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Location coordinates must be an array of [longitude, latitude]'),
  body('location.coordinates.*')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid coordinate value'),
  body('validUntil')
    .isISO8601()
    .withMessage('Valid until must be a valid date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Valid until date must be in the future');
      }
      return true;
    }),
  handleValidationErrors
];

// Location update validation
const validateLocationUpdate = [
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Location coordinates must be an array of [longitude, latitude]'),
  body('location.coordinates.*')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid coordinate value'),
  body('location.address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address cannot be more than 200 characters'),
  body('location.city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City cannot be more than 100 characters'),
  body('location.state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State cannot be more than 100 characters'),
  body('location.country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country cannot be more than 100 characters'),
  handleValidationErrors
];

// Emergency contact validation
const validateEmergencyContact = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Contact name must be between 2 and 50 characters'),
  body('phone')
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
  body('relationship')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Relationship cannot be more than 50 characters'),
  handleValidationErrors
];

// Notification preferences validation
const validateNotificationPreferences = [
  body('emailNotifications')
    .optional()
    .isBoolean()
    .withMessage('Email notifications must be a boolean value'),
  body('pushNotifications')
    .optional()
    .isBoolean()
    .withMessage('Push notifications must be a boolean value'),
  body('alertRadius')
    .optional()
    .isFloat({ min: 1, max: 500 })
    .withMessage('Alert radius must be between 1 and 500 kilometers'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateAlertCreation,
  validateLocationUpdate,
  validateEmergencyContact,
  validateNotificationPreferences
};
