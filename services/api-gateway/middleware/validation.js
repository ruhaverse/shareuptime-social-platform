const Joi = require('joi');
const { body, param, query, validationResult } = require('express-validator');

// Custom validation middleware using Joi
const validateWithJoi = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));
      
      return res.status(400).json({
        error: 'Validation failed',
        details: details
      });
    }
    
    // Replace req.body with validated and stripped data
    req.body = value;
    next();
  };
};

// Express-validator middleware wrapper
const validateWithExpressValidator = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Common validation schemas
const schemas = {
  // User registration validation
  userRegistration: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'Password is required'
      }),
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.alphanum': 'Username must contain only letters and numbers',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters',
        'any.required': 'Username is required'
      }),
    firstName: Joi.string()
      .min(1)
      .max(50)
      .pattern(/^[a-zA-Z\s]*$/)
      .required()
      .messages({
        'string.pattern.base': 'First name can only contain letters and spaces',
        'any.required': 'First name is required'
      }),
    lastName: Joi.string()
      .min(1)
      .max(50)
      .pattern(/^[a-zA-Z\s]*$/)
      .required()
      .messages({
        'string.pattern.base': 'Last name can only contain letters and spaces',
        'any.required': 'Last name is required'
      })
  }),

  // User login validation
  userLogin: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  }),

  // Post creation validation
  postCreation: Joi.object({
    content: Joi.string()
      .min(1)
      .max(2000)
      .required()
      .messages({
        'string.min': 'Post content cannot be empty',
        'string.max': 'Post content cannot exceed 2000 characters',
        'any.required': 'Post content is required'
      }),
    mediaUrls: Joi.array()
      .items(Joi.string().uri())
      .max(4)
      .optional()
      .messages({
        'array.max': 'Maximum 4 media files allowed per post',
        'string.uri': 'Media URLs must be valid URIs'
      }),
    hashtags: Joi.array()
      .items(Joi.string().pattern(/^[a-zA-Z0-9_]+$/))
      .max(10)
      .optional()
      .messages({
        'array.max': 'Maximum 10 hashtags allowed per post',
        'string.pattern.base': 'Hashtags can only contain letters, numbers, and underscores'
      }),
    mentions: Joi.array()
      .items(Joi.string())
      .max(10)
      .optional()
      .messages({
        'array.max': 'Maximum 10 mentions allowed per post'
      }),
    location: Joi.object({
      latitude: Joi.number().min(-90).max(90),
      longitude: Joi.number().min(-180).max(180),
      name: Joi.string().max(100)
    }).optional()
  }),

  // User profile update validation
  profileUpdate: Joi.object({
    firstName: Joi.string()
      .min(1)
      .max(50)
      .pattern(/^[a-zA-Z\s]*$/)
      .optional(),
    lastName: Joi.string()
      .min(1)
      .max(50)
      .pattern(/^[a-zA-Z\s]*$/)
      .optional(),
    bio: Joi.string()
      .max(500)
      .optional(),
    website: Joi.string()
      .uri()
      .optional(),
    location: Joi.string()
      .max(100)
      .optional()
  })
};

// Express-validator rules
const expressValidatorRules = {
  // Pagination validation
  pagination: [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset must be a non-negative integer')
  ],

  // User ID parameter validation
  userId: [
    param('userId')
      .isUUID()
      .withMessage('User ID must be a valid UUID')
  ],

  // Post ID parameter validation
  postId: [
    param('postId')
      .isUUID()
      .withMessage('Post ID must be a valid UUID')
  ]
};

module.exports = {
  validateWithJoi,
  validateWithExpressValidator,
  schemas,
  expressValidatorRules
};