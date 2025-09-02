import * as FileSystem from 'expo-file-system';
import { ConfigService } from './ConfigService';

export class AudioService {
  static async uploadAndTranscribe(audioUri: string): Promise<string> {
    try {
      const config = await ConfigService.getConfig();
      
      // Read the audio file
      const audioInfo = await FileSystem.getInfoAsync(audioUri);
      if (!audioInfo.exists) {
        throw new Error('Audio file not found');
      }

      // Create form data for multipart upload
      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);

      const response = await fetch(`${config.serverUrl}/api/transcribe`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Transcription failed');
      }

      const result = await response.json();
      return result.transcription;
      
    } catch (error) {
      console.error('Audio upload failed:', error);
      throw new Error('Failed to transcribe audio. Please check your connection and try again.');
    }
  }

  static async validateAudioFile(audioUri: string): Promise<boolean> {
    try {
      const info = await FileSystem.getInfoAsync(audioUri);
      
      if (!info.exists) {
        return false;
      }

      // Check file size (max 25MB)
      if (info.size && info.size > 25 * 1024 * 1024) {
        throw new Error('Audio file too large. Maximum size is 25MB.');
      }

      return true;
    } catch (error) {
      console.error('Audio validation failed:', error);
      return false;
    }
  }
}