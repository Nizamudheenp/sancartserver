const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const formattedErrors = result.error.issues.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));
    return res.status(400).json({
      message: formattedErrors[0]?.message || "Validation failed",
      errors: formattedErrors
    });
  }
  
  // Replace req.body with parsed/coerced clean data
  req.body = result.data;
  next();
};

module.exports = validate;
