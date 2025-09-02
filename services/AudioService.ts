import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { ConfigService } from './ConfigService';

export interface TranscriptionChunk {
  text: string;
  timestamp: number;
  duration: number;
}

export class AudioService {
  private static recording: Audio.Recording | null = null;
  private static transcriptionChunks: TranscriptionChunk[] = [];
  private static intervalId: NodeJS.Timeout | null = null;
  private static isProcessing = false;

  static async startContinuousRecording(
    onTranscriptionChunk: (chunk: TranscriptionChunk) => void
  ): Promise<void> {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        throw new Error('Audio recording permission is required');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      this.recording = recording;
      this.transcriptionChunks = [];

      // Process audio chunks every 10 seconds
      this.intervalId = setInterval(async () => {
        await this.processAudioChunk(onTranscriptionChunk);
      }, 10000);

      console.log('🎙️ Started continuous recording with 10s intervals');
      
    } catch (error) {
      console.error('Failed to start continuous recording:', error);
      throw error;
    }
  }

  static async stopContinuousRecording(): Promise<TranscriptionChunk[]> {
    try {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }

      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
        this.recording = null;
      }

      console.log('🛑 Stopped continuous recording');
      return this.transcriptionChunks;
      
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw error;
    }
  }

  private static async processAudioChunk(
    onTranscriptionChunk: (chunk: TranscriptionChunk) => void
  ): Promise<void> {
    if (this.isProcessing || !this.recording) return;

    try {
      this.isProcessing = true;

      // Get current recording status
      const status = await this.recording.getStatusAsync();
      if (!status.isRecording) return;

      // Create a temporary recording segment
      const segmentUri = await this.createAudioSegment();
      if (!segmentUri) return;

      // Transcribe the segment locally (simulated - in real app you'd use a local speech-to-text)
      const transcriptionText = await this.transcribeAudioLocally(segmentUri);
      
      if (transcriptionText.trim()) {
        const chunk: TranscriptionChunk = {
          text: transcriptionText,
          timestamp: Date.now(),
          duration: 10000, // 10 seconds
        };

        this.transcriptionChunks.push(chunk);
        onTranscriptionChunk(chunk);

        console.log(`📝 Transcribed chunk: ${transcriptionText.substring(0, 50)}...`);
      }

      // Clean up temporary file
      await FileSystem.deleteAsync(segmentUri, { idempotent: true });

    } catch (error) {
      console.error('Failed to process audio chunk:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private static async createAudioSegment(): Promise<string | null> {
    try {
      // In a real implementation, you would extract the last 10 seconds of audio
      // For now, we'll simulate this by creating a temporary file reference
      const tempUri = `${FileSystem.documentDirectory}temp_segment_${Date.now()}.m4a`;
      
      // This is a placeholder - in real implementation you'd extract audio segment
      return tempUri;
    } catch (error) {
      console.error('Failed to create audio segment:', error);
      return null;
    }
  }

  private static async transcribeAudioLocally(audioUri: string): Promise<string> {
    // IMPORTANT: This is a simulation for demo purposes
    // In a real app, you would use:
    // 1. expo-speech for basic speech recognition (limited)
    // 2. A local speech-to-text library
    // 3. Or send small chunks to a transcription service
    
    // Simulated transcription responses for demo
    const simulatedResponses = [
      "Paciente relata dor de cabeça há 3 dias",
      "Febre de 38.5°C desde ontem à noite",
      "Náuseas e vômitos ocasionais",
      "Histórico de enxaqueca na família",
      "Tomou paracetamol sem melhora",
      "Dor localizada na região temporal",
      "Sensibilidade à luz aumentada",
      "Pressão arterial normal",
      "Exame neurológico sem alterações",
      "Recomendado retorno em 48 horas"
    ];

    // Return a random simulated response
    const randomIndex = Math.floor(Math.random() * simulatedResponses.length);
    return simulatedResponses[randomIndex];
  }

  static async uploadTranscriptionOnly(transcriptionText: string): Promise<any> {
    try {
      const config = await ConfigService.getConfig();
      
      const response = await fetch(`${config.serverUrl}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcription: transcriptionText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      return await response.json();
      
    } catch (error) {
      console.error('Transcription upload failed:', error);
      throw new Error('Failed to send transcription for analysis. Please check your connection.');
    }
  }

  static async validateAudioPermissions(): Promise<boolean> {
    try {
      const permission = await Audio.requestPermissionsAsync();
      return permission.status === 'granted';
    } catch (error) {
      console.error('Permission validation failed:', error);
      return false;
    }
  }

  static combineTranscriptionChunks(chunks: TranscriptionChunk[]): string {
    return chunks
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(chunk => chunk.text)
      .join(' ');
  }
}