import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { GradientBackground } from '../components/GradientBackground';
import { SyncStatusBadge } from '../components/SyncStatusBadge';
import { AISummaryCard } from '../components/AISummaryCard';
import { Toast, ToastType } from '../components/Toast';
import { storageService } from '../services/storageService';
import { syncService } from '../services/syncService';
import { aiService } from '../services/aiService';
import { Visit } from '../types';
import { formatDateTime, formatDate } from '../utils/validation';

export const VisitDetailScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { colors, isDark } = useTheme();
  const { visitId } = route.params;
  const [visit, setVisit] = useState<Visit | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Toast state
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: ToastType;
    subtitle?: string;
  }>({ visible: false, message: '', type: 'success' });

  const showToast = (message: string, type: ToastType, subtitle?: string) => {
    setToast({ visible: true, message, type, subtitle });
  };

  useEffect(() => {
    loadVisit();
  }, [visitId]);

  useEffect(() => {
    if (visit) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [visit]);

  const loadVisit = async () => {
    const visits = await storageService.getAllVisits();
    const found = visits.find((v) => v.id === visitId);
    if (found) {
      setVisit(found);
    }
  };

  const handleSync = async () => {
    if (!visit) return;
    setSyncing(true);
    try {
      const success = await syncService.syncVisit(visit);
      if (success) {
        showToast('Success', 'success', 'Visit synced successfully!');
      } else {
        showToast('Error', 'error', 'Sync failed. Please try again.');
      }
      await loadVisit();
    } catch (error) {
      showToast('Error', 'error', 'Sync failed.');
    } finally {
      setSyncing(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!visit) return;
    setAiLoading(true);
    try {
      const summary = await aiService.generateSummary(visit.rawNotes);
      const updatedVisit: Visit = {
        ...visit,
        aiSummary: summary,
        updatedAt: new Date().toISOString(),
        syncStatus: 'draft',
      };
      await storageService.saveVisit(updatedVisit);
      setVisit(updatedVisit);
      showToast('Success', 'success', 'AI Summary generated!');
    } catch (error: any) {
      const errorMsg = error?.message || '';
      if (errorMsg.includes('429')) {
        showToast('AI rate limit reached', 'warning', 'Please wait a moment and try again');
      } else {
        showToast('Error', 'error', 'Failed to generate AI summary. Please try again.');
      }
    } finally {
      setAiLoading(false);
    }
  };

  if (!visit) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </GradientBackground>
    );
  }

  const InfoRow: React.FC<{ icon: string; label: string; value: string }> = ({
    icon,
    label,
    value,
  }) => (
    <View style={styles.infoRow}>
      <View style={[styles.infoIconBox, { backgroundColor: colors.primary + '15' }]}>
        <Ionicons name={icon as any} size={18} color={colors.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  );

  return (
    <GradientBackground>
      <Animated.ScrollView
        style={[styles.container, { opacity: fadeAnim }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Visit Details</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('VisitForm', { visitId: visit.id })}
            style={[styles.editBtn, { backgroundColor: colors.primary + '20', borderColor: colors.primary + '40' }]}
          >
            <Ionicons name="pencil" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Customer Header Card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.customerHeader}>
            <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {visit.customerName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.customerInfo}>
              <Text style={[styles.customerName, { color: colors.text }]}>
                {visit.customerName}
              </Text>
              <Text style={[styles.contactPerson, { color: colors.textSecondary }]}>
                {visit.contactPerson}
              </Text>
            </View>
            <SyncStatusBadge status={visit.syncStatus} />
          </View>
        </View>

        {/* Visit Info */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Visit Information</Text>
          <InfoRow icon="location-outline" label="Location" value={visit.location} />
          <InfoRow icon="calendar-outline" label="Visit Date" value={formatDateTime(visit.visitDateTime)} />
          <InfoRow
            icon="flag-outline"
            label="Outcome"
            value={visit.outcomeStatus.charAt(0).toUpperCase() + visit.outcomeStatus.slice(1)}
          />
          {visit.followUpDate && (
            <InfoRow icon="alarm-outline" label="Follow-up Date" value={formatDate(visit.followUpDate)} />
          )}
        </View>

        {/* Meeting Notes */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Meeting Notes</Text>
          <Text style={[styles.notesText, { color: colors.textSecondary }]}>
            {visit.rawNotes}
          </Text>
        </View>

        {/* AI Summary */}
        {visit.aiSummary ? (
          <AISummaryCard summary={visit.aiSummary} />
        ) : (
          <TouchableOpacity onPress={handleGenerateAI} disabled={aiLoading} activeOpacity={0.8}>
            <LinearGradient
              colors={['rgba(139,92,246,0.12)', 'rgba(124,58,237,0.06)']}
              style={[styles.generateAiBtn, { borderColor: colors.primary + '30' }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {aiLoading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Ionicons name="sparkles" size={22} color={colors.primary} />
              )}
              <View>
                <Text style={[styles.generateAiTitle, { color: colors.primary }]}>
                  {aiLoading ? 'Generating Summary...' : 'Generate AI Summary'}
                </Text>
                <Text style={[styles.generateAiDesc, { color: colors.textMuted }]}>
                  Analyze meeting notes with AI
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          {(visit.syncStatus === 'draft' || visit.syncStatus === 'failed') && (
            <TouchableOpacity
              onPress={handleSync}
              disabled={syncing}
              style={{ flex: 1 }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.actionButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {syncing ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Ionicons name="cloud-upload-outline" size={20} color="#FFF" />
                )}
                <Text style={styles.actionButtonText}>
                  {visit.syncStatus === 'failed' ? 'Retry Sync' : 'Sync Now'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {visit.aiSummary && (
            <TouchableOpacity
              onPress={handleGenerateAI}
              disabled={aiLoading}
              style={{ flex: 1 }}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.secondaryButton,
                  { borderColor: colors.primary + '40', backgroundColor: colors.primary + '10' },
                ]}
              >
                {aiLoading ? (
                  <ActivityIndicator color={colors.primary} size="small" />
                ) : (
                  <Ionicons name="refresh" size={20} color={colors.primary} />
                )}
                <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
                  Regenerate AI
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 40 }} />
      </Animated.ScrollView>

      {/* Toast */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        subtitle={toast.subtitle}
        onHide={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  editBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  card: {
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    marginBottom: 14,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  contactPerson: {
    fontSize: 14,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 2,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 23,
  },
  generateAiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    gap: 14,
    marginBottom: 14,
  },
  generateAiTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  generateAiDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
