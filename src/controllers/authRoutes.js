import { Router } from 'express';
import { cadastrar, login } from './authController.js';

const router = Router();

router.post('/cadastro', cadastrar);
router.post('/login', login);

export default router;