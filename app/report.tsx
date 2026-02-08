import { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { Colors, Spacing, BorderRadius, TouchTarget } from '@/constants/colors';

type ReportStatus = 'open' | 'closed' | null;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Report Status Screen
 * Form sheet modal for reporting toilet status
 */
export default function ReportScreen() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation values
  const openScale = useSharedValue(1);
  const closedScale = useSharedValue(1);

  const openAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: openScale.value }],
  }));

  const closedAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: closedScale.value }],
  }));

  const handleStatusSelect = useCallback((status: ReportStatus) => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.selectionAsync();
    }
    
    if (status === 'open') {
      openScale.value = withSpring(0.95, {}, () => {
        openScale.value = withSpring(1);
      });
    } else {
      closedScale.value = withSpring(0.95, {}, () => {
        closedScale.value = withSpring(1);
      });
    }
    
    setSelectedStatus(status);
  }, [openScale, closedScale]);

  const handleSubmit = useCallback(async () => {
    if (!selectedStatus) {
      Alert.alert('Select Status', 'Please select whether the bathroom is open or closed.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current location for proximity verification
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // TODO: Submit to Firestore
      console.log('Submitting report:', {
        status: selectedStatus,
        location: location.coords,
        timestamp: new Date(),
      });

      if (process.env.EXPO_OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert(
        'Thanks!',
        'Your report helps others find clean bathrooms.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedStatus, router]);

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text style={styles.title}>Is this bathroom open?</Text>
      <Text style={styles.subtitle}>Help others by confirming the current status</Text>

      {/* Status Selection */}
      <View style={styles.statusContainer}>
        <AnimatedPressable
          style={[
            styles.statusButton,
            selectedStatus === 'open' && styles.statusButtonSelected,
            selectedStatus === 'open' && { borderColor: Colors.open },
            openAnimatedStyle,
          ]}
          onPress={() => handleStatusSelect('open')}
        >
          <View style={[styles.statusIcon, { backgroundColor: Colors.open }]}>
            <Ionicons name="checkmark" size={24} color="#FFFFFF" />
          </View>
          <Text style={[
            styles.statusText,
            selectedStatus === 'open' && { color: Colors.open },
          ]}>
            Open
          </Text>
          <Text style={styles.statusDescription}>
            Clean and available
          </Text>
        </AnimatedPressable>

        <AnimatedPressable
          style={[
            styles.statusButton,
            selectedStatus === 'closed' && styles.statusButtonSelected,
            selectedStatus === 'closed' && { borderColor: Colors.closed },
            closedAnimatedStyle,
          ]}
          onPress={() => handleStatusSelect('closed')}
        >
          <View style={[styles.statusIcon, { backgroundColor: Colors.closed }]}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </View>
          <Text style={[
            styles.statusText,
            selectedStatus === 'closed' && { color: Colors.closed },
          ]}>
            Closed
          </Text>
          <Text style={styles.statusDescription}>
            Out of order or locked
          </Text>
        </AnimatedPressable>
      </View>

      {/* Submit Button */}
      <Pressable
        style={[
          styles.submitButton,
          !selectedStatus && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={!selectedStatus || isSubmitting}
      >
        <Text style={[
          styles.submitText,
          !selectedStatus && styles.submitTextDisabled,
        ]}>
          {isSubmitting ? 'Submitting...' : 'Confirm Status'}
        </Text>
      </Pressable>

      {/* Cancel */}
      <Pressable style={styles.cancelButton} onPress={() => router.back()}>
        <Text style={styles.cancelText}>Cancel</Text>
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
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  statusButton: {
    flex: 1,
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    gap: Spacing.sm,
    borderCurve: 'continuous',
    minHeight: TouchTarget.min * 3,
  },
  statusButtonSelected: {
    backgroundColor: Colors.background,
    borderWidth: 2,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  statusDescription: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  submitButton: {
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
    borderCurve: 'continuous',
  },
  submitButtonDisabled: {
    backgroundColor: Colors.surface,
  },
  submitText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  submitTextDisabled: {
    color: Colors.textMuted,
  },
  cancelButton: {
    height: TouchTarget.min,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 17,
    color: Colors.primary,
  },
});
