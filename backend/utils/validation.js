const Joi = require('joi');

// User validation schemas
const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'Username must only contain alphanumeric characters',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username must not exceed 30 characters',
      'any.required': 'Username is required'
    }),
  
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(6)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
      'any.required': 'Password is required'
    })
});

const loginSchema = Joi.object({
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
});

// Todo validation schemas
const createTodoSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.min': 'Todo title cannot be empty',
      'string.max': 'Todo title must not exceed 255 characters',
      'any.required': 'Todo title is required'
    })
});

const updateTodoSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .messages({
      'string.min': 'Todo title cannot be empty',
      'string.max': 'Todo title must not exceed 255 characters'
    }),
  
  completed: Joi.boolean()
    .messages({
      'boolean.base': 'Completed status must be true or false'
    })
}).min(1).messages({
  'object.min': 'At least one field (title or completed) must be provided'
});

// ID parameter validation
const idParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'ID must be a number',
      'number.integer': 'ID must be an integer',
      'number.positive': 'ID must be a positive number',
      'any.required': 'ID is required'
    })
});

// Validation middleware factory
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property]);
    
    if (error) {
      return res.status(400).json({
        error: error.details[0].message
      });
    }
    
    next();
  };
};

module.exports = {
  registerSchema,
  loginSchema,
  createTodoSchema,
  updateTodoSchema,
  idParamSchema,
  validate
};