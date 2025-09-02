const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });



  // OpenAI errors
  if (err.message.includes('openai')) {
    return res.status(503).json({
      error: 'AI service temporarily unavailable. Please try again later.'
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(statusCode).json({
    error: err.message || 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
};

module.exports = { errorHandler };