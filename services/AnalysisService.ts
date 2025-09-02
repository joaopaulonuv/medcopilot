import { ConfigService } from './ConfigService';
import { StorageService } from './StorageService';

export interface MedicalAnalysis {
  symptoms: string[];
  differentialDiagnosis: string[];
  redFlags: string[];
  medications: string[];
  recommendations: string[];
  summary: string;
  transcription: string;
  timestamp: string;
}

export class AnalysisService {
  static async analyzeMedicalConsultation(transcription: string): Promise<MedicalAnalysis> {
    try {
      const config = await ConfigService.getConfig();

      const response = await fetch(`${config.serverUrl}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const analysis: MedicalAnalysis = await response.json();
      
      // Add timestamp
      analysis.timestamp = new Date().toISOString();
      analysis.transcription = transcription;

      // Store analysis locally
      await StorageService.saveAnalysis(analysis);

      return analysis;
      
    } catch (error) {
      console.error('Medical analysis failed:', error);
      throw new Error('Failed to analyze consultation. Please try again.');
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