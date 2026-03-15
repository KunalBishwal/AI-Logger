import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { GradientBackground } from '../components/GradientBackground';
import { SyncStatusBadge } from '../components/SyncStatusBadge';
import { Toast, ToastType } from '../components/Toast';
import { storageService } from '../services/storageService';
import { syncService } from '../services/syncService';
import { Visit } from '../types';
import { formatDateTime } from '../utils/validation';

const AnimatedCard: React.FC<{
  item: Visit;
  index: number;
  onPress: () => void;
  colors: any;
}> = ({ item, index, onPress, colors }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const summaryPreview =
    item.aiSummary?.meetingSummary?.substring(0, 80) ||
    item.rawNotes?.substring(0, 80) ||
    'No notes';

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.cardBorder },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {item.customerName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.cardHeaderInfo}>
              <Text style={[styles.customerName, { color: colors.text }]} numberOfLines={1}>
                {item.customerName}
              </Text>
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
                <Text style={[styles.dateText, { color: colors.textMuted }]}>
                  {formatDateTime(item.visitDateTime)}
                </Text>
              </View>
            </View>
          </View>
          <SyncStatusBadge status={item.syncStatus} />
        </View>

        <Text style={[styles.summaryPreview, { color: colors.textSecondary }]} numberOfLines={2}>
          {summaryPreview}...
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.locationText, { color: colors.textMuted }]} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
          {item.aiSummary && (
            <View style={[styles.aiBadge, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="sparkles" size={12} color={colors.primary} />
              <Text style={[styles.aiBadgeText, { color: colors.primary }]}>AI</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const VisitListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);

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

  const loadVisits = useCallback(async () => {
    const allVisits = await storageService.getAllVisits();
    const userVisits = allVisits
      .filter((v) => v.userId === user?.uid)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    setVisits(userVisits);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadVisits();
    }, [loadVisits])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    setSyncing(true);
    try {
      const allVisits = await storageService.getAllVisits();
      const userVisits = allVisits.filter((v) => v.userId === user?.uid);
      const result = await syncService.syncAllUnsynced(userVisits);
      if (result.synced > 0 || result.failed > 0) {
        showToast(
          'Sync Complete',
          result.failed > 0 ? 'warning' : 'success',
          `Synced: ${result.synced}, Failed: ${result.failed}`
        );
      }
    } catch (error) {
      console.error('Sync error:', error);
      showToast('Sync Error', 'error', 'An error occurred during sync.');
    } finally {
      setSyncing(false);
      await loadVisits();
      setRefreshing(false);
    }
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.primary + '15' }]}>
        <Ionicons name="document-text-outline" size={48} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No visits yet</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Tap the + button to log your first customer visit
      </Text>
    </View>
  );

  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Visits</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {visits.length} {visits.length === 1 ? 'visit' : 'visits'} logged
            </Text>
          </View>
          {syncing && <ActivityIndicator color={colors.primary} />}
        </View>

        {/* List */}
        <FlatList
          data={visits}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <AnimatedCard
              item={item}
              index={index}
              colors={colors}
              onPress={() => navigation.navigate('VisitDetail', { visitId: item.id })}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            visits.length === 0 && styles.emptyList,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />

        {/* FAB */}
        <TouchableOpacity
          onPress={() => navigation.navigate('VisitForm')}
          activeOpacity={0.8}
          style={styles.fabContainer}
        >
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            style={styles.fab}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="add" size={28} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

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
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardHeaderInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  dateText: {
    fontSize: 12,
  },
  summaryPreview: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  locationText: {
    fontSize: 12,
    flex: 1,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});
