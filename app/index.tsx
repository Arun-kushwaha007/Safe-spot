import { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { Colors, Spacing, BorderRadius, TouchTarget } from '@/constants/colors';
import type { Toilet, MapRegion } from '@/lib/types';

// Mock data for development (replace with Firestore)
const MOCK_TOILETS: Toilet[] = [
  {
    id: '1',
    coordinates: { latitude: 28.6139, longitude: 77.2090 },
    geohash: 'ttnfv',
    status: 'open',
    lastConfirmed: new Date(),
    isAccessible: true,
    reportCount: 5,
  },
  {
    id: '2',
    coordinates: { latitude: 28.6129, longitude: 77.2295 },
    geohash: 'ttnfv',
    status: 'closed',
    lastConfirmed: new Date(Date.now() - 3600000),
    isAccessible: false,
    reportCount: 2,
  },
  {
    id: '3',
    coordinates: { latitude: 28.6200, longitude: 77.2100 },
    geohash: 'ttnfv',
    status: 'unknown',
    lastConfirmed: new Date(Date.now() - 86400000),
    isAccessible: true,
    reportCount: 0,
  },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Main Map Screen
 * Full-screen map with toilet pins and floating action button
 */
export default function MapScreen() {
  const router = useRouter();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [toilets, setToilets] = useState<Toilet[]>(MOCK_TOILETS);
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

  // Handle pin press with haptics
  const handlePinPress = useCallback((toilet: Toilet) => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/toilet/${toilet.id}`);
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

  // Get pin color based on status
  const getPinColor = (status: Toilet['status']) => {
    switch (status) {
      case 'open': return Colors.open;
      case 'closed': return Colors.closed;
      default: return Colors.unknown;
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
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        mapPadding={{ top: 0, right: 0, bottom: 100, left: 0 }}
      >
        {toilets.map((toilet) => (
          <Marker
            key={toilet.id}
            coordinate={toilet.coordinates}
            onPress={() => handlePinPress(toilet)}
            tracksViewChanges={false}
          >
            <View style={[styles.pin, { backgroundColor: getPinColor(toilet.status) }]}>
              <Image
                source={{ uri: toilet.status === 'open' 
                  ? 'sf:toilet.fill' 
                  : toilet.status === 'closed' 
                    ? 'sf:xmark' 
                    : 'sf:questionmark' 
                }}
                style={styles.pinIcon}
                tintColor="#FFFFFF"
              />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* My Location Button */}
      <Pressable 
        style={styles.locationButton}
        onPress={async () => {
          if (location) {
            setRegion({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            });
          }
        }}
      >
        <Image
          source={{ uri: 'sf:location.fill' }}
          style={styles.locationIcon}
          tintColor={Colors.primary}
        />
      </Pressable>

      {/* Floating Action Button */}
      <AnimatedPressable
        style={[styles.fab, fabAnimatedStyle]}
        onPress={handleReportPress}
      >
        <Image
          source={{ uri: 'sf:plus' }}
          style={styles.fabIcon}
          tintColor="#FFFFFF"
        />
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
  pin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
    borderCurve: 'continuous',
  },
  pinIcon: {
    width: 20,
    height: 20,
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
  },
  locationIcon: {
    width: 24,
    height: 24,
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
});
