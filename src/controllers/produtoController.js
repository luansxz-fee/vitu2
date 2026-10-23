
import * as produtoService from '../produtoService.js';

function idValido(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    const erro = new Error('ID inválido');
    erro.status = 400;
    throw erro;
  }
  return id;
}

export async function cadastrar(req, res, next) {
  try {
    res.status(201).json(await produtoService.cadastrar(req.body));
  } catch (erro) {
    next(erro);
  }
}

export async function listar(req, res, next) {
  try {
    res.json(await produtoService.listar(req.query));
  } catch (erro) {
    next(erro);
  }
}

export async function buscarPorId(req, res, next) {
  try {
    res.json(await produtoService.buscarPorId(idValido(req.params.id)));
  } catch (erro) {
    next(erro);
  }
}

export async function atualizar(req, res, next) {
  try {
    res.json(await produtoService.atualizar(idValido(req.params.id), req.body));
  } catch (erro) {
    next(erro);
  }
}

export async function deletar(req, res, next) {
  try {
    await produtoService.deletar(idValido(req.params.id));
    res.status(204).send();
  } catch (erro) {
    next(erro);
  }
}

export async function listarAbaixoDoLimite(req, res, next) {
  try {
    res.json(await produtoService.listarAbaixoDoLimite());
  } catch (erro) {
    next(erro);
  }
}
