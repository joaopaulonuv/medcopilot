import { ConfigService } from './ConfigService';
import { StorageService } from './StorageService';
import { AudioService, TranscriptionChunk } from './AudioService';

export interface MedicalAnalysis {
  symptoms: string[];
  differentialDiagnosis: string[];
  redFlags: string[];
  medications: string[];
  recommendations: string[];
  summary: string;
  transcription: string;
  timestamp: string;
  chunks: TranscriptionChunk[];
}

export class AnalysisService {
  static async analyzeMedicalConsultation(
    transcription: string, 
    chunks: TranscriptionChunk[] = []
  ): Promise<MedicalAnalysis> {
    try {
      // Send only transcription text to backend for analysis
      const analysisResult = await AudioService.uploadTranscriptionOnly(transcription);
      
      // Add timestamp
      const analysis: MedicalAnalysis = {
        ...analysisResult,
        timestamp: new Date().toISOString(),
        transcription,
        chunks,
      };

      // Store analysis locally
      await StorageService.saveAnalysis(analysis);

      return analysis;
      
    } catch (error) {
      console.error('Medical analysis failed:', error);
      throw new Error('Failed to analyze consultation. Please try again.');
    }
  }

  static async analyzeTranscriptionChunk(chunk: TranscriptionChunk): Promise<void> {
    try {
      // For real-time analysis of individual chunks
      // This could be used for immediate alerts or live feedback
      console.log(`🔍 Analyzing chunk: ${chunk.text.substring(0, 30)}...`);
      
      // Store chunk for later full analysis
      await StorageService.saveTranscriptionChunk(chunk);
      
    } catch (error) {
      console.error('Chunk analysis failed:', error);
    }
  }

  static validateAnalysisData(data: any): boolean {
    const requiredFields = [
      'symptoms',
      'differentialDiagnosis', 
      'redFlags',
      'medications',
      'recommendations',
      'summary'
    ];

    return requiredFields.every(field => 
      data.hasOwnProperty(field) && Array.isArray(data[field]) || typeof data[field] === 'string'
    );
  }
}