const validate = (schema) => (req, res, next) => {
  const originalBody = { ...req.body };
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
  
  // Replace req.body with parsed data while preserving extra body keys (like existingImages)
  req.body = { ...originalBody, ...result.data };
  next();
};

module.exports = validate;
