const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const analyzeRoutes = require('./routes/analyze');
const healthRoutes = require('./routes/health');
const { errorHandler } = require('./middleware/errorHandler');
const { validateEnvironment } = require('./utils/validation');

// Validate environment variables
validateEnvironment();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api', limiter);

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8081'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Other middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '1mb' }));

// Routes
app.use('/api', analyzeRoutes);
app.use('/api', healthRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /api/health',
      'POST /api/analyze'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🏥 Medical AI Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔒 CORS enabled for: ${allowedOrigins.join(', ')}`);
});

module.exports = app;