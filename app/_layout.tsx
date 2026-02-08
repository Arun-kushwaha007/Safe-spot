import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { logEvent, Events } from '@/lib/analytics';
import { initCrashReporting } from '@/lib/crash';
import { Colors } from '@/constants/colors';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

/**
 * Root Layout
 * Using Stack navigation with transparent headers for map-first UI
 */
export default function RootLayout() {
  // Assuming 'loaded' comes from useFonts or similar asset loading hook
  const [loaded] = useFonts({
    // Add your fonts here if any, otherwise this can be simplified
    // Example: 'SpaceMono': require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    initCrashReporting();
    if (loaded) {
      SplashScreen.hideAsync();
      logEvent(Events.APP_OPEN);
    }
  }, [loaded]);

  if (!loaded) {
    return null; // Or a custom loading component
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="report"
          options={{
            presentation: 'formSheet',
            sheetGrabberVisible: true,
            sheetAllowedDetents: [0.5, 0.75],
            headerShown: true,
            headerTitle: 'Report Status',
          }}
        />
        <Stack.Screen
          name="toilet/[id]"
          options={{
            presentation: 'formSheet',
            sheetGrabberVisible: true,
            sheetAllowedDetents: [0.4, 0.75],
            headerShown: true,
            headerTitle: 'Bathroom Details',
          }}
        />
      </Stack>
    </View>
  );
}
