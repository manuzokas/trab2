import { UserDao } from '../models/user-dao.js';
import { User } from '../models/user-model.js';

async function listaUsersService(nome, pagina) {
    const userDao = new UserDao();
    const limite = 5;
    let paginaAtual = parseInt(pagina, 10);
    if (isNaN(paginaAtual) || paginaAtual < 1) {
        paginaAtual = 1;
    }
    const offset = (paginaAtual - 1) * limite;

    // Obter usuários filtrados
    const usersRaw = await userDao.listFiltered(nome, limite, offset);
    // Obter e-mails e telefones relacionados
    const emailsRaw = await userDao.getAllEmails();
    const telefonesRaw = await userDao.getAllTelefones();

    // Certifique-se de que userEmails e userTelefones sejam arrays
    const users = usersRaw.map(u => {
        const userEmails = emailsRaw.filter(email => email.user_id === u.id) || [];
        const userTelefones = telefonesRaw.filter(phone => phone.user_id === u.id) || [];
        return new User(u.name, u.password, u.created_at, u.cpf, u.perfil, userEmails.length ? userEmails : [], userTelefones.length ? userTelefones : []);
    });

    // Contar total de usuários filtrados
    const totalUsers = await userDao.countFiltered(nome);
    const totalUsersValid = isNaN(totalUsers) ? 0 : totalUsers;
    const totalPaginas = limite > 0 ? Math.ceil(totalUsersValid / limite) : 1;

    const data = {
        title: "WEB II",
        users,
        nomeFiltro: nome,
        paginaAtual,
        totalUsers: totalUsersValid,
        usuariosPorPagina: limite,
        totalPaginas
    };

    console.log(data);
    return data;
}

function paginaAddUserService() {
    return { title: "WEB II - Add User" };
}

async function addUserService({ name, password, cpf, perfil = 'CLIENTE', emails, telefones }) {
    const userDao = new UserDao();

    // Verificação de CPF existente
    const existingUser = await userDao.findByCpf(cpf);
    if (existingUser) {
        console.error("Erro ao adicionar usuário: CPF já cadastrado:", existingUser);
        throw new Error("CPF já cadastrado");
    }

    // Validação de campos obrigatórios
    if (!name || !password || !cpf || !perfil || !emails || !telefones) {
        throw new Error("Todos os campos são obrigatórios");
    }

    // Validação de emails e telefones principais
    if (!emails.some(email => email.is_primary)) {
        throw new Error("É necessário ter ao menos um email principal.");
    }
    if (!telefones.some(phone => phone.is_primary)) {
        throw new Error("É necessário ter ao menos um telefone principal.");
    }

    // Criar novo usuário
    const newUser = new User(name, password, new Date().toISOString(), cpf, perfil, emails, telefones);

    // Chamada para o método addUser do UserDAO
    const userId = await userDao.addUser(newUser);

    // Salvar os emails e telefones
    await userDao.saveEmails(userId, emails);
    await userDao.savePhones(userId, telefones);

    console.log("Usuário adicionado com sucesso:", newUser);
}

async function removeUserService(id) {
    const userDao = new UserDao();
    const user = await userDao.findById(id);
    if (!user) {
        throw new Error("Usuário não encontrado");
    }
    if (user.perfil === 'ADMIN') {
        throw new Error("Não é permitido remover administradores");
    }
    await userDao.deletePhonesByUserId(id);
    await userDao.deleteEmailsByUserId(id);
    await userDao.delete(id);
}


async function updateUserService(id, { name, telefones, emails }) {
    const userDao = new UserDao();

    // Verificar se o usuário existe
    const user = await userDao.findById(id);
    if (!user) {
        throw new Error("Usuário não encontrado");
    }

    // Validação de emails e telefones principais
    if (!emails.some(email => email.is_primary)) {
        throw new Error("É necessário ter ao menos um email principal.");
    }
    if (!telefones.some(phone => phone.is_primary)) {
        throw new Error("É necessário ter ao menos um telefone principal.");
    }

    // Atualizar usuário (exceto CPF e perfil)
    await userDao.update({ id, name });

    // Atualizar telefones e emails
    await userDao.savePhones(id, telefones);
    await userDao.saveEmails(id, emails);

    return user;
}


async function userDetailsService(id) {
    const userDao = new UserDao();
    // Usando await para chamadas assíncronas
    const user = await userDao.findById(id);
    if (!user) {
        throw new Error("Usuário não encontrado");
    }
    // Obter telefones e emails de forma assíncrona
    const telefones = await userDao.findPhonesByUserId(id);
    const emails = await userDao.findEmailsByUserId(id);
    return { user, telefones, emails };
}



export { listaUsersService, addUserService, removeUserService, updateUserService, paginaAddUserService, userDetailsService };
