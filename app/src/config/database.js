import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../dados.db');
const db = new Database(dbPath, { verbose: console.log });

db.exec(`DROP TABLE IF EXISTS phones;`);
db.exec(`DROP TABLE IF EXISTS emails;`);
db.exec(`DROP TABLE IF EXISTS users;`);

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        password TEXT NOT NULL,
        avatar_url TEXT,
        created_at TEXT,
        cpf TEXT NOT NULL,
        perfil TEXT NOT NULL DEFAULT 'CLIENTE'
    );
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS users_temp (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        password TEXT NOT NULL,
        avatar_url TEXT,
        created_at TEXT,
        cpf TEXT NOT NULL,
        perfil TEXT NOT NULL DEFAULT 'CLIENTE'
    );
`);

db.exec(`
    INSERT INTO users_temp (id, name, password, avatar_url, created_at, cpf, perfil)
    SELECT id, name, password, avatar_url, created_at, cpf, perfil
    FROM users;
`);

db.exec(`DROP TABLE IF EXISTS users;`);
db.exec(`ALTER TABLE users_temp RENAME TO users;`);

db.exec(`
    CREATE TABLE IF NOT EXISTS phones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        phone_number TEXT NOT NULL,
        is_primary INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS emails (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        email TEXT NOT NULL,
        is_primary INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
`);

export { db };
