import { listaUsersService, addUserService, removeUserService, updateUserService, paginaAddUserService, userDetailsService } from '../services/users-service.js';

// Função responsável por listar os usuários com paginação e filtro por nome
async function listaUsers(req, res) {
    const { nome, pagina } = req.query;
    try {
        const data = await listaUsersService(nome, pagina); // Use await aqui
        console.log(data); // Log dos dados retornados
        res.render('users-list', { data });
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).send('Erro ao listar usuários');
    }
}

// Renderizando formulário de adição de usuário
function paginaAddUser(req, res) {
    const data = paginaAddUserService();
    res.render('users-formulario', { data });
}

// Adicionando usuário com validação e tratamento de erros
async function addUser(req, res) {
    console.log({
        rota: "/users/add",
        data: req.body
    });
    try {
        const { name, password, cpf, perfil = 'CLIENTE' } = req.body;

        // Transformar emails e telefones em arrays de objetos com is_primary corretamente
        const emails = Object.keys(req.body)
            .filter(key => key.startsWith('emails') && key.endsWith('email'))
            .map(key => {
                const index = key.match(/\d+/)[0];
                return {
                    email: req.body[`emails[${index}].email`],
                    is_primary: req.body[`emails[${index}].isPrincipal`] === 'on'
                };
            });

        const telefones = Object.keys(req.body)
            .filter(key => key.startsWith('telefones') && key.endsWith('phone_number'))
            .map(key => {
                const index = key.match(/\d+/)[0];
                return {
                    phone_number: req.body[`telefones[${index}].phone_number`],
                    is_primary: req.body[`telefones[${index}].isPrincipal`] === 'on'
                };
            });

        // Logs adicionais para verificar a estrutura dos dados
        console.log('Emails:', emails);
        console.log('Telefones:', telefones);

        // Verificar se todos os campos obrigatórios estão presentes antes de chamar o service
        if (!name || !password || !cpf || !emails.length || !telefones.length) {
            console.error("Todos os campos são obrigatórios.");
            return res.status(400).send("Erro: Todos os campos são obrigatórios.");
        }

        await addUserService({ name, password, cpf, perfil, emails, telefones });
        res.redirect("/users/list");
    } catch (error) {
        console.error("Erro ao adicionar usuário:", error);
        res.status(500).send("Erro ao adicionar usuário");
    }
}


// Excluindo usuário (não pode excluir administradores)
async function removeUser(req, res) {
    try {
        const { id } = req.params;
        await removeUserService(id);
        res.redirect("/users");
    } catch (error) {
        console.error("Erro ao remover usuário:", error);
        res.status(500).send("Erro ao remover usuário");
    }
}


async function updateUser(req, res) {
    const { id } = req.params;
    try {
        const { name, telefones, emails } = req.body;

        // Garantir que emails e telefones estejam no formato correto
        const formattedEmails = emails.map(email => ({
            email: email.email,
            is_primary: email.is_primary === 'true'
        }));
        const formattedPhones = telefones.map(phone => ({
            phone_number: phone.phone_number,
            is_primary: phone.is_primary === 'true'
        }));

        await updateUserService(id, { name, telefones: formattedPhones, emails: formattedEmails });
        res.redirect("/users/details/" + id); // Redirecionar para os detalhes do usuário atualizado
    } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        res.status(500).send("Erro ao atualizar usuário");
    }
}

async function paginaUpdateUser(req, res) {
    const { id } = req.params;
    try {
        const data = await userDetailsService(id); // Obter detalhes do usuário
        res.render('users-update', { data });
    } catch (error) {
        console.error("Erro ao carregar detalhes do usuário:", error);
        res.status(500).send("Erro ao carregar detalhes do usuário");
    }
}


async function userDetails(req, res) {
    const { id } = req.params;
    try {
        const data = await userDetailsService(id);
        // data agora deve conter o usuário, além de suas listas de telefones e emails
        res.render('user-details', { data });
    } catch (error) {
        console.error("Erro ao obter detalhes do usuário:", error);
        res.status(500).send("Erro ao obter detalhes do usuário");
    }
}


export { listaUsers, paginaAddUser, addUser, removeUser, updateUser, userDetails, paginaUpdateUser };
