
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

function gerarToken(usuario) {
  const segredo = process.env.JWT_SECRET;

  if (!segredo) {
    throw new Error('JWT_SECRET não configurado no servidor.');
  }

  return jwt.sign(
    {
      id: usuario.id,
      papel: usuario.papel
    },
    segredo,
    { expiresIn: '8h' }
  );
}

export async function cadastrar(req, res, next) {
  try {
    const { nome, email, senha } = req.body;

    if (
      typeof nome !== 'string' ||
      !nome.trim() ||
      typeof email !== 'string' ||
      !email.trim() ||
      typeof senha !== 'string' ||
      senha.length < 8
    ) {
      return res.status(400).json({
        erro: 'Informe nome, email e senha com pelo menos 8 caracteres.'
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const existente = await prisma.usuario.findUnique({
      where: { email: emailNormalizado }
    });

    if (existente) {
      return res.status(409).json({
        erro: 'Este email já está cadastrado.'
      });
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    const usuario = await prisma.usuario.create({
      data: {
        nome: nome.trim(),
        email: emailNormalizado,
        senhaHash,
        papel: 'OPERADOR'
      },
      select: {
        id: true,
        nome: true,
        email: true,
        papel: true,
        criadoEm: true
      }
    });

    const token = gerarToken(usuario);

    return res.status(201).json({ usuario, token });
  } catch (erro) {
    if (erro.code === 'P2002') {
      return res.status(409).json({
        erro: 'Este email já está cadastrado.'
      });
    }

    next(erro);
  }
}

export async function login(req, res, next) {
  try {
    const { email, senha } = req.body;

    if (
      typeof email !== 'string' ||
      typeof senha !== 'string' ||
      !email.trim() ||
      !senha
    ) {
      return res.status(400).json({
        erro: 'Informe email e senha.'
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (!usuario || !(await bcrypt.compare(senha, usuario.senhaHash))) {
      return res.status(401).json({
        erro: 'Email ou senha incorretos.'
      });
    }

    const usuarioSeguro = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      papel: usuario.papel,
      criadoEm: usuario.criadoEm
    };

    const token = gerarToken(usuarioSeguro);

    return res.status(200).json({
      usuario: usuarioSeguro,
      token
    });
  } catch (erro) {
    next(erro);
  }
}
