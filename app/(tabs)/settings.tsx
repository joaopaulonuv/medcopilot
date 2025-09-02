import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Settings as SettingsIcon,
  Server,
  Shield,
  Mic,
  Bell,
  Info,
  Save,
} from 'lucide-react-native';
import { ConfigService } from '../../services/ConfigService';

export default function SettingsScreen() {
  const [serverUrl, setServerUrl] = useState('https://ecuador-authority-meal-simplified.trycloudflare.com');
  const [autoAnalysis, setAutoAnalysis] = useState(true);
  const [highQualityAudio, setHighQualityAudio] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const saveSettings = async () => {
    try {
      await ConfigService.saveConfig({
        serverUrl,
        autoAnalysis,
        highQualityAudio,
        notifications,
      });
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const SettingRow = ({ 
    icon, 
    title, 
    subtitle, 
    children 
  }: { 
    icon: React.ReactNode; 
    title: string; 
    subtitle?: string; 
    children: React.ReactNode;
  }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <View style={styles.settingIcon}>{icon}</View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#F8FAFC', '#E2E8F0']} style={styles.gradient}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
            <Save size={16} color="#2563EB" />
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          
          {/* Server Configuration */}
          <SettingSection title="Server Configuration">
            <SettingRow
              icon={<Server size={20} color="#2563EB" />}
              title="Backend URL"
              subtitle="API endpoint for audio analysis">
              <TextInput
                style={styles.textInput}
                value={serverUrl}
                onChangeText={setServerUrl}
                placeholder="https://ecuador-authority-meal-simplified.trycloudflare.com"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </SettingRow>
          </SettingSection>

          {/* Audio Settings */}
          <SettingSection title="Audio Settings">
            <SettingRow
              icon={<Mic size={20} color="#059669" />}
              title="High Quality Audio"
              subtitle="Better transcription accuracy, larger file size">
              <Switch
                value={highQualityAudio}
                onValueChange={setHighQualityAudio}
                trackColor={{ false: '#D1D5DB', true: '#DBEAFE' }}
                thumbColor={highQualityAudio ? '#2563EB' : '#F3F4F6'}
              />
            </SettingRow>
            
            <SettingRow
              icon={<Shield size={20} color="#7C3AED" />}
              title="Auto Analysis"
              subtitle="Automatically analyze after recording">
              <Switch
                value={autoAnalysis}
                onValueChange={setAutoAnalysis}
                trackColor={{ false: '#D1D5DB', true: '#DBEAFE' }}
                thumbColor={autoAnalysis ? '#2563EB' : '#F3F4F6'}
              />
            </SettingRow>
          </SettingSection>

          {/* Notifications */}
          <SettingSection title="Notifications">
            <SettingRow
              icon={<Bell size={20} color="#EA580C" />}
              title="Analysis Complete"
              subtitle="Get notified when AI analysis is ready">
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#D1D5DB', true: '#DBEAFE' }}
                thumbColor={notifications ? '#2563EB' : '#F3F4F6'}
              />
            </SettingRow>
          </SettingSection>

          {/* Privacy Information */}
          <View style={styles.privacyCard}>
            <View style={styles.privacyHeader}>
              <Info size={20} color="#0891B2" />
              <Text style={styles.privacyTitle}>Privacy & Security</Text>
            </View>
            <Text style={styles.privacyText}>
              • All audio recordings are processed securely{'\n'}
              • No personal data is stored permanently{'\n'}
              • Transcriptions are deleted after analysis{'\n'}
              • LGPD and HIPAA compliant processing{'\n'}
              • End-to-end encryption in production
            </Text>
          </View>

          {/* Version Info */}
          <View style={styles.versionCard}>
            <Text style={styles.versionText}>Medical AI Assistant v1.0.0</Text>
            <Text style={styles.versionSubtext}>Built with OpenAI Whisper & GPT</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
    marginLeft: 6,
  },
  content: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 18,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1E293B',
    minWidth: 120,
  },
  privacyCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    marginBottom: 20,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    marginLeft: 8,
  },
  privacyText: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
  },
  versionCard: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  versionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 14,
    color: '#64748B',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
  },
});