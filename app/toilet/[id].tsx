import { View, Text, Pressable, StyleSheet, ScrollView, Linking, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Colors, Spacing, BorderRadius, TouchTarget } from '@/constants/colors';
import type { Toilet } from '@/lib/types';

// Mock data lookup (replace with Firestore query)
const MOCK_TOILETS: Record<string, Toilet> = {
  '1': {
    id: '1',
    coordinates: { latitude: 28.6139, longitude: 77.2090 },
    geohash: 'ttnfv',
    status: 'open',
    lastConfirmed: new Date(),
    isAccessible: true,
    reportCount: 5,
  },
  '2': {
    id: '2',
    coordinates: { latitude: 28.6129, longitude: 77.2295 },
    geohash: 'ttnfv',
    status: 'closed',
    lastConfirmed: new Date(Date.now() - 3600000),
    isAccessible: false,
    reportCount: 2,
  },
  '3': {
    id: '3',
    coordinates: { latitude: 28.6200, longitude: 77.2100 },
    geohash: 'ttnfv',
    status: 'unknown',
    lastConfirmed: new Date(Date.now() - 86400000),
    isAccessible: true,
    reportCount: 0,
  },
};

/**
 * Toilet Detail Screen
 * Form sheet showing toilet status, last confirmed time, and route button
 */
export default function ToiletDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toilet = MOCK_TOILETS[id || '1'];

  if (!toilet) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Toilet not found</Text>
      </View>
    );
  }

  const getStatusColor = () => {
    switch (toilet.status) {
      case 'open': return Colors.open;
      case 'closed': return Colors.closed;
      default: return Colors.unknown;
    }
  };

  const getStatusLabel = () => {
    switch (toilet.status) {
      case 'open': return 'Open';
      case 'closed': return 'Closed';
      default: return 'Unknown';
    }
  };

  const getTimeSince = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const handleRoute = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const { latitude, longitude } = toilet.coordinates;
    const scheme = Platform.select({
      ios: `maps://app?daddr=${latitude},${longitude}`,
      android: `google.navigation:q=${latitude},${longitude}`,
    });

    if (scheme) {
      Linking.openURL(scheme);
    }
  };

  const handleUpdateStatus = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.selectionAsync();
    }
    router.push('/report');
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
        <Image
          source={{ uri: toilet.status === 'open' 
            ? 'sf:checkmark.circle.fill' 
            : toilet.status === 'closed' 
              ? 'sf:xmark.circle.fill' 
              : 'sf:questionmark.circle.fill' 
          }}
          style={styles.statusIcon}
          tintColor="#FFFFFF"
        />
        <Text style={styles.statusText}>{getStatusLabel()}</Text>
      </View>

      {/* Info Grid */}
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Last confirmed</Text>
          <Text style={styles.infoValue}>{getTimeSince(toilet.lastConfirmed)}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Reports</Text>
          <Text style={[styles.infoValue, { fontVariant: ['tabular-nums'] }]}>
            {toilet.reportCount}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Accessible</Text>
          <Text style={styles.infoValue}>{toilet.isAccessible ? 'Yes' : 'No'}</Text>
        </View>
      </View>

      {/* Route Button */}
      <Pressable style={styles.routeButton} onPress={handleRoute}>
        <Image
          source={{ uri: 'sf:arrow.triangle.turn.up.right.diamond.fill' }}
          style={styles.routeIcon}
          tintColor="#FFFFFF"
        />
        <Text style={styles.routeText}>Get Directions</Text>
      </Pressable>

      {/* Update Status Button */}
      <Pressable style={styles.updateButton} onPress={handleUpdateStatus}>
        <Text style={styles.updateText}>Update Status</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  statusIcon: {
    width: 24,
    height: 24,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderCurve: 'continuous',
  },
  infoItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  infoValue: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
  },
  routeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    width: '100%',
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    borderCurve: 'continuous',
  },
  routeIcon: {
    width: 24,
    height: 24,
  },
  routeText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  updateButton: {
    width: '100%',
    height: TouchTarget.min,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateText: {
    fontSize: 17,
    color: Colors.primary,
  },
});
