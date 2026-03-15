import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { SyncStatus } from '../types';

interface SyncStatusBadgeProps {
  status: SyncStatus;
}

const statusConfig: Record<SyncStatus, { label: string; colorKey: string; icon: string }> = {
  draft: { label: 'Draft', colorKey: 'statusDraft', icon: '📝' },
  syncing: { label: 'Syncing', colorKey: 'statusSyncing', icon: '🔄' },
  synced: { label: 'Synced', colorKey: 'statusSynced', icon: '✅' },
  failed: { label: 'Failed', colorKey: 'statusFailed', icon: '❌' },
};

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({ status }) => {
  const { colors } = useTheme();
  const config = statusConfig[status];
  const statusColor = (colors as any)[config.colorKey];

  return (
    <View style={[styles.badge, { backgroundColor: statusColor + '20', borderColor: statusColor + '50' }]}>
      <Text style={styles.icon}>{config.icon}</Text>
      <Text style={[styles.label, { color: statusColor }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  icon: {
    fontSize: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
