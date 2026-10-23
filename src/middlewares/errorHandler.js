
export function errorHandler(erro, req, res, next) {
  console.error(erro);

  if (res.headersSent) {
    return next(erro);
  }

  const status =
    erro.status ||
    (erro.code === 'P2002' ? 409 :
      erro.code === 'P2025' ? 404 : 400);

  return res.status(status).json({
    timestamp: new Date().toISOString(),
    status,
    erro: erro.message || 'Erro interno'
  });
}
