const express = require('express');
const { body, validationResult } = require('express-validator');
const OpenAI = require('openai');
const { z } = require('zod');
const { sanitizeInput } = require('../utils/sanitization');

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Zod schema for medical analysis validation
const MedicalAnalysisSchema = z.object({
  symptoms: z.array(z.string()).min(0),
  differentialDiagnosis: z.array(z.string()).min(0),
  redFlags: z.array(z.string()).min(0),
  medications: z.array(z.string()).min(0),
  recommendations: z.array(z.string()).min(1),
  summary: z.string().min(10),
});

/**
 * POST /api/analyze
 * Analyze medical consultation transcription using GPT
 */
router.post('/analyze', [
  body('transcription')
    .isString()
    .isLength({ min: 10 })
    .withMessage('Transcription must be at least 10 characters long')
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
    const sanitizedTranscription = sanitizeInput(transcription);

    console.log(`🧠 Analyzing medical consultation (${sanitizedTranscription.length} chars)`);

    // Medical analysis prompt
    const systemPrompt = `
Você é um assistente médico especializado em análise de consultas clínicas. 
Analise a transcrição da conversa entre médico e paciente e extraia informações estruturadas.

IMPORTANTE: 
- Responda apenas em português brasileiro
- Seja preciso e objetivo
- Identifique red flags (sinais de alerta) críticos
- Mantenha confidencialidade médica
- Baseie-se apenas no que foi explicitamente mencionado

Retorne um JSON válido com esta estrutura exata:
{
  "symptoms": ["sintoma1", "sintoma2"],
  "differentialDiagnosis": ["hipótese1", "hipótese2"],
  "redFlags": ["alerta1", "alerta2"],
  "medications": ["medicamento1", "medicamento2"],
  "recommendations": ["recomendação1", "recomendação2"],
  "summary": "Resumo executivo da consulta em 2-3 frases"
}

Diretrizes específicas:
- symptoms: sintomas relatados pelo paciente
- differentialDiagnosis: possíveis diagnósticos baseados nos sintomas
- redFlags: sinais de alerta que requerem atenção imediata
- medications: medicamentos mencionados (atuais ou prescritos)
- recommendations: próximos passos clínicos recomendados
- summary: resumo conciso da consulta

Se alguma categoria não tiver informações, retorne array vazio [].
`;

    // Call GPT for analysis
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: sanitizedTranscription }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const analysisText = completion.choices[0]?.message?.content;
    if (!analysisText) {
      throw new Error('No analysis generated');
    }

    // Parse and validate JSON response
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse GPT response:', analysisText);
      throw new Error('Invalid analysis format received');
    }

    // Validate with Zod schema
    const validatedAnalysis = MedicalAnalysisSchema.parse(analysis);

    res.json(validatedAnalysis);

  } catch (error) {
    console.error('Analysis error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid analysis format',
        details: error.errors
      });
    }

    if (error.message.includes('Invalid analysis format')) {
      return res.status(500).json({
        error: 'Failed to process medical analysis. Please try again.'
      });
    }

    res.status(500).json({
      error: 'Failed to analyze consultation. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;