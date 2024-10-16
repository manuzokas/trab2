import { UserDao } from '../models/user-dao.js';
import { User } from '../models/user-model.js';

function listaUsersService(nome, pagina) {
    const userDao = new UserDao();
    const limite = 5;
    let paginaAtual = parseInt(pagina, 10);

    if (isNaN(paginaAtual) || paginaAtual < 1) {
        paginaAtual = 1;
    }

    const offset = (paginaAtual - 1) * limite;
    const usersRaw = userDao.listFiltered(nome, limite, offset);
    const users = usersRaw.map(u => new User(u.name, u.email, u.password, u.created_at, u.cpf, u.perfil));
    const totalUsers = userDao.countFiltered(nome);
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

function addUserService({ name, email, password, cpf, perfil }) {
    const userDao = new UserDao();
    const existingUser = userDao.findByCpf(cpf);

    if (existingUser) {
        throw new Error("CPF já cadastrado");
    }

    // Validar os campos obrigatórios
    if (!name || !email || !password || !cpf || !perfil) {
        throw new Error("Todos os campos são obrigatórios");
    }

    const newUser = new User(name, email, password, perfil, cpf);
    userDao.save(newUser);
}

function removeUserService(id) {
    const userDao = new UserDao();
    const user = userDao.findById(id);

    if (!user) {
        throw new Error("Usuário não encontrado");
    }

    if (user.perfil === 'ADMIN') {
        throw new Error("Não é permitido remover administradores");
    }

    userDao.delete(id);
}

function updateUserService(id, { name, email, telefones, emails }) {
    const userDao = new UserDao();
    const user = userDao.findById(id);

    if (!user) {
        throw new Error("Usuário não encontrado");
    }

    user.name = name || user.name;
    user.email = email || user.email;
    userDao.update(user);

    // Atualizar telefones e emails (exemplo, depende da implementação do UserDao)
    // userDao.updatePhones(id, telefones);
    // userDao.updateEmails(id, emails);

    return user;
}

function userDetailsService(id) {
    const userDao = new UserDao();
    const user = userDao.findById(id);
    if (!user) {
        throw new Error("Usuário não encontrado");
    }
    // Obter telefones e emails
    const telefones = userDao.findPhonesByUserId(id);
    const emails = userDao.findEmailsByUserId(id);

    return { user, telefones, emails };
}

export { listaUsersService, addUserService, removeUserService, updateUserService, paginaAddUserService, userDetailsService };
