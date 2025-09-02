import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Clock, MessageCircle } from 'lucide-react-native';

interface TimelineCardProps {
  transcription: string;
  symptoms: string[];
}

export function TimelineCard({ transcription, symptoms }: TimelineCardProps) {
  // Simulate timeline events based on transcription
  const timelineEvents = React.useMemo(() => {
    const sentences = transcription.split('.').filter(s => s.trim().length > 0);
    return sentences.slice(0, 5).map((sentence, index) => ({
      time: `${String(index * 2 + 1).padStart(2, '0')}:${String(index * 15).padStart(2, '0')}`,
      text: sentence.trim(),
      isSymptom: symptoms.some(symptom => 
        sentence.toLowerCase().includes(symptom.toLowerCase())
      ),
    }));
  }, [transcription, symptoms]);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Clock size={20} color="#0891B2" />
        <Text style={styles.cardTitle}>Consultation Timeline</Text>
      </View>
      
      <ScrollView style={styles.timelineContainer} showsVerticalScrollIndicator={false}>
        {timelineEvents.map((event, index) => (
          <View key={index} style={styles.timelineItem}>
            <View style={styles.timelineLeft}>
              <Text style={styles.timeText}>{event.time}</Text>
              <View style={[
                styles.timelineDot,
                { backgroundColor: event.isSymptom ? '#DC2626' : '#2563EB' }
              ]} />
            </View>
            
            <View style={[
              styles.timelineContent,
              event.isSymptom && styles.symptomContent
            ]}>
              <View style={styles.messageHeader}>
                <MessageCircle size={14} color="#64748B" />
                <Text style={styles.messageLabel}>
                  {event.isSymptom ? 'Symptom Mentioned' : 'Conversation'}
                </Text>
              </View>
              <Text style={styles.messageText}>{event.text}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 10,
  },
  timelineContainer: {
    maxHeight: 300,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 60,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  symptomContent: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 6,
  },
  messageText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});