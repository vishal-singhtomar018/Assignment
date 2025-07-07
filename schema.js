const Joi = require("joi");

exports.noteSchema = Joi.object({
  note: Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).optional(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
  }).required(),
});


exports.userSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .trim()
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      "string.base": "Name must be a string",
      "string.empty": "Name is required",
      "string.min": "Name must be at least 3 characters",
      "string.max": "Name must be less than or equal to 50 characters",
      "string.pattern.base": "Name must contain only letters and spaces",
    }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .pattern(/^[a-zA-Z0-9._%+-]{4,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .required()
    .messages({
      "string.email": "Email must be a valid format",
      "string.pattern.base": "Email must be valid and realistic",
      "string.empty": "Email is required",
    }),

  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      "string.length": "OTP must be exactly 6 digits",
      "string.pattern.base": "OTP must be a 6-digit number",
      "string.empty": "OTP is required",
    }),

  dob: Joi.date()
    .iso()
    .less("now")
    .required()
    .messages({
      "date.base": "Date of birth must be a valid date",
      "date.less": "Date of birth must be a valid past date",
      "any.required": "Date of birth is required",
    }),

  provider: Joi.string()
    .valid("local", "google")
    .default("local")
    .messages({
      "any.only": "Provider must be either 'local' or 'google'",
    }),
});



// Inside your Joi schema file
exports.loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .pattern(/^[a-zA-Z0-9._%+-]{4,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .required()
    .messages({
      "string.email": "Email must be a valid format",
      "string.pattern.base": "Email must be valid and realistic",
      "string.empty": "Email is required",
    }),

  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      "string.length": "OTP must be exactly 6 digits",
      "string.pattern.base": "OTP must be a 6-digit number",
      "string.empty": "OTP is required",
    }),
});
