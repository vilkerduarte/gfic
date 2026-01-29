import { Router } from 'express'
import prisma from '../../lib/prisma.js'
import { verifyPassword, generateToken, sanitizeUser } from '../../lib/utils.js'

const router = Router()

router.post('/', async (req, res) => {
  try {
    const { email, password, fingerprint } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { permissions: true }
    })

    if (!user || !(await verifyPassword(password, user.password))) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    // Expirar todas as sessões existentes do usuário
    await prisma.session.updateMany({
      where: { 
        userId: user.id,
        expiresAt: { gt: new Date() } // Apenas sessões não expiradas
      },
      data: {
        expiresAt: new Date() // Expira imediatamente
      }
    })

    // Criar nova sessão
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        fingerprint: fingerprint || null,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
      }
    })

    const token = generateToken({ 
      userId: user.id, 
      sessionId: session.id 
    })

    // Definir cookie http-only
    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS em produção
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
      path: '/'
    })

    // Não enviar o token no response body
    res.json({
      message: 'Login realizado com sucesso',
      user: sanitizeUser(user)
      // session.hash e token não são mais enviados
    })
  } catch (error) {
    console.error('Erro no login:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

export default router