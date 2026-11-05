import { getDatabase } from '@/database/database';
import type { CreateSpotInput, Spot, UpdateSpotInput } from '@/types/spot';

type SpotRow = {
  id: number;
  name: string;
  note: string;
  latitude: number;
  longitude: number;
  created_at: string;
};

function toSpot(row: SpotRow): Spot {
  return {
    id: row.id,
    name: row.name,
    note: row.note,
    latitude: row.latitude,
    longitude: row.longitude,
    createdAt: row.created_at,
  };
}

export async function getAllSpots(): Promise<Spot[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<SpotRow>('SELECT * FROM spots ORDER BY created_at DESC');
  return rows.map(toSpot);
}

export async function getSpotById(id: number): Promise<Spot | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<SpotRow>('SELECT * FROM spots WHERE id = ?', [id]);
  return row ? toSpot(row) : null;
}

export async function createSpot(input: CreateSpotInput): Promise<Spot> {
  const database = await getDatabase();
  const createdAt = new Date().toISOString();
  const result = await database.runAsync(
    'INSERT INTO spots (name, note, latitude, longitude, created_at) VALUES (?, ?, ?, ?, ?)',
    [input.name, input.note, input.latitude, input.longitude, createdAt],
  );

  return { id: result.lastInsertRowId, ...input, createdAt };
}

export async function updateSpot(id: number, input: UpdateSpotInput): Promise<Spot | null> {
  const database = await getDatabase();
  const result = await database.runAsync(
    'UPDATE spots SET name = ?, note = ?, latitude = ?, longitude = ? WHERE id = ?',
    [input.name, input.note, input.latitude, input.longitude, id],
  );

  return result.changes === 0 ? null : getSpotById(id);
}

export async function deleteSpot(id: number): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.runAsync('DELETE FROM spots WHERE id = ?', [id]);
  return result.changes > 0;
}
