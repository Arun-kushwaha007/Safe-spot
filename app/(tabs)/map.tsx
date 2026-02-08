import { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { Colors, Spacing, BorderRadius, TouchTarget } from '@/constants/colors';
import type { Toilet, MapRegion } from '@/lib/types';
import { fetchToilets } from '@/lib/overpass';
import { addToiletToFirestore } from '@/lib/firestore';
import { initDatabase, loadToiletsFromCache, saveToiletsToCache } from '@/lib/db';
import { logEvent, Events } from '@/lib/analytics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Main Map Screen
 * Full-screen map with toilet pins and floating action button
 */
export default function MapScreen() {
  const router = useRouter();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [toilets, setToilets] = useState<Toilet[]>([]);
  const [region, setRegion] = useState<MapRegion>({
    latitude: 28.6139,
    longitude: 77.2090,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Animation for FAB
  const fabScale = useSharedValue(1);
  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  // Request location permission and get current position
  useEffect(() => {
    (async () => {
      // Initialize DB and load cache
      await initDatabase();
      const cachedToilets = await loadToiletsFromCache();
      if (cachedToilets.length > 0) {
        setToilets(prev => [...prev, ...cachedToilets]);
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Required',
          'Please enable location to find nearby bathrooms.',
          [{ text: 'OK' }]
        );
        setIsLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setLocation(currentLocation);
      setRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
      setIsLoading(false);
    })();
  }, []);

  // Fetch real data when region changes (debounced)
  useEffect(() => {
    if (!region) return;

    const loadToilets = async () => {
      // Don't fetch if zoomed out too far to save data
      if (region.latitudeDelta > 0.1) return;

      const data = await fetchToilets(region);
      
      // Save valid data to cache
      if (data.length > 0) {
        saveToiletsToCache(data);
      }

      setToilets(prev => {
        // Simple deduplication based on ID
        const newIds = new Set(data.map((t: any) => t.id));
        const filteredPrev = prev.filter(t => !newIds.has(t.id));
        return [...filteredPrev, ...data];
      });
    };

    const timeoutId = setTimeout(loadToilets, 1000); // 1s debounce
    return () => clearTimeout(timeoutId);
  }, [region.latitude, region.longitude, region.latitudeDelta]);

  // Handle pin press with haptics
  const handlePinPress = useCallback((toilet: Toilet) => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({
      pathname: '/toilet/[id]',
      params: { id: toilet.id, data: JSON.stringify(toilet) } // Pass data to avoid re-fetch logic for now
    });
  }, [router]);

  // Handle FAB press
  const handleReportPress = useCallback(() => {
    fabScale.value = withSpring(0.9, {}, () => {
      fabScale.value = withSpring(1);
    });
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/report');
  }, [router, fabScale]);

  // Helper to determine effective status based on decay
  const getVisualStatus = (toilet: Toilet) => {
    try {
      const now = Date.now();
      let confirmTime = 0;
      const { lastConfirmed } = toilet;

      if (!lastConfirmed) return 'unknown';

      if (lastConfirmed instanceof Date) {
        confirmTime = lastConfirmed.getTime();
      } else if (typeof lastConfirmed === 'string') {
        confirmTime = new Date(lastConfirmed).getTime();
      } else if (typeof lastConfirmed === 'object' && 'seconds' in lastConfirmed) {
        // Firestore Timestamp or similar
        confirmTime = (lastConfirmed as any).seconds * 1000;
      }

      // 6 hours = 21,600,000 ms
      // If older than 6 hours, treat as unknown
      if (now - confirmTime > 21600000) {
        return 'unknown';
      }
      return toilet.status;
    } catch (e) {
      return 'unknown';
    }
  };

  // Get pin color based on status
  const getPinColor = (status: Toilet['status']) => {
    switch (status) {
      case 'open': return Colors.open;
      case 'closed': return Colors.closed;
      default: return Colors.unknown;
    }
  };

  // Calculate nearest toilet
  const [nearestToilet, setNearestToilet] = useState<{ toilet: Toilet; distance: number } | null>(null);

  useEffect(() => {
    if (!location || toilets.length === 0) return;

    let minDist = Infinity;
    let nearest = null;

    toilets.forEach(t => {
      // Simple Haversine approximation
      const R = 6371e3; // metres
      const φ1 = location.coords.latitude * Math.PI/180;
      const φ2 = t.coordinates.latitude * Math.PI/180;
      const Δφ = (t.coordinates.latitude - location.coords.latitude) * Math.PI/180;
      const Δλ = (t.coordinates.longitude - location.coords.longitude) * Math.PI/180;

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const d = R * c;

      if (d < minDist) {
        minDist = d;
        nearest = t;
      }
    });

    if (nearest) {
      setNearestToilet({ toilet: nearest, distance: Math.round(minDist) });
    }
  }, [location, toilets]);

  const handleLongPress = async (e: any) => {
    const { coordinate } = e.nativeEvent;
    
    // Create a new toilet object
    const newToiletData = {
      coordinates: coordinate,
      status: 'open' as const, // Default to open
      isAccessible: false, // Default
    };

    const tempId = `temp-${Date.now()}`;
    const newToilet: Toilet = {
      id: tempId,
      ...newToiletData,
      geohash: 'pending',
      lastConfirmed: new Date(),
      reportCount: 1,
    };

    // 1. Optimistic Update (Immediate Feedback)
    setToilets(prev => [...prev, newToilet]);
    saveToiletsToCache([newToilet]);
    logEvent(Events.TOILET_ADDED, { location: newToilet.coordinates });

    if (process.env.EXPO_OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    Alert.alert(
      'Bathroom Added',
      'Thank you for contributing! This location is now visible locally.',
      [{ text: 'OK' }]
    );

    try {
      // 2. Add to Firestore
      const realId = await addToiletToFirestore(newToiletData);

      // 3. Update ID in state
      setToilets(prev => prev.map(t => t.id === tempId ? { ...t, id: realId } : t));
    } catch (error) {
      console.error('Failed to add toilet:', error);
      // 4. Rollback
      setToilets(prev => prev.filter(t => t.id !== tempId));
      Alert.alert('Error', 'Could not save location to cloud. Reverting...');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Finding your location...</Text>
      </View>
    );
  }


  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        mapPadding={{ top: 0, right: 0, bottom: 100, left: 0 }}
        onLongPress={handleLongPress}
      >
        {toilets.map((toilet) => {
          const visualStatus = getVisualStatus(toilet);
          return (
            <Marker
              key={toilet.id}
              coordinate={toilet.coordinates}
              onPress={() => handlePinPress(toilet)}
              tracksViewChanges={false}
              opacity={visualStatus === 'unknown' ? 0.6 : 1} // Fade out stale pins
            >
              <View style={styles.pinContainer}>
                <View style={[styles.pin, { backgroundColor: getPinColor(visualStatus) }]}>
                  <Text style={{ fontSize: 12 }}>
                     {visualStatus === 'open' ? '🚽' : visualStatus === 'closed' ? '❌' : '?'}
                  </Text>
                </View>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Nearest Toilet Indicator */}
      {nearestToilet && (
        <View style={styles.nearestContainer}>
          <Text style={styles.nearestLabel}>Nearest Bathroom</Text>
          <View style={styles.nearestRow}>
            <Ionicons name="walk" size={20} color={Colors.primary} />
            <Text style={styles.nearestValue}>{nearestToilet.distance}m</Text>
          </View>
        </View>
      )}

      {/* My Location Button */}
      <Pressable 
        style={styles.locationButton}
        onPress={async () => {
          if (location) {
            const newRegion = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            };
            setRegion(newRegion);
          }
        }}
      >
        <Ionicons name="locate" size={24} color={Colors.primary} />
      </Pressable>

      {/* Home Button */}
      <Pressable 
        style={styles.homeButton}
        onPress={() => router.replace('/')}
      >
        <Ionicons name="home" size={24} color={Colors.primary} />
      </Pressable>

      {/* Floating Action Button */}
      <AnimatedPressable
        style={[styles.fab, fabAnimatedStyle]}
        onPress={handleReportPress}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
        <Text style={styles.fabText}>Report</Text>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textMuted,
  },
  pinContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pin: {
    width: 30, // Smaller pin
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.25)',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pinIcon: {
    width: 16,
    height: 16,
  },
  locationButton: {
    position: 'absolute',
    top: 60,
    right: Spacing.md,
    width: TouchTarget.min,
    height: TouchTarget.min,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    zIndex: 10,
  },
  homeButton: {
    position: 'absolute',
    top: 110, // Below location button
    right: Spacing.md,
    width: TouchTarget.min,
    height: TouchTarget.min,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    zIndex: 10,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.md,
    left: Spacing.md,
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    boxShadow: '0 4px 12px rgba(0, 122, 255, 0.4)',
    borderCurve: 'continuous',
    zIndex: 10,
  },
  fabIcon: {
    width: 24,
    height: 24,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  nearestContainer: {
    position: 'absolute',
    top: 60,
    left: Spacing.md,
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    zIndex: 10,
  },
  nearestLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  nearestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nearestValue: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    fontVariant: ['tabular-nums'],
  },
});
