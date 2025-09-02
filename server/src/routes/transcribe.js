const express = require('express');
const { body, validationResult } = require('express-validator');

const router = express.Router();

/**
 * POST /api/transcribe
 * This endpoint is now deprecated since transcription happens on the frontend
 * Keeping for backward compatibility
 */
router.post('/transcribe', [
  body('transcription')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Transcription text is required')
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Invalid input',
        details: errors.array()
      });
    }

    const { transcription } = req.body;

    console.log(`📝 Received transcription text (${transcription.length} chars)`);

    // Simply return the transcription since it's already processed on frontend
    res.json({
      transcription: transcription,
      timestamp: new Date().toISOString(),
      source: 'frontend'
    });

  } catch (error) {
    console.error('Transcription processing error:', error);
    
    res.status(500).json({
      error: 'Failed to process transcription. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;