# Bathroom Now

A map-first toilet finder app built with Expo and React Native.

## Features

- 📍 Find nearby bathrooms on an interactive map
- ✅ Real-time status updates (Open/Closed/Unknown)
- 📱 One-tap status reporting
- 🔄 Offline caching for map tiles and pins

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## Tech Stack

- **Framework:** React Native + Expo
- **Navigation:** Expo Router
- **Maps:** react-native-maps (Google Maps)
- **Database:** Firebase Firestore
- **Animations:** Reanimated
- **Storage:** expo-sqlite + MMKV

## Project Structure

```
app/
  _layout.tsx      # Root layout with Stack navigation
  index.tsx        # Main map screen
  report.tsx       # Report status modal
  toilet/[id].tsx  # Toilet detail sheet

components/        # Reusable components
constants/         # Design tokens and colors
lib/               # Firebase config and types
```

## Running on Device (Expo Go)

No Android Studio or complex setup required!

1.  **Install the App:** Download **Expo Go** from the Google Play Store (Android) or App Store (iOS).
2.  **Start the Server:**
    ```bash
    npm start
    ```
3.  **Scan & Run:**
    -   **Android:** Open Expo Go and scan the QR code from the terminal.
    -   **iOS:** Open the Camera app and scan the QR code.

> **Note:** Ensure your phone and computer are on the **same Wi-Fi network**.
