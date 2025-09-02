import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ResultCardProps {
  title: string;
  icon: React.ReactNode;
  content: string | string[];
  type: 'summary' | 'list' | 'alert';
}

export function ResultCard({ title, icon, content, type }: ResultCardProps) {
  const getCardStyle = () => {
    switch (type) {
      case 'alert':
        return [styles.card, styles.alertCard];
      case 'summary':
        return [styles.card, styles.summaryCard];
      default:
        return styles.card;
    }
  };

  const renderContent = () => {
    if (Array.isArray(content)) {
      return (
        <View style={styles.listContainer}>
          {content.map((item, index) => (
            <View key={index} style={styles.listItem}>
              <View style={[
                styles.listBullet,
                { backgroundColor: type === 'alert' ? '#DC2626' : '#2563EB' }
              ]} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>
      );
    }

    return <Text style={styles.contentText}>{content}</Text>;
  };

  return (
    <View style={getCardStyle()}>
      <View style={styles.cardHeader}>
        {icon}
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {renderContent()}
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
  alertCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  summaryCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 10,
  },
  contentText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  listContainer: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  listBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    marginRight: 12,
  },
  listText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    flex: 1,
  },
});