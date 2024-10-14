import { db } from "../config/database.js";
import { User } from "./user-model.js";

class UserDao {

    // listando usuários com filtro por nome e paginação
    listFiltered(nome = "", limite = 5, offset = 0) {
        const stmt = db.prepare('SELECT * FROM users WHERE name LIKE ? LIMIT ? OFFSET ?');
        const users = stmt.all(`%${nome}%`, limite, offset);
        console.log({ users });

        return users;
    }

    // contando usuários filtrados por nome
   countFiltered(nome = "") {
    const stmt = db.prepare('SELECT COUNT(*) AS total FROM users WHERE name LIKE ?');
    const result = stmt.get(`%${nome}%`); 
    // Se não houver resultados, retorna 0 para evitar NaN
    return result ? result.total : 0;
    }

    // buscando usuário por CPF
    findByCpf(cpf) {
        const stmt = db.prepare('SELECT * FROM users WHERE cpf = ?');
        const user = stmt.get(cpf);
        return user;
    }

    // buscando usuário por ID
    findById(id) {
        const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
        const user = stmt.get(id);
        return user;
    }

    // Método para adicionar um novo usuário com validações
    addUser({ name, email, password, cpf, perfil = 'CLIENTE' }) {
        // Validações básicas
        if (!name || !email || !password || !cpf) {
            throw new Error("Todos os campos são obrigatórios");
        }

        // Verificar se o CPF já existe no banco
        const existingUser = this.findByCpf(cpf);
        if (existingUser) {
            throw new Error("CPF já cadastrado");
        }

        // Criando o novo usuário
        const createdAt = new Date().toISOString(); // Formato de data ISO para created_at
        const newUser = { name, email, password, createdAt, cpf, perfil };

        // Salvando o usuário no banco
        this.save(newUser);
    }

    // salvando um novo usuário
    save({ name, email, password, createdAt, cpf, perfil }) {
        const stmt = db.prepare('INSERT INTO users (name, email, password, created_at, cpf, perfil) VALUES (@name, @email, @password, @createdAt, @cpf, @perfil)');
        stmt.run({ name, email, password, createdAt, cpf, perfil });
    }

    // atualizando dados de um usuário
    update({ id, name, email }) {
        const stmt = db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?');
        stmt.run(name, email, id);
    }

    // atualizando telefones de um usuário
    updatePhones(id, telefones) {
        const deleteStmt = db.prepare('DELETE FROM phones WHERE user_id = ?');
        deleteStmt.run(id);

        const insertStmt = db.prepare('INSERT INTO phones (user_id, phone_number, is_primary) VALUES (?, ?, ?)');

        telefones.forEach(({ numero, principal }) => {
            insertStmt.run(id, numero, principal ? 1 : 0);
        });
    }

    // atualizando emails de um usuário
    updateEmails(id, emails) {
        const deleteStmt = db.prepare('DELETE FROM emails WHERE user_id = ?');
        deleteStmt.run(id);

        const insertStmt = db.prepare('INSERT INTO emails (user_id, email, is_primary) VALUES (?, ?, ?)');

        emails.forEach(({ email, principal }) => {
            insertStmt.run(id, email, principal ? 1 : 0);
        });
    }

    // deletando um usuário
    delete(id) {
        const stmt = db.prepare('DELETE FROM users WHERE id = ?');
        stmt.run(id);
    }
}

export {
    UserDao
};