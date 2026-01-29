import { verifyToken } from '../lib/utils.js'
import prisma from '../lib/prisma.js'

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.cookies?.session_token || null;

  const token = authHeader && authHeader.startsWith('Bearer') ? authHeader.split(' ')[1] : authHeader;
  

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' })
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return res.status(403).json({ error: 'Token inválido ou expirado' })
  }
  req.token = decoded;

  try {
    const session = await prisma.session.findFirst({
      where: { id: decoded.sessionId, expiresAt: { gte: new Date() } },
      include: {
        user: {
          include: {
            permissions: true
          }
        }
      }
    });

    if (!session) {
      return res.status(403).json({ error: 'Sessão expirada' })
    }
    const user = session.user;

    req.user = user
    next()
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Erro na autenticação' })
  }
}

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers.cookies?.session_token || null;
  const token = authHeader && authHeader.split(' ')[1]

  if (token) {
    const decoded = verifyToken(token)
    if (decoded) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          include: {
            permissions: true
          }
        })
        req.user = user
      } catch (error) {
        // Continua sem usuário autenticado
      }
    }
  }

  next()
}