import { 
  collection, 
  addDoc, 
  GeoPoint, 
  serverTimestamp, 
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { getDeviceId } from './device';
import type { Toilet } from './types';

const TOILETS_COLLECTION = 'toilets';
const REPORTS_COLLECTION = 'reports';

/**
 * Add a new toilet to Firestore
 */
export const addToiletToFirestore = async (
  toilet: Omit<Toilet, 'id' | 'geohash' | 'lastConfirmed' | 'reportCount'>
): Promise<string> => {
  const deviceId = getDeviceId();
  
  const docRef = await addDoc(collection(db, TOILETS_COLLECTION), {
    coordinates: new GeoPoint(toilet.coordinates.latitude, toilet.coordinates.longitude),
    status: toilet.status,
    isAccessible: toilet.isAccessible,
    lastConfirmed: serverTimestamp(),
    reportCount: 1,
    createdBy: deviceId, // For anti-fraud
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};

/**
 * Report status for an existing toilet
 */
export const reportToiletStatus = async (
  toiletId: string,
  status: 'open' | 'closed',
  location: { latitude: number; longitude: number }
): Promise<string> => {
  const deviceId = getDeviceId();

  const docRef = await addDoc(collection(db, REPORTS_COLLECTION), {
    toiletId,
    statusReported: status,
    timestamp: serverTimestamp(),
    deviceId,
    location: new GeoPoint(location.latitude, location.longitude),
  });

  return docRef.id;
};
