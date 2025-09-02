const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const { sanitizeInput } = require('../utils/sanitization');
const { validateAudioFile } = require('../utils/audioValidation');

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = 'temp/';
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  }
});

/**
 * POST /api/transcribe
 * Transcribe audio file using OpenAI Whisper
 */
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    // Validate request
    if (!req.file) {
      return res.status(400).json({
        error: 'No audio file provided'
      });
    }

    // Validate audio file
    const isValidAudio = await validateAudioFile(req.file.path);
    if (!isValidAudio) {
      return res.status(400).json({
        error: 'Invalid or corrupted audio file'
      });
    }

    console.log(`📝 Transcribing audio file: ${req.file.originalname}`);

    // Transcribe using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: 'whisper-1',
      language: 'pt', // Portuguese
      response_format: 'text',
      temperature: 0.2, // Lower temperature for more accurate medical transcription
    });

    // Sanitize transcription output
    const sanitizedTranscription = sanitizeInput(transcription);

    // Clean up temp file
    fs.unlinkSync(req.file.path);

    res.json({
      transcription: sanitizedTranscription,
      duration: req.file.size, // Approximate
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    // Clean up temp file if it exists
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Failed to clean up temp file:', cleanupError);
      }
    }

    console.error('Transcription error:', error);
    
    if (error.message.includes('Invalid audio format')) {
      return res.status(400).json({
        error: 'Unsupported audio format. Please use MP3, M4A, WAV, or MP4.'
      });
    }

    res.status(500).json({
      error: 'Failed to transcribe audio. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
