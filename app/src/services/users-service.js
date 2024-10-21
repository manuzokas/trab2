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

    // obtendo os usuarios filtrados
    const usersRaw = await userDao.listFiltered(nome, limite, offset);
    // Obter e-mails e telefones relacionados
    const emailsRaw = await userDao.getAllEmails();
    const telefonesRaw = await userDao.getAllTelefones();

    // garantindo que os emails e os telefones sejam arrays
    const users = usersRaw.map(u => {
        const userEmails = emailsRaw.filter(email => email.user_id === u.id) || [];
        const userTelefones = telefonesRaw.filter(phone => phone.user_id === u.id) || [];
        return new User(u.name, u.password, u.created_at, u.cpf, u.perfil, userEmails.length ? userEmails : [], userTelefones.length ? userTelefones : []);
    });

    // contando total de usuários filtrados
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

    // verificando se o CPF existe
    const existingUser = await userDao.findByCpf(cpf);
    if (existingUser) {
        console.error("Erro ao adicionar usuário: CPF já cadastrado:", existingUser);
        throw new Error("CPF já cadastrado");
    }

    //validando os campos
    if (!name || !password || !cpf || !perfil || !emails || !telefones) {
        throw new Error("Todos os campos são obrigatórios");
    }

    // validando emails e telefones principais
    if (!emails.some(email => email.is_primary)) {
        throw new Error("É necessário ter ao menos um email principal.");
    }
    if (!telefones.some(phone => phone.is_primary)) {
        throw new Error("É necessário ter ao menos um telefone principal.");
    }

    const newUser = new User(name, password, new Date().toISOString(), cpf, perfil, emails, telefones);

    const userId = await userDao.addUser(newUser);

    await userDao.saveEmails(userId, emails);
    await userDao.savePhones(userId, telefones);

    console.log("Usuário adicionado com sucesso:", newUser);
}

async function removeUserService(id) {
    console.log(`Iniciando a remoção do usuário com ID: ${id}`);
    const userDao = new UserDao();
    const user = await userDao.findById(id);
    console.log(`Usuário encontrado: ${user ? JSON.stringify(user) : 'Não encontrado'}`);
    if (!user) {
        throw new Error("Usuário não encontrado");
    }
    if (user.perfil === 'ADMIN') {
        throw new Error("Não é permitido remover administradores");
    }
    console.log(`Removendo telefones do usuário com ID: ${id}`);
    await userDao.deletePhonesByUserId(id);
    console.log(`Telefones removidos para o usuário com ID: ${id}`);
    console.log(`Removendo emails do usuário com ID: ${id}`);
    await userDao.deleteEmailsByUserId(id);
    console.log(`Emails removidos para o usuário com ID: ${id}`);
    console.log(`Removendo usuário com ID: ${id}`);
    await userDao.delete(id);
    console.log(`Usuário removido com ID: ${id}`);
}


async function updateUserService(id, { name, telefones, emails }) {
    const userDao = new UserDao();

    const user = await userDao.findById(id);
    if (!user) {
        throw new Error("Usuário não encontrado");
    }

    await userDao.updateUser({
        id,
        name
    });

    await userDao.updatePhones(id, telefones);
    await userDao.updateEmails(id, emails);

    return user;
}

async function userDetailsService(id) {
    console.log(`Iniciando busca de detalhes do usuário com ID: ${id}`);
    const userDao = new UserDao();
    
    console.log('Buscando usuário...');
    const user = await userDao.findById(id);
    console.log(`Usuário encontrado: ${user ? JSON.stringify(user) : 'Usuário não encontrado'}`);
    
    if (!user) {
        console.error("Usuário não encontrado");
        throw new Error("Usuário não encontrado");
    }
    
    console.log(`Buscando telefones do usuário com ID: ${id}`);
    const telefones = await userDao.findPhonesByUserId(id);
    console.log(`Telefones encontrados: ${telefones ? JSON.stringify(telefones) : 'Nenhum telefone encontrado'}`);
    
    console.log(`Buscando emails do usuário com ID: ${id}`);
    const emails = await userDao.findEmailsByUserId(id);
    console.log(`Emails encontrados: ${emails ? JSON.stringify(emails) : 'Nenhum email encontrado'}`);
    
    console.log(`Detalhes completos do usuário com ID: ${id} obtidos.`);

    //retornando dados
    return {
        id: user.id,
        name: user.name,
        cpf: user.cpf,
        telefones,
        emails
    };
}



export { listaUsersService, addUserService, removeUserService, updateUserService, paginaAddUserService, userDetailsService };
