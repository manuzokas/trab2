import { listaUsersService, addUserService, removeUserService, updateUserService, paginaAddUserService, userDetailsService } from '../services/users-service.js';

// função responsável por listar os usuários com paginação e filtro por nome
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

// renderizando formulário de adição de usuário
function paginaAddUser(req, res) {
    const data = paginaAddUserService();
    res.render('users-formulario', { data });
}

// adicionando usuário com validação e tratamento de erros
async function addUser(req, res) {
    console.log({
        rota: "/users/add",
        data: req.body
    });
    try {
        const { name, password, cpf, perfil = 'CLIENTE' } = req.body;

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

        // logs adicionais para verificar a estrutura dos dados
        console.log('Emails:', emails);
        console.log('Telefones:', telefones);

        // verificando se todos os campos obrigatórios estão presentes antes de chamar o service
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

// excluindo usuarios
async function removeUser(req, res) {
    const { id } = req.params;
    console.log(`Recebendo requisição para remover usuário com ID: ${id}`);
    try {
        await removeUserService(id);
        console.log(`Usuário com ID: ${id} removido com sucesso. Redirecionando para /users/list`);
        res.redirect("/users/list");
    } catch (error) {
        console.error(`Erro ao remover usuário ${id}:`, error);
        res.status(500).json({ error: "Erro ao remover usuário" });
    }
}


//atualizando usuarios
async function updateUser(req, res) {
    const { id } = req.params;

    console.log('ID do usuário a ser atualizado:', id);
    
    try {
        console.log('Dados recebidos para atualização:', req.body);
        
        const { name } = req.body;

        // Validação manual para nome
        if (!name || typeof name !== 'string') {
            return res.status(400).json({ message: "Nome é obrigatório e deve ser uma string." });
        }

        // Estruturação dos emails
        const emails = [];
        for (let i = 0; req.body[`emails[${i}][email]`]; i++) {
            emails.push({
                email: req.body[`emails[${i}][email]`],
                is_primary: req.body[`emails[is_primary]`] === '1'
            });
        }

        // Estruturação dos telefones
        const telefones = [];
        for (let i = 0; req.body[`telefones[${i}][phone_number]`]; i++) {
            telefones.push({
                phone_number: req.body[`telefones[${i}][phone_number]`],
                is_primary: req.body[`telefones[is_primary]`] === '1'
            });
        }

        // Verificações de email e telefone principal
        if (!emails.some(email => email.is_primary)) {
            console.error("Validação falhou: Nenhum email principal encontrado.");
            return res.status(400).json({ message: "É necessário ter ao menos um email principal." });
        }

        if (!telefones.some(phone => phone.is_primary)) {
            console.error("Validação falhou: Nenhum telefone principal encontrado.");
            return res.status(400).json({ message: "É necessário ter ao menos um telefone principal." });
        }

        // Atualização do usuário
        await updateUserService(id, { name, telefones, emails });
        console.log(`Usuário ${id} atualizado com sucesso.`);
        
        res.redirect(`/users/updateUser/${id}?success=1`);
    } catch (error) {
        console.error("Erro ao atualizar usuário:", error.message);
        res.status(500).send("Erro ao atualizar usuário");
    }
}

async function paginaUpdateUser(req, res) {
    const { id } = req.params;
    const { success } = req.query;

    try {
        const data = await userDetailsService(id);

        if (!data) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        res.render('users-update', { data, success });
    } catch (error) {
        console.error("Erro ao carregar detalhes do usuário:", error);
        res.status(500).json({ error: "Erro ao carregar detalhes do usuário" });
    }
}

async function userDetails(req, res) {
    const { id } = req.params; // Obtemos o ID do usuário a partir dos parâmetros da requisição
    try {
        const data = await userDetailsService(id); // Chamamos o serviço para obter os detalhes do usuário
        
        // Verifica se os dados retornados contêm um usuário
        if (!data || !data.user) {
            return res.status(404).render('user-details', {
                data: null, // Passa null para indicar que não há dados
                errorMessage: "Usuário não encontrado."
            });
        }

        // Renderiza a view com os dados do usuário
        res.render('user-details', { data });
    } catch (error) {
        console.error("Erro ao obter detalhes do usuário:", error);
        res.status(500).send("Erro ao obter detalhes do usuário");
    }
}


export { listaUsers, paginaAddUser, addUser, removeUser, updateUser, userDetails, paginaUpdateUser };
