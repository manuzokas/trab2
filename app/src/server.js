//server.js responsavel por configurar e iniciar o servidor da aplicacao
//ele define as rotas principais, configura os middlewares necessarios, e
//faz a ligacao entre varias partes da aplicacao

//importação de módulos (partes de codigo que serão utilizadas)
import express from 'express';
import usersRouter from './routes/users-routes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './config/database.js';

//configurações iniciais
const __filename = fileURLToPath(import.meta.url); //determinando o nome do arquivo
const __dirname = path.dirname(__filename); // determinando o diretorio

const app = express(); //instancia da aplicacao express

// configurando o middleware para parsing de requisições
app.use(express.json()); // trabalhando com APIs (JSON)
app.use(express.urlencoded({ extended: false })); // trabalhando com form submissions (SSR)

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

// adicionando múltiplos usuários de teste
//const stmt = db.prepare('INSERT INTO users (name, email, password, created_at, cpf, perfil) VALUES (?, ?, ?, ?, ?, ?)');

// for (let i = 1; i <= 10; i++) {
//     stmt.run(`Teste ${i}`, `teste${i}@example.com`, 'senha123', new Date().toISOString(), `123.456.789-0${i}`, 'admin');
//     console.log(`Usuário Teste ${i} adicionado!`);
// }

// Consultando todos os usuários 
const users = db.prepare('SELECT * FROM users').all();
console.log(users);

// Tratamento de erros 404 - Página não encontrada
app.use((req, res, next) => {
    res.status(404).render('404', { title: "Página não encontrada" });
});

// Tratamento genérico de erros (opcional)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo deu errado!');
});

// Inicializando o servidor na porta 3000
app.listen(3000, () => {
    console.log("Servidor iniciado na porta 3000");
});
