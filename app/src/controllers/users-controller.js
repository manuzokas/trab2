import { listaUsersService, addUserService, removeUserService, updateUserService, paginaAddUserService, userDetailsService } from '../services/users-service.js';

// Função responsável por listar os usuários com paginação e filtro por nome
function listaUsers(req, res) {
    const { nome = "", pagina = 1 } = req.query;
    try {
        const data = listaUsersService(nome, pagina);
        res.render('users-list', { data });
    } catch (error) {
        console.error("Erro ao listar usuários:", error);
        res.status(500).send("Erro ao listar usuários");
    }
}

// Renderizando formulário de adição de usuário
function paginaAddUser(req, res) {
    const data = paginaAddUserService();
    res.render('users-formulario', { data });
}

// Adicionando usuário com validação e tratamento de erros
function addUser(req, res) {
    console.log({ rota: "/users/add", data: req.body });
    try {
        const { name, email, password, cpf, perfil = 'CLIENTE' } = req.body;
        addUserService({ name, email, password, cpf, perfil });
        res.redirect("/users");
    } catch (error) {
        console.error("Erro ao adicionar usuário:", error);
        res.status(500).send("Erro ao adicionar usuário");
    }
}

// Excluindo usuário (não pode excluir administradores)
function removeUser(req, res) {
    try {
        const { id } = req.params;
        removeUserService(id);
        res.redirect("/users");
    } catch (error) {
        console.error("Erro ao remover usuário:", error);
        res.status(500).send("Erro ao remover usuário");
    }
}

// Atualizando usuário (exceto CPF e perfil)
function updateUser(req, res) {
    try {
        const { id } = req.params;
        const { name, email, telefones, emails } = req.body;
        updateUserService(id, { name, email, telefones, emails });
        res.redirect("/users");
    } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        res.status(500).send("Erro ao atualizar usuário");
    }
}

function userDetails(req, res) {
    const { id } = req.params;
    try {
        const data = userDetailsService(id);
        res.render('user-details', { data });
    } catch (error) {
        console.error("Erro ao obter detalhes do usuário:", error);
        res.status(500).send("Erro ao obter detalhes do usuário");
    }
}

export { listaUsers, paginaAddUser, addUser, removeUser, updateUser, userDetails };
