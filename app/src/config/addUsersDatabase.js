// scripts/addUsers.js
import { db } from '../config/database.js';

export function addUser(name, password, cpf, perfil = 'CLIENTE', emails = [], telefones = []) {
    const createdAt = new Date().toISOString();

    //inserindo os usuarios testes
    const stmtUser = db.prepare('INSERT INTO users (name, password, created_at, cpf, perfil) VALUES (?, ?, ?, ?, ?)');
    const resultUser = stmtUser.run(name, password, createdAt, cpf, perfil);
    const userId = resultUser.lastInsertRowid;

    // inserindo os emails
    const stmtEmail = db.prepare('INSERT INTO emails (user_id, email, is_primary) VALUES (?, ?, ?)');
    emails.forEach(email => {
        stmtEmail.run(userId, email.email, email.is_primary ? 1 : 0);
    });

    // inserindo os telefones
    const stmtPhone = db.prepare('INSERT INTO phones (user_id, phone_number, is_primary) VALUES (?, ?, ?)');
    telefones.forEach(phone => {
        stmtPhone.run(userId, phone.phone_number, phone.is_primary ? 1 : 0);
    });

    console.log(`Usuário ${name} adicionado com sucesso!`);
}

// adicionando meus usuarios
addUser('Maria Silva', 'senha123', '123.456.789-00', 'CLIENTE', [{ email: 'maria@example.com', is_primary: true }], [{ phone_number: '11987654321', is_primary: true }]);
addUser('João Pereira', 'senha456', '987.654.321-00', 'CLIENTE', [{ email: 'joao@example.com', is_primary: true }], [{ phone_number: '11976543210', is_primary: true }]);
addUser('Ana Costa', 'senha789', '456.789.123-00', 'CLIENTE', [{ email: 'ana@example.com', is_primary: true }], [{ phone_number: '11987654322', is_primary: true }]);
addUser('Carlos Almeida', 'senha321', '321.654.987-00', 'CLIENTE', [{ email: 'carlos@example.com', is_primary: true }], [{ phone_number: '11976543211', is_primary: true }]);
addUser('Patrícia Santos', 'senha654', '654.321.123-00', 'CLIENTE', [{ email: 'patricia@example.com', is_primary: true }], [{ phone_number: '11987654323', is_primary: true }]);
addUser('Roberto Lima', 'senha987', '987.123.456-00', 'CLIENTE', [{ email: 'roberto@example.com', is_primary: true }], [{ phone_number: '11976543212', is_primary: true }]);
addUser('Juliana Martins', 'senha159', '159.753.486-00', 'CLIENTE', [{ email: 'juliana@example.com', is_primary: true }], [{ phone_number: '11987654324', is_primary: true }]);
addUser('Fernando Rocha', 'senha753', '753.951.852-00', 'CLIENTE', [{ email: 'fernando@example.com', is_primary: true }], [{ phone_number: '11976543213', is_primary: true }]);
addUser('Tatiane Dias', 'senha852', '852.963.741-00', 'CLIENTE', [{ email: 'tatiane@example.com', is_primary: true }], [{ phone_number: '11987654325', is_primary: true }]);
addUser('Lucas Ferreira', 'senha456', '963.741.258-00', 'CLIENTE', [{ email: 'lucas@example.com', is_primary: true }], [{ phone_number: '11976543214', is_primary: true }]);
