import { Router } from 'express'
import { authenticateToken } from '../../middleware/authentication.js'
import prisma from '../../lib/prisma.js'
import { hashPassword, sanitizeUser } from '../../lib/utils.js'

const router = Router()

router.use(authenticateToken)

router.post('/', async (req, res) => {
  try {
    await prisma.session.update({where:{id:req.token.sessionId},data:{expiresAt:new Date(Date.now() - 15000)}});
    res.status(200).json({});
  } catch (error) {
    console.error('Erro ao buscar dados:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})
export default router