import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'career-spots.db';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function openAndMigrateDatabase() {
  const database = await SQLite.openDatabaseAsync(DATABASE_NAME);

  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS spots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      created_at TEXT NOT NULL,
      photo_uri TEXT
    );
  `);

  const columns = await database.getAllAsync<{ name: string }>('PRAGMA table_info(spots)');
  if (!columns.some((column) => column.name === 'photo_uri')) {
    await database.execAsync('ALTER TABLE spots ADD COLUMN photo_uri TEXT;');
  }

  return database;
}

export function getDatabase() {
  databasePromise ??= openAndMigrateDatabase().catch((error) => {
    databasePromise = null;
    throw error;
  });

  return databasePromise;
}
