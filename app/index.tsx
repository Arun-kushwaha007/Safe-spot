import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '@/constants/colors';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Background decoration */}
      <View style={styles.circle} />
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="location" size={64} color={Colors.primary} />
        </View>
        
        <Text style={styles.title}>Bathroom Now</Text>
        <Text style={styles.subtitle}>
          Find clean, accessible restrooms{'\n'}in seconds.
        </Text>
      </View>

      <View style={styles.footer}>
        <Pressable 
          style={styles.button} 
          onPress={() => {
             console.log('Navigating to map...');
             router.replace('/(tabs)/map');
          }}
        >
          <Text style={styles.buttonText}>Find Nearby Bathroom</Text>
          <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
        </Pressable>
        
        <Text style={styles.disclaimer}>
          Community powered • Real-time status
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'space-between',
    padding: Spacing.xl,
  },
  circle: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.primary,
    opacity: 0.1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 26,
  },
  footer: {
    gap: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  button: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disclaimer: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    opacity: 0.6,
  },
});
