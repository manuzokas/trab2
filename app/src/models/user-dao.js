import { db } from "../config/database.js";

class UserDao {
    // listando usuários com filtro por nome e paginação
    async listFiltered(nome = "", limite = 5, offset = 0) {
        const stmt = db.prepare('SELECT * FROM users WHERE name LIKE ? LIMIT ? OFFSET ?');
        const users = stmt.all(`%${nome}%`, limite, offset);
        console.log({ users });
        return users;
    }

    // contando usuários filtrados por nome
    async countFiltered(nome = "") {
        const stmt = db.prepare('SELECT COUNT(*) AS total FROM users WHERE name LIKE ?');
        const result = stmt.get(`%${nome}%`);
        return result ? result.total : 0;
    }

    // buscando usuário por CPF
    async findByCpf(cpf) {
        const stmt = db.prepare('SELECT * FROM users WHERE cpf = ?');
        const user = stmt.get(cpf);
        return user;
    }

    // buscando usuário por ID
    async findById(id) {
        const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
        const user = stmt.get(id);
        console.log(`Usuário encontrado:`, user);
        return user;
    }

    async addUser({ name, password, cpf, perfil, createdAt }) {
        try {
            // Inserção de usuário
            const stmt = db.prepare('INSERT INTO users (name, password, created_at, cpf, perfil) VALUES (?, ?, ?, ?, ?)');
            stmt.run(name, password, createdAt, cpf, perfil);

            // Recuperar o ID do usuário adicionado
            const userId = db.prepare('SELECT last_insert_rowid() as id').get().id;
            return userId;
        } catch (error) {
            console.error('Erro ao adicionar usuário:', error);
            throw error;
        }
    }

    async saveEmails(userId, emails) {
        const emailStmt = db.prepare('INSERT INTO emails (user_id, email, is_primary) VALUES (?, ?, ?)');
        emails.forEach(email => {
            emailStmt.run(userId, email.email, email.is_primary ? 1 : 0);
        });
    }

    async savePhones(userId, telefones) {
        const phoneStmt = db.prepare('INSERT INTO phones (user_id, phone_number, is_primary) VALUES (?, ?, ?)');
        telefones.forEach(phone => {
            phoneStmt.run(userId, phone.phone_number, phone.is_primary ? 1 : 0);
        });
    }

    // salvando um novo usuário
    async save({ name, password, createdAt, cpf, perfil }) {
        const stmt = db.prepare('INSERT INTO users (name, password, created_at, cpf, perfil) VALUES (@name, @password, @createdAt, @cpf, @perfil)');
        stmt.run({ name, password, createdAt, cpf, perfil });
    }

    // atualizando dados de um usuário
    async update({ id, name, telefones = [], emails = [] }) {
        // Validações para garantir ao menos um telefone e email principal
        if (!emails.length || !emails.some(email => email.is_primary)) {
            throw new Error("É necessário pelo menos um e-mail e um deve ser marcado como principal.");
        }
        if (!telefones.length || !telefones.some(phone => phone.is_primary)) {
            throw new Error("É necessário pelo menos um telefone e um deve ser marcado como principal.");
        }
        const stmt = db.prepare('UPDATE users SET name = ? WHERE id = ?');
        stmt.run(name, id);
        // Atualizando telefones e emails
        await this.updatePhones(id, telefones);
        await this.updateEmails(id, emails);
    }

    // atualizando telefones de um usuário
    async updatePhones(id, telefones) {
        const deleteStmt = db.prepare('DELETE FROM phones WHERE user_id = ?');
        deleteStmt.run(id);
        const insertStmt = db.prepare('INSERT INTO phones (user_id, phone_number, is_primary) VALUES (?, ?, ?)');
        telefones.forEach(({ phone_number, is_primary }) => {
            insertStmt.run(id, phone_number, is_primary ? 1 : 0);
        });
    }

    // atualizando emails de um usuário
    async updateEmails(id, emails) {
        const deleteStmt = db.prepare('DELETE FROM emails WHERE user_id = ?');
        deleteStmt.run(id);
        const insertStmt = db.prepare('INSERT INTO emails (user_id, email, is_primary) VALUES (?, ?, ?)');
        emails.forEach(({ email, is_primary }) => {
            insertStmt.run(id, email, is_primary ? 1 : 0);
        });
    }

    // buscando telefones por ID de usuário
    async findPhonesByUserId(userId) {
        const stmt = db.prepare('SELECT * FROM phones WHERE user_id = ?');
        return stmt.all(userId);
    }

    // buscando emails por ID de usuário
    async findEmailsByUserId(userId) {
        const stmt = db.prepare('SELECT * FROM emails WHERE user_id = ?');
        return stmt.all(userId);
    }

    // buscando todos os telefones
    async getAllTelefones() {
        const stmt = db.prepare('SELECT * FROM phones');
        return stmt.all();
    }

    // buscando todos os emails
    async getAllEmails() {
        const stmt = db.prepare('SELECT * FROM emails');
        return stmt.all();
    }

    // deletando um usuário
    async delete(id) {
        const stmt = db.prepare('DELETE FROM users WHERE id = ?');
        stmt.run(id);
    }
}

export { UserDao };
