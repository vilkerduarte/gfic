export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Autenticação requerida' })
  }

  const isAdmin = req.user.permissions.some(p => p.permission === 'admin')
  if (!isAdmin) {
    return res.status(403).json({ error: 'Acesso negado. Permissão de administrador requerida.' })
  }

  next()
}