
import prisma from './lib/prisma.js';

function validarProduto(dto) {
  const { nome, quantidade, limiteMinimo } = dto;

  if (typeof nome !== 'string' || !nome.trim()) {
    throw new Error('Nome do produto é obrigatório');
  }

  if (!Number.isInteger(quantidade) || quantidade < 0) {
    throw new Error('Quantidade deve ser um número inteiro maior ou igual a zero');
  }

  if (!Number.isInteger(limiteMinimo) || limiteMinimo < 0) {
    throw new Error('Limite mínimo deve ser um número inteiro maior ou igual a zero');
  }
}

export async function cadastrar(dto) {
  validarProduto(dto);
  return prisma.produto.create({
    data: {
      nome: dto.nome.trim(),
      quantidade: dto.quantidade,
      limiteMinimo: dto.limiteMinimo
    }
  });
}

export async function listar(filtros = {}) {
  const pagina = Math.max(1, Number.parseInt(filtros.pagina, 10) || 1);
  const limite = Math.min(100, Math.max(1, Number.parseInt(filtros.limite, 10) || 10));

  const where = {};

  if (typeof filtros.nome === 'string' && filtros.nome.trim()) {
    where.nome = { contains: filtros.nome.trim() };
  }

  if (filtros.dataInicio || filtros.dataFim) {
    where.criadoEm = {};

    if (filtros.dataInicio) {
      const inicio = new Date(`${filtros.dataInicio}T00:00:00.000Z`);
      if (Number.isNaN(inicio.getTime())) throw new Error('Data inicial inválida');
      where.criadoEm.gte = inicio;
    }

    if (filtros.dataFim) {
      const fim = new Date(`${filtros.dataFim}T23:59:59.999Z`);
      if (Number.isNaN(fim.getTime())) throw new Error('Data final inválida');
      where.criadoEm.lte = fim;
    }
  }

  const [dados, total] = await prisma.$transaction([
    prisma.produto.findMany({
      where,
      orderBy: { id: 'asc' },
      skip: (pagina - 1) * limite,
      take: limite
    }),
    prisma.produto.count({ where })
  ]);

  return {
    dados,
    pagina,
    limite,
    total,
    totalPaginas: Math.ceil(total / limite)
  };
}

export async function buscarPorId(id) {
  const produto = await prisma.produto.findUnique({ where: { id } });
  if (!produto) throw new Error('Produto não encontrado');
  return produto;
}

export async function atualizar(id, dto) {
  validarProduto(dto);
  await buscarPorId(id);

  return prisma.produto.update({
    where: { id },
    data: {
      nome: dto.nome.trim(),
      quantidade: dto.quantidade,
      limiteMinimo: dto.limiteMinimo
    }
  });
}

export async function deletar(id) {
  await buscarPorId(id);
  await prisma.produto.delete({ where: { id } });
}

export async function listarAbaixoDoLimite() {
  return prisma.$queryRaw`
    SELECT id, nome, quantidade, limite_minimo AS limiteMinimo
    FROM produto
    WHERE quantidade <= limite_minimo
    ORDER BY id
  `;
}
