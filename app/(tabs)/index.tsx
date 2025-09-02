import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Audio } from 'expo-av';
import { Mic, Square, Play, Pause, Upload, Clock } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { AudioService } from '../../services/AudioService';
import { AnalysisService } from '../../services/AnalysisService';

const { width } = Dimensions.get('window');

export default function RecordScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.7);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  useEffect(() => {
    if (isRecording) {
      scale.value = withRepeat(
        withTiming(1.2, { duration: 1000 }),
        -1,
        true
      );
      opacity.value = withRepeat(
        withTiming(1, { duration: 1000 }),
        -1,
        true
      );
    } else {
      scale.value = withTiming(1);
      opacity.value = withTiming(0.7);
    }
  }, [isRecording]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission required', 'Audio recording permission is needed');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setRecordedUri(null);
    } catch (error) {
      console.error('Failed to start recording', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      
      const uri = recording.getURI();
      setRecordedUri(uri);
      setRecording(null);

      const status = await recording.getStatusAsync();
      if (status.isLoaded) {
        setDuration(status.durationMillis || 0);
      }
    } catch (error) {
      console.error('Failed to stop recording', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const playRecording = async () => {
    if (!recordedUri) return;

    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordedUri },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('Failed to play recording', error);
      Alert.alert('Error', 'Failed to play recording');
    }
  };

  const stopPlayback = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  };

  const uploadAndAnalyze = async () => {
    if (!recordedUri) {
      Alert.alert('No recording', 'Please record audio first');
      return;
    }

    setIsUploading(true);
    try {
      // Upload audio and get transcription
      const transcription = await AudioService.uploadAndTranscribe(recordedUri);
      
      // Analyze transcription
      const analysis = await AnalysisService.analyzeMedicalConsultation(transcription);
      
      Alert.alert('Success', 'Analysis completed! Check the Results tab.');
    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert('Error', 'Failed to analyze audio. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatDuration = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F8FAFC', '#E2E8F0']}
        style={styles.gradient}>
        
        <ScrollView contentContainerStyle={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Medical Consultation</Text>
            <Text style={styles.subtitle}>
              Record and analyze patient conversations with AI
            </Text>
          </View>

          {/* Recording Status */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: isRecording ? '#DC2626' : '#64748B' }
              ]} />
              <Text style={styles.statusText}>
                {isRecording ? 'Recording in progress...' : 'Ready to record'}
              </Text>
            </View>
            {duration > 0 && (
              <View style={styles.durationContainer}>
                <Clock size={16} color="#64748B" />
                <Text style={styles.durationText}>
                  Duration: {formatDuration(duration)}
                </Text>
              </View>
            )}
          </View>

          {/* Recording Button */}
          <View style={styles.recordingSection}>
            <Animated.View style={[styles.recordButton, animatedStyle]}>
              <TouchableOpacity
                style={[
                  styles.recordButtonInner,
                  { backgroundColor: isRecording ? '#DC2626' : '#2563EB' }
                ]}
                onPress={isRecording ? stopRecording : startRecording}
                disabled={isUploading}>
                
                {isRecording ? (
                  <Square size={40} color="white" fill="white" />
                ) : (
                  <Mic size={40} color="white" />
                )}
              </TouchableOpacity>
            </Animated.View>
            
            <Text style={styles.recordButtonText}>
              {isRecording ? 'Tap to stop recording' : 'Tap to start recording'}
            </Text>
          </View>

          {/* Playback Controls */}
          {recordedUri && (
            <View style={styles.playbackSection}>
              <Text style={styles.sectionTitle}>Review Recording</Text>
              <View style={styles.playbackControls}>
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={isPlaying ? stopPlayback : playRecording}>
                  {isPlaying ? (
                    <Pause size={20} color="#2563EB" />
                  ) : (
                    <Play size={20} color="#2563EB" />
                  )}
                  <Text style={styles.playButtonText}>
                    {isPlaying ? 'Stop' : 'Play'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Upload Section */}
          {recordedUri && (
            <View style={styles.uploadSection}>
              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  { opacity: isUploading ? 0.6 : 1 }
                ]}
                onPress={uploadAndAnalyze}
                disabled={isUploading}>
                
                <Upload size={20} color="white" />
                <Text style={styles.uploadButtonText}>
                  {isUploading ? 'Analyzing...' : 'Analyze with AI'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Privacy Notice */}
          <View style={styles.privacyCard}>
            <Text style={styles.privacyTitle}>🔒 Privacy & Security</Text>
            <Text style={styles.privacyText}>
              All audio is processed securely and deleted after analysis. 
              No personal data is stored permanently.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  gradient: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  durationText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8,
  },
  recordingSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  recordButton: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  recordButtonInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordButtonText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  playbackSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  playbackControls: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
    marginLeft: 8,
  },
  uploadSection: {
    marginBottom: 30,
  },
  uploadButton: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  uploadButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginLeft: 12,
  },
  privacyCard: {
    backgroundColor: '#FEF7FF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 14,
    color: '#6B46C1',
    lineHeight: 20,
  },
});