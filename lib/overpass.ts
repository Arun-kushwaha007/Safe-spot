import { Toilet } from './types';

export const fetchToilets = async (region: any) => {
  const { latitude, longitude, latitudeDelta, longitudeDelta } = region;
  const south = latitude - latitudeDelta / 2;
  const west = longitude - longitudeDelta / 2;
  const north = latitude + latitudeDelta / 2;
  const east = longitude + longitudeDelta / 2;

  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="toilets"](${south},${west},${north},${east});
      way["amenity"="toilets"](${south},${west},${north},${east});
      relation["amenity"="toilets"](${south},${west},${north},${east});
    );
    out center;
  `;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
    });
    const data = await response.json();
    
    return data.elements.map((el: any) => ({
      id: String(el.id),
      coordinates: {
        latitude: el.lat || el.center?.lat,
        longitude: el.lon || el.center?.lon,
      },
      geohash: 'unknown',
      status: 'unknown',
      lastConfirmed: new Date(),
      isAccessible: el.tags?.wheelchair === 'yes',
      reportCount: 0,
      name: el.tags?.name,
      fee: el.tags?.fee === 'yes'
    })).filter((t: any) => t.coordinates.latitude && t.coordinates.longitude);
  } catch (error) {
    console.error(error);
    return [];
  }
};
