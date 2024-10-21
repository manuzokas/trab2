import { Router } from 'express';
import { listaUsers, paginaAddUser, addUser, removeUser, updateUser, userDetails, paginaUpdateUser } from '../controllers/users-controller.js';
import { userDetailsService } from '../services/users-service.js';

const router = Router();

//rotas get
router.get('/list', listaUsers);
router.get('/addUser', paginaAddUser);
router.get('/:id', userDetails);
router.get('/updateUser/:id', paginaUpdateUser);

router.get('/deleteUser/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`Recebida requisição GET para /deleteUser/${id}`);

    try {
        const user = await userDetailsService(id);
        console.log('Usuário encontrado:', user);
        res.render('delete-user', { user });
    } catch (error) {
        console.error(`Erro ao carregar detalhes do usuário ${id}:`, error);
        res.status(500).json({ error: "Erro ao carregar detalhes do usuário" });
    }
});

//rotas post
router.post('/addUser', addUser);

router.post('/remove/:id', removeUser);

router.post('/updateUser/:id', (req, res, next) => {
    console.log('Dados recebidos para atualização:', req.body);
    updateUser(req, res, next);
});

export default router;