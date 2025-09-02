import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { ConfigService } from './ConfigService';

export class AudioService {
  private static recording: Audio.Recording | null = null;

  static async requestPermissions(): Promise<boolean> {
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  }

  static async startRecording(): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Microphone permission not granted');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        android: {
          extension: '.m4a',
          outputFormat: 2, // MPEG_4
          audioEncoder: 3, // AAC
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: 'mpeg4',
          audioQuality: 127, // Max quality
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
      });
      this.recording = recording;
    } catch (err) {
      console.error('Failed to start recording', err);
      throw new Error('Could not start recording.');
    }
  }

  static async stopRecording(): Promise<string | null> {
    if (!this.recording) {
      return null;
    }

    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;
      return uri;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw new Error('Could not stop recording.');
    }
  }
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
