const errorHandler = (err, req, res, next) => {
  console.error("Server Error details:", err);
  
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  res.status(status).json({
    message: message,
    error: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = errorHandler;
