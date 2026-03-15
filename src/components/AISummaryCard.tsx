import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { AISummary } from '../types';

interface AISummaryCardProps {
  summary: AISummary;
}

export const AISummaryCard: React.FC<AISummaryCardProps> = ({ summary }) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { borderColor: colors.primary + '30' }]}>
      <LinearGradient
        colors={isDark
          ? ['rgba(139, 92, 246, 0.12)', 'rgba(124, 58, 237, 0.05)']
          : ['rgba(139, 92, 246, 0.08)', 'rgba(124, 58, 237, 0.02)']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <Ionicons name="sparkles" size={20} color={colors.primary} />
          <Text style={[styles.headerText, { color: colors.primary }]}>AI Summary</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Meeting Summary</Text>
          <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
            {summary.meetingSummary}
          </Text>
        </View>

        {summary.painPoints.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Pain Points</Text>
            {summary.painPoints.map((point, index) => (
              <View key={index} style={styles.listItem}>
                <View style={[styles.bullet, { backgroundColor: colors.error }]} />
                <Text style={[styles.listText, { color: colors.textSecondary }]}>{point}</Text>
              </View>
            ))}
          </View>
        )}

        {summary.actionItems.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Action Items</Text>
            {summary.actionItems.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
                <Text style={[styles.listText, { color: colors.textSecondary }]}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommended Next Step</Text>
          <View style={[styles.nextStepBox, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
            <Ionicons name="arrow-forward-circle" size={18} color={colors.primary} />
            <Text style={[styles.nextStepText, { color: colors.text }]}>
              {summary.recommendedNextStep}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginVertical: 12,
  },
  gradient: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 22,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
  },
  nextStepBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
  },
  nextStepText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
  },
});
