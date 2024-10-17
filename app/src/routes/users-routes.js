import { Router } from 'express';
import { listaUsers, paginaAddUser, addUser, removeUser, updateUser, userDetails, paginaUpdateUser } from '../controllers/users-controller.js';

const router = Router();

//rotas get
router.get('/list', listaUsers);
router.get('/addUser', paginaAddUser);
router.get('/:id', userDetails);
router.get('/updateUser/:id', paginaUpdateUser);
//rotas post
router.post('/addUser', addUser);
router.post('/remove/:id', removeUser);  // As rotas para deletar e atualizar são úteis
router.post('/update/:id', updateUser);

export default router;
