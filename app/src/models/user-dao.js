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
            // inserindo usuario
            const stmt = db.prepare('INSERT INTO users (name, password, created_at, cpf, perfil) VALUES (?, ?, ?, ?, ?)');
            stmt.run(name, password, createdAt, cpf, perfil);
            // recuperando o ID do usuário adicionado
            const userId = db.prepare('SELECT last_insert_rowid() as id').get().id;
            return userId;
        } catch (error) {
            console.error('Erro ao adicionar usuário:', error);
            throw error;
        }
    }

    async saveEmails(userId, emails) {
        // removendo emails antigos
        const deleteStmt = db.prepare('DELETE FROM emails WHERE user_id = ?');
        deleteStmt.run(userId);

        // inserindo emails novos
        const emailStmt = db.prepare('INSERT INTO emails (user_id, email, is_primary) VALUES (?, ?, ?)');
        emails.forEach(email => {
            emailStmt.run(userId, email.email, email.is_primary ? 1 : 0);
        });

        // definindo apenas um email como principal
        const primaryEmail = emails.find(email => email.is_primary);
        if (primaryEmail) {
            const updatePrimaryStmt = db.prepare('UPDATE emails SET is_primary = 1 WHERE user_id = ? AND email = ?');
            updatePrimaryStmt.run(userId, primaryEmail.email);
        }
    }


    async savePhones(userId, telefones) {
        // removendo telefones antigos
        const deleteStmt = db.prepare('DELETE FROM phones WHERE user_id = ?');
        deleteStmt.run(userId);

        // inserindo telefones novos
        const phoneStmt = db.prepare('INSERT INTO phones (user_id, phone_number, is_primary) VALUES (?, ?, ?)');
        telefones.forEach(phone => {
            phoneStmt.run(userId, phone.phone_number, phone.is_primary ? 1 : 0);
        });

        // definindo apenas um telefone como principal
        const primaryPhone = telefones.find(phone => phone.is_primary);
        if (primaryPhone) {
            const updatePrimaryStmt = db.prepare('UPDATE phones SET is_primary = 1 WHERE user_id = ? AND phone_number = ?');
            updatePrimaryStmt.run(userId, primaryPhone.phone_number);
        }
    }


    // salvando um novo usuário
    async save({ name, password, createdAt, cpf, perfil }) {
        const stmt = db.prepare('INSERT INTO users (name, password, created_at, cpf, perfil) VALUES (@name, @password, @createdAt, @cpf, @perfil)');
        stmt.run({ name, password, createdAt, cpf, perfil });
    }

    async update({ id, name }) {
        try {
            console.log(`Atualizando usuário ${id} com nome ${name}`);
            const stmt = db.prepare('UPDATE users SET name = ? WHERE id = ?');
            stmt.run(name, id);
            console.log(`Usuário ${id} atualizado com sucesso`);
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            throw error;
        }
    }

    async updateUser({ id, name}) {
        const query = `
            UPDATE users
            SET name = ?
            WHERE id = ?;
        `;
        db.prepare(query).run(name, id);
    }

    async updatePhones(userId, telefones) {
        // removendo telefones antigos
        const deleteQuery = `DELETE FROM phones WHERE user_id = ?;`;
        db.prepare(deleteQuery).run(userId);
        // inserindo os telefones atualizados
        const insertQuery = `
            INSERT INTO phones (user_id, phone_number, is_primary)
            VALUES (?, ?, ?);
        `;
        const insert = db.prepare(insertQuery);
        telefones.forEach(phone => {
            insert.run(userId, phone.phone_number, phone.is_primary ? 1 : 0);
        });
    }

    async updateEmails(userId, emails) {
        // removendo emails antigos
        const deleteQuery = `DELETE FROM emails WHERE user_id = ?;`;
        db.prepare(deleteQuery).run(userId);
        // inserindo emails atualizados
        const insertQuery = `
            INSERT INTO emails (user_id, email, is_primary)
            VALUES (?, ?, ?);
        `;
        const insert = db.prepare(insertQuery);
        emails.forEach(email => {
            insert.run(userId, email.email, email.is_primary ? 1 : 0);
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

    async deletePhonesByUserId(userId) {
    console.log(`Iniciando a deleção dos telefones do usuário com ID: ${userId}`);
    const deleteStmt = db.prepare('DELETE FROM phones WHERE user_id = ?');
    deleteStmt.run(userId);
    console.log(`Telefones deletados para o usuário com ID: ${userId}`);
    }

    async deleteEmailsByUserId(userId) {
        console.log(`Iniciando a deleção dos emails do usuário com ID: ${userId}`);
        const deleteStmt = db.prepare('DELETE FROM emails WHERE user_id = ?');
        deleteStmt.run(userId);
        console.log(`Emails deletados para o usuário com ID: ${userId}`);
    }

    // Deletando um usuário
    async delete(id) {
        console.log(`Iniciando a deleção do usuário com ID: ${id}`);
        const stmt = db.prepare('DELETE FROM users WHERE id = ?');
        stmt.run(id);
        console.log(`Usuário deletado com ID: ${id}`);
    }

}

export { UserDao };