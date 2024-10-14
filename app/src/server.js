import express from 'express';
import usersRouter from './routes/users-routes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Configurando o middleware para parsing de requisições
app.use(express.json()); // Trabalhando com APIs (JSON)
app.use(express.urlencoded({ extended: false })); // Trabalhando com form submissions (SSR)

// Setando o EJS como template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Rota para verificar se o servidor está ativo
app.get('/healthcheck', (req, res) => {
    res.send('OK');
});

// Redirecionamento para a página inicial
app.get('/', (req, res) => res.redirect('/users/list'));

// Middleware para logar requisições (opcional)
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Middleware de autenticação (modificado para permitir todas as rotas)
app.use((req, res, next) => {
    next(); // Aqui, simplesmente passamos para a próxima rota sem exigir autenticação
});

// Importando e utilizando as rotas de usuário
app.use('/users', usersRouter);  // Gerencia as rotas de usuários, incluindo '/users/home'

// Adicionando múltiplos usuários de teste
const stmt = db.prepare('INSERT INTO users (name, email, password, created_at, cpf, perfil) VALUES (?, ?, ?, ?, ?, ?)');

for (let i = 1; i <= 10; i++) {
    stmt.run(`Teste ${i}`, `teste${i}@example.com`, 'senha123', new Date().toISOString(), `123.456.789-0${i}`, 'admin');
    console.log(`Usuário Teste ${i} adicionado!`);
}

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
