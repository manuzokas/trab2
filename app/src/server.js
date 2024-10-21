//server.js responsavel por configurar e iniciar o servidor da aplicacao
//ele define as rotas principais, configura os middlewares necessarios, e
//faz a ligacao entre varias partes da aplicacao

//importação de módulos (partes de codigo que serão utilizadas)
import express from 'express';
import usersRouter from './routes/users-routes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './config/database.js';
import { addUser } from './config/addUsersDatabase.js';
import sqlite3 from 'sqlite3';
import methodOverride from 'method-override'

// configuracao e abertura do banco de dados sqlite3
const sqlite = sqlite3.verbose();
const database = new sqlite.Database('C:/Users/55539/tads-webii-2024-2/Aula04/app/dados.db');

// funcao para garantir que os usuários existam no banco de dados
function ensureUsersExist() {
    const users = db.prepare('SELECT * FROM users').all();

    if (users.length === 0) {
        // Adicionando múltiplos usuários de teste se não houver usuários no banco de dados
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
        // Adicione os outros usuários da mesma forma...
        console.log("Usuários de teste adicionados ao banco de dados.");
    } else {
        console.log("Usuários já existem no banco de dados.");
    }
}

//configurações iniciais
const __filename = fileURLToPath(import.meta.url); //determinando o nome do arquivo
const __dirname = path.dirname(__filename); // determinando o diretorio

const app = express(); //instancia da aplicacao express

// configurando o middleware para parsing de requisições
app.use(express.json()); // trabalhando com APIs (JSON)
app.use(express.urlencoded({ extended: false })); // trabalhando com form submissions (SSR)

// configurando o method-override
app.use(methodOverride('_method'));

// middleware para logar requisições
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// setando o EJS como template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); //definindo o diretorio das views

// rota para verificar se o servidor está ativo
app.get('/healthcheck', (req, res) => {
    res.send('OK');
});

// redirecionamento para a página de listagem de usuario
app.get('/', (req, res) => res.redirect('/users/list'));

// middleware para logar requisições
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// middleware de autenticação (modificado para permitir todas as rotas)
app.use((req, res, next) => {
    next(); // aqui ssimplesmente passamos para a próxima rota sem exigir autenticação
});

// importando e utilizando as rotas de usuário
app.use('/users', usersRouter);  // Gerencia as rotas de usuários, incluindo '/users/home'

ensureUsersExist();

// consultando todos os usuários 
const users = db.prepare('SELECT * FROM users').all();
console.log(users);

// tratamento de erros 404 - Página não encontrada
app.use((req, res, next) => {
    res.status(404).render('404', { title: "Página não encontrada" });
});

// tratamento genérico de erros (opcional)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo deu errado!');
});

// Inicializando o servidor na porta 3000
app.listen(3000, () => {
    console.log("Servidor iniciado na porta 3000");
});
