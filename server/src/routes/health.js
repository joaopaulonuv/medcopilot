const express = require('express');
const OpenAI = require('openai');

const router = express.Router();

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: 'ok',
        openai: 'checking...',
      }
    };

    // Check OpenAI connection
    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      
      // Simple API test
      await openai.models.list();
      health.services.openai = 'ok';
    } catch (openaiError) {
      health.services.openai = 'error';
      health.status = 'degraded';
      console.error('OpenAI health check failed:', openaiError.message);
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);

  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

module.exports = router;