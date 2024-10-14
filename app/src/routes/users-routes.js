import { Router } from 'express';
import { listaUsers, paginaAddUser, addUser, removeUser, updateUser } from '../controllers/users-controller.js';

const router = Router();

router.get('/list', listaUsers);
router.get('/add', paginaAddUser);
router.post('/add', addUser);
router.post('/remove/:id', removeUser);  // As rotas para deletar e atualizar são úteis
router.post('/update/:id', updateUser);

export default router;
