
import jwt from 'jsonwebtoken';

export function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization;

  if (!cabecalho?.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token de autenticação não informado.' });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ erro: 'JWT_SECRET não configurado.' });
  }

  try {
    const dados = jwt.verify(cabecalho.slice(7), process.env.JWT_SECRET);

    req.usuario = { id: dados.id, papel: dados.papel };
    next();
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

export function autorizar(...papeisPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ erro: 'Autenticação necessária.' });
    }

    if (!papeisPermitidos.includes(req.usuario.papel)) {
      return res.status(403).json({
        erro: 'Você não tem permissão para realizar esta ação.'
      });
    }

    next();
  };
}
