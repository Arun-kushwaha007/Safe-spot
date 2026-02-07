import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { Colors } from '@/constants/colors';

/**
 * Root Layout
 * Using Stack navigation with transparent headers for map-first UI
 */
export default function RootLayout() {
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
        <Stack.Screen name="index" />
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
