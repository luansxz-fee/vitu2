
import * as movimentacaoService from '../movimentacaoService.js';

export async function movimentar(req, res, next) {
  try {
    const resultado = await movimentacaoService.movimentar({
      ...req.body,
      usuarioId: req.usuario.id
    });
    res.status(201).json(resultado);
  } catch (erro) {
    next(erro);
  }
}

export async function listar(req, res, next) {
  try {
    res.json(await movimentacaoService.listar());
  } catch (erro) {
    next(erro);
  }
}

export async function listarPorProduto(req, res, next) {
  try {
    res.json(
      await movimentacaoService.listarPorProduto(
        Number(req.params.produtoId)
      )
    );
  } catch (erro) {
    next(erro);
  }
}
