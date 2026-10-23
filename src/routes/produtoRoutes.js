
import { Router } from 'express';
import * as controller from '../controllers/produtoController.js';
import { autenticar, autorizar } from '../middlewares/auth.js';

const router = Router();

router.use(autenticar);

router.get('/baixo-estoque', controller.listarAbaixoDoLimite);
router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);
router.post('/', controller.cadastrar);
router.put('/:id', controller.atualizar);
router.delete('/:id', autorizar('ADMINISTRADOR'), controller.deletar);

export default router;
