// scripts/clearDatabase.js
import { db } from '../config/database.js';

function clearDatabase() {
    db.exec('BEGIN TRANSACTION');

    try {
        // deletando os registros das tabelas
        db.exec('DELETE FROM emails');
        db.exec('DELETE FROM phones');
        db.exec('DELETE FROM users');

        db.exec('COMMIT');
        console.log('Banco de dados limpo com sucesso.');
    } catch (error) {
        db.exec('ROLLBACK');
        console.error('Erro ao limpar o banco de dados:', error);
    }
}

clearDatabase();
