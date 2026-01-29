export const requirePermission = (allowed = []) => {
  return (req, res, next) => {
    const roles = req.user?.permissions?.map(p => p.permission) || []
    const hasPermission = allowed.length === 0 || roles.some(role => allowed.includes(role))

    if (!hasPermission) {
      return res.status(403).json({ error: 'Permissao negada' })
    }

    next()
  }
}

export const requireSupportOrMaster = requirePermission(['master', 'suporte'])
export const requireMaster = requirePermission(['master'])
