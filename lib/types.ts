/**
 * Toilet Data Types
 */

export type ToiletStatus = 'open' | 'closed' | 'unknown';

export interface Toilet {
  id: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  geohash: string;
  status: ToiletStatus;
  lastConfirmed: Date;
  isAccessible: boolean;
  reportCount: number;
}

export interface Report {
  id: string;
  toiletId: string;
  statusReported: 'open' | 'closed';
  timestamp: Date;
  deviceId: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}
