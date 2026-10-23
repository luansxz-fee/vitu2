
import prisma from './lib/prisma.js';

export async function movimentar(dto) {
  const produtoId = Number(dto.produtoId);
  const usuarioId = Number(dto.usuarioId);
  const tipo = String(dto.tipo ?? '').toUpperCase();
  const quantidade = Number(dto.quantidade);

  if (!Number.isInteger(produtoId) || produtoId <= 0) {
    throw new Error('produtoId inválido');
  }
  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    throw new Error('Usuário responsável inválido');
  }
  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    throw new Error('Quantidade deve ser um número inteiro maior que zero');
  }
  if (!['ENTRADA', 'SAIDA'].includes(tipo)) {
    throw new Error('Tipo de movimentação inválido. Use ENTRADA ou SAIDA');
  }

  return prisma.$transaction(async (tx) => {
    const produto = await tx.produto.findUnique({ where: { id: produtoId } });
    if (!produto) throw new Error('Produto não encontrado');

    const usuario = await tx.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario) throw new Error('Usuário responsável não encontrado');

    if (tipo === 'SAIDA' && produto.quantidade < quantidade) {
      throw new Error(
        `Saída não permitida: estoque insuficiente. Disponível: ${produto.quantidade}. Solicitado: ${quantidade}.`
      );
    }

    const novaQuantidade = tipo === 'ENTRADA'
      ? produto.quantidade + quantidade
      : produto.quantidade - quantidade;

    await tx.produto.update({
      where: { id: produtoId },
      data: { quantidade: novaQuantidade }
    });

    return tx.movimentacao.create({
      data: { tipo, quantidade, produtoId, usuarioId },
      include: {
        produto: true,
        usuario: { select: { id: true, nome: true, email: true } }
      }
    });
  });
}

export async function listar() {
  return prisma.movimentacao.findMany({
    include: {
      produto: true,
      usuario: { select: { id: true, nome: true, email: true } }
    },
    orderBy: { dataMovimentacao: 'desc' }
  });
}

export async function listarPorProduto(produtoId) {
  if (!Number.isInteger(produtoId) || produtoId <= 0) {
    throw new Error('ID do produto inválido');
  }

  return prisma.movimentacao.findMany({
    where: { produtoId },
    include: {
      produto: true,
      usuario: { select: { id: true, nome: true, email: true } }
    },
    orderBy: { dataMovimentacao: 'desc' }
  });
}
