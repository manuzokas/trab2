import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../dados.db');
const db = new Database(dbPath, { verbose: console.log });

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        password TEXT NOT NULL,
        avatar_url TEXT,
        created_at TEXT,
        cpf TEXT NOT NULL,
        perfil TEXT NOT NULL DEFAULT 'CLIENTE'
    )
`);

export { db };
