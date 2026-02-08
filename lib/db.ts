import * as SQLite from 'expo-sqlite';
import { Toilet } from './types';

const DB_NAME = 'bathroom.db';

export const initDatabase = async () => {
  try {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS toilets (
        id TEXT PRIMARY KEY NOT NULL,
        data TEXT NOT NULL,
        timestamp INTEGER NOT NULL
      );
    `);
    return db;
  } catch (error) {
    console.error('Failed to init DB:', error);
    return null;
  }
};

export const saveToiletsToCache = async (toilets: Toilet[]) => {
  try {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    const statement = await db.prepareAsync(
      'INSERT OR REPLACE INTO toilets (id, data, timestamp) VALUES ($id, $data, $timestamp)'
    );
    
    for (const toilet of toilets) {
      await statement.executeAsync({
        $id: toilet.id,
        $data: JSON.stringify(toilet),
        $timestamp: Date.now()
      });
    }
    await statement.finalizeAsync();
  } catch (error) {
    console.error('Failed to save toilets to cache:', error);
  }
};

export const loadToiletsFromCache = async (): Promise<Toilet[]> => {
  try {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    const result = await db.getAllAsync<{ data: string }>('SELECT data FROM toilets');
    return result.map(row => JSON.parse(row.data) as Toilet);
  } catch (error) {
    console.error('Failed to load toilets from cache:', error);
    return [];
  }
};
