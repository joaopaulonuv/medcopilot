import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FileText, TriangleAlert as AlertTriangle, Activity, Pill, Download, RefreshCw } from 'lucide-react-native';
import { StorageService } from '../../services/StorageService';
import { ResultCard } from '../../components/ResultCard';
import { TimelineCard } from '../../components/TimelineCard';

interface MedicalAnalysis {
  symptoms: string[];
  differentialDiagnosis: string[];
  redFlags: string[];
  medications: string[];
  recommendations: string[];
  summary: string;
  transcription: string;
  timestamp: string;
}

export default function ResultsScreen() {
  const [analysis, setAnalysis] = useState<MedicalAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLatestAnalysis();
  }, []);

  const loadLatestAnalysis = async () => {
    setIsLoading(true);
    try {
      const latestAnalysis = await StorageService.getLatestAnalysis();
      setAnalysis(latestAnalysis);
    } catch (error) {
      console.error('Failed to load analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportAnalysis = async () => {
    if (!analysis) return;
    
    try {
      await StorageService.exportAnalysis(analysis);
      Alert.alert('Success', 'Analysis exported successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to export analysis');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#F8FAFC', '#E2E8F0']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <RefreshCw size={40} color="#2563EB" />
            <Text style={styles.loadingText}>Loading analysis...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!analysis) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#F8FAFC', '#E2E8F0']} style={styles.gradient}>
          <View style={styles.emptyContainer}>
            <FileText size={60} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No Analysis Available</Text>
            <Text style={styles.emptySubtitle}>
              Record a consultation to see AI analysis results here
            </Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#F8FAFC', '#E2E8F0']} style={styles.gradient}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Clinical Analysis</Text>
          <Text style={styles.timestamp}>
            {new Date(analysis.timestamp).toLocaleString()}
          </Text>
          
          <TouchableOpacity style={styles.exportButton} onPress={exportAnalysis}>
            <Download size={16} color="#2563EB" />
            <Text style={styles.exportButtonText}>Export</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          
          {/* Summary Card */}
          <ResultCard
            title="Executive Summary"
            icon={<FileText size={20} color="#2563EB" />}
            content={analysis.summary}
            type="summary"
          />

          {/* Red Flags */}
          {analysis.redFlags.length > 0 && (
            <ResultCard
              title="🚨 Critical Alerts"
              icon={<AlertTriangle size={20} color="#DC2626" />}
              content={analysis.redFlags}
              type="alert"
            />
          )}

          {/* Symptoms */}
          <ResultCard
            title="Reported Symptoms"
            icon={<Activity size={20} color="#059669" />}
            content={analysis.symptoms}
            type="list"
          />

          {/* Differential Diagnosis */}
          <ResultCard
            title="Differential Diagnosis"
            icon={<FileText size={20} color="#7C3AED" />}
            content={analysis.differentialDiagnosis}
            type="list"
          />

          {/* Medications */}
          {analysis.medications.length > 0 && (
            <ResultCard
              title="Medications Mentioned"
              icon={<Pill size={20} color="#EA580C" />}
              content={analysis.medications}
              type="list"
            />
          )}

          {/* Recommendations */}
          <ResultCard
            title="Clinical Recommendations"
            icon={<FileText size={20} color="#0891B2" />}
            content={analysis.recommendations}
            type="list"
          />

          {/* Timeline */}
          <TimelineCard
            transcription={analysis.transcription}
            symptoms={analysis.symptoms}
          />

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
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: '#64748B',
    marginRight: 12,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
    marginLeft: 4,
  },
  content: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 100,
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