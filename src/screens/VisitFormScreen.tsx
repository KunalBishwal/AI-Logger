import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { GradientBackground } from '../components/GradientBackground';
import { FormField } from '../components/FormField';
import { Toast, ToastType } from '../components/Toast';
import { storageService } from '../services/storageService';
import { aiService } from '../services/aiService';
import { Visit, OutcomeStatus } from '../types';
import { validateVisit, hasErrors, ValidationErrors } from '../utils/validation';

// Simple unique ID generator (uuid v4 crashes in React Native without crypto polyfill)
const generateId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  const randomPart2 = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${randomPart}-${randomPart2}`;
};

const outcomeOptions: { value: OutcomeStatus; label: string; icon: string }[] = [
  { value: 'interested', label: 'Interested', icon: '👍' },
  { value: 'follow-up needed', label: 'Follow-up Needed', icon: '📅' },
  { value: 'closed-won', label: 'Closed Won', icon: '🎉' },
  { value: 'closed-lost', label: 'Closed Lost', icon: '❌' },
  { value: 'not interested', label: 'Not Interested', icon: '👎' },
];

export const VisitFormScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const editVisitId = route?.params?.visitId;
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const scrollViewRef = useRef<ScrollView>(null);

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

  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [location, setLocation] = useState('');
  const [visitDateTime, setVisitDateTime] = useState(new Date().toISOString());
  const [rawNotes, setRawNotes] = useState('');
  const [outcomeStatus, setOutcomeStatus] = useState<OutcomeStatus | ''>('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [existingVisit, setExistingVisit] = useState<Visit | null>(null);

  useEffect(() => {
    if (editVisitId) {
      loadVisit();
    }
  }, [editVisitId]);

  const loadVisit = async () => {
    const visits = await storageService.getAllVisits();
    const visit = visits.find((v) => v.id === editVisitId);
    if (visit) {
      setExistingVisit(visit);
      setCustomerName(visit.customerName);
      setContactPerson(visit.contactPerson);
      setLocation(visit.location);
      setVisitDateTime(visit.visitDateTime);
      setRawNotes(visit.rawNotes);
      setOutcomeStatus(visit.outcomeStatus);
      setFollowUpDate(visit.followUpDate || '');
    }
  };

  const handleSave = async () => {
    const visitData: Partial<Visit> = {
      customerName: customerName.trim(),
      contactPerson: contactPerson.trim(),
      location: location.trim(),
      visitDateTime,
      rawNotes: rawNotes.trim(),
      outcomeStatus: outcomeStatus as OutcomeStatus,
      followUpDate: followUpDate || undefined,
    };

    const validationErrors = validateVisit(visitData);
    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      showToast('Please fix the errors below', 'warning');
      return;
    }

    setLoading(true);
    try {
      const now = new Date().toISOString();
      const visit: Visit = {
        id: existingVisit?.id || generateId(),
        userId: user!.uid,
        customerName: visitData.customerName!,
        contactPerson: visitData.contactPerson!,
        location: visitData.location!,
        visitDateTime: visitData.visitDateTime!,
        rawNotes: visitData.rawNotes!,
        outcomeStatus: visitData.outcomeStatus!,
        followUpDate: visitData.followUpDate,
        aiSummary: existingVisit?.aiSummary,
        syncStatus: 'draft',
        createdAt: existingVisit?.createdAt || now,
        updatedAt: now,
      };

      await storageService.saveVisit(visit);
      showToast('Visit saved locally!', 'success', 'Pull to refresh on list to sync');
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error) {
      showToast('Failed to save visit', 'error', 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!rawNotes.trim()) {
      showToast('Enter meeting notes first', 'warning');
      return;
    }

    Keyboard.dismiss();
    setAiLoading(true);
    try {
      const summary = await aiService.generateSummary(rawNotes);
      showToast('AI Summary generated!', 'success', summary.meetingSummary.substring(0, 60) + '...');

      // If editing, save with AI summary
      if (existingVisit) {
        existingVisit.aiSummary = summary;
        existingVisit.updatedAt = new Date().toISOString();
        await storageService.saveVisit(existingVisit);
      }
    } catch (error: any) {
      const errorMsg = error?.message || '';
      if (errorMsg.includes('429')) {
        showToast('AI rate limit reached', 'warning', 'Please wait a moment and try again');
      } else {
        showToast('AI generation failed', 'error', 'Check internet and try again');
      }
    } finally {
      setAiLoading(false);
    }
  };

  // Simple date input helper
  const formatDateInput = (text: string, setter: (val: string) => void) => {
    setter(text);
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            >
              <Ionicons name="arrow-back" size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>
              {editVisitId ? 'Edit Visit' : 'New Visit'}
            </Text>
            <View style={{ width: 38 }} />
          </View>

          {/* Form */}
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <FormField
              label="Customer Name"
              placeholder="e.g. Acme Corp"
              value={customerName}
              onChangeText={setCustomerName}
              error={errors.customerName}
            />

            <FormField
              label="Contact Person"
              placeholder="e.g. John Smith"
              value={contactPerson}
              onChangeText={setContactPerson}
              error={errors.contactPerson}
            />

            <FormField
              label="Location"
              placeholder="e.g. 123 Business Ave, NYC"
              value={location}
              onChangeText={setLocation}
              error={errors.location}
            />

            <FormField
              label="Visit Date/Time (YYYY-MM-DDTHH:MM)"
              placeholder="e.g. 2025-03-15T14:30"
              value={visitDateTime.substring(0, 16)}
              onChangeText={(text) => {
                try {
                  setVisitDateTime(text.length >= 16 ? new Date(text).toISOString() : text);
                } catch {
                  setVisitDateTime(text);
                }
              }}
              error={errors.visitDateTime}
            />

            {/* Outcome Status Picker */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>OUTCOME STATUS</Text>
              <View style={styles.outcomeGrid}>
                {outcomeOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setOutcomeStatus(option.value)}
                    style={[
                      styles.outcomeOption,
                      {
                        backgroundColor:
                          outcomeStatus === option.value
                            ? colors.primary + '20'
                            : colors.inputBackground,
                        borderColor:
                          outcomeStatus === option.value
                            ? colors.primary
                            : colors.inputBorder,
                      },
                    ]}
                  >
                    <Text style={styles.optionIcon}>{option.icon}</Text>
                    <Text
                      style={[
                        styles.optionLabel,
                        {
                          color:
                            outcomeStatus === option.value
                              ? colors.primary
                              : colors.textSecondary,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.outcomeStatus && (
                <Text style={[styles.errorText, { color: colors.error }]}>{errors.outcomeStatus}</Text>
              )}
            </View>

            {/* Follow-up date (conditional) */}
            {outcomeStatus === 'follow-up needed' && (
              <FormField
                label="Follow-up Date (YYYY-MM-DD) *"
                placeholder="e.g. 2025-03-20"
                value={followUpDate}
                onChangeText={(text) => formatDateInput(text, setFollowUpDate)}
                error={errors.followUpDate}
              />
            )}

            {/* Meeting Notes */}
            <FormField
              label="Meeting Notes"
              placeholder="Enter your raw meeting notes here... Be detailed for better AI summaries."
              value={rawNotes}
              onChangeText={setRawNotes}
              multiline
              numberOfLines={6}
              error={errors.rawNotes}
              onFocus={() => {
                // Scroll to bottom when notes field is focused
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 300);
              }}
            />

            {/* AI Button */}
            <TouchableOpacity
              onPress={handleGenerateAI}
              disabled={aiLoading || !rawNotes.trim()}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={rawNotes.trim()
                  ? ['rgba(139,92,246,0.15)', 'rgba(124,58,237,0.08)']
                  : ['rgba(100,100,100,0.1)', 'rgba(100,100,100,0.05)']}
                style={[styles.aiButton, { borderColor: rawNotes.trim() ? colors.primary + '40' : colors.cardBorder }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {aiLoading ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Ionicons name="sparkles" size={20} color={rawNotes.trim() ? colors.primary : colors.textMuted} />
                )}
                <Text
                  style={[
                    styles.aiButtonText,
                    { color: rawNotes.trim() ? colors.primary : colors.textMuted },
                  ]}
                >
                  {aiLoading ? 'Generating...' : 'Generate AI Summary'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Save Button */}
          <TouchableOpacity onPress={handleSave} disabled={loading} activeOpacity={0.8}>
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
              style={styles.saveButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={22} color="#FFF" />
                  <Text style={styles.saveButtonText}>Save Visit</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Extra padding for keyboard */}
          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Toast */}
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
  formCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  outcomeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  outcomeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  optionIcon: {
    fontSize: 14,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    marginTop: 4,
  },
  aiButtonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
