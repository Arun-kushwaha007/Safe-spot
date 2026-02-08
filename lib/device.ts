import * as SecureStore from 'expo-secure-store';

const DEVICE_ID_KEY = 'device_id';

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Get or create a persistent Device ID
 * Used for rate limiting and report attribution without login
 * Returns a Promise because SecureStore is async
 */
export const getDeviceId = async (): Promise<string> => {
  try {
    const existingId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    
    if (existingId) {
      return existingId;
    }

    const newId = generateUUID();
    await SecureStore.setItemAsync(DEVICE_ID_KEY, newId);
    return newId;
  } catch (error) {
    // Fallback if SecureStore fails (e.g. web or no permission)
    console.warn('SecureStore failed, using non-persistent ID', error);
    return generateUUID();
  }
};
