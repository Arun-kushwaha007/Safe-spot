import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();
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
 */
export const getDeviceId = (): string => {
  const existingId = storage.getString(DEVICE_ID_KEY);
  
  if (existingId) {
    return existingId;
  }

  const newId = generateUUID();
  storage.set(DEVICE_ID_KEY, newId);
  return newId;
};
