import { Router } from 'express'
import { verifyPassword,hashPassword, generateToken,validateEmail, sanitizeUser } from '../lib/utils.js'
import notifyEmail from '../lib/send-mail.js'
import { authenticateToken } from '../middleware/authentication.js'
import prisma from '../lib/prisma.js'

const router = Router()

router.post('/login', async (req, res) => {
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

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' })
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Email inválido' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(409).json({ error: 'Email já está em uso' })
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        permissions: {
          create: [
            { permission: 'user' }
          ]
        }
      },
      include: {
        permissions: true
      }
    })

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: sanitizeUser(user)
    })
  } catch (error) {
    console.error('Erro no registro:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})
router.post('/recovery/request', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (user) {
      const recoveryToken = generateToken(
        { userId: user.id, type: 'recovery' },
        process.env.JWT_SECRET + '_recovery',
        '1h'
      )

      await notifyEmail.recovery(email, recoveryToken)
    }

    // Sempre retorna sucesso para evitar enumeração de emails
    res.json({ message: 'Se o email existir, um link de recuperação foi enviado' })
  } catch (error) {
    console.error('Erro na recuperação:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

router.post('/recovery/reset', async (req, res) => {
  try {
    const { token, newPassword } = req.body

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token e nova senha são obrigatórios' })
    }

    // Implementar verificação do token e reset da senha
    res.json({ message: 'Senha resetada com sucesso' })
  } catch (error) {
    console.error('Erro no reset:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})


router.use(authenticateToken)

router.get('/account', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        permissions: true,
        userConfigs: true
      }
    });
    let my = await prisma.my_assets.findMany({
      where: {
        user_id: user.id
      }, select: { symbol: true }
    });

    my = my.map(a => a.symbol).join('!');
    user.assets = my;
    res.json({ user: sanitizeUser(user) })
  } catch (error) {
    console.error('Erro ao buscar dados:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

router.put('/account', async (req, res) => {
  try {
    const { name, email } = req.body

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(email && { email })
      },
      include: {
        permissions: true
      }
    })

    res.json({
      message: 'Dados atualizados com sucesso',
      user: sanitizeUser(updatedUser)
    })
  } catch (error) {
    console.error('Erro ao atualizar:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

router.get('/account/assets', async (req, res) => {
  try {
    
    let my = await prisma.my_assets.findMany({
      where: {
        user_id: req.user.id
      }, select: { symbol: true }
    });

    my = my.map(a => a.symbol).join('!');
    res.json({ assets:my })
  } catch (error) {
    console.error('Erro ao buscar dados:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})
router.post('/sign-out', async (req, res) => {
  try {
    await prisma.session.update({where:{id:req.token.sessionId},data:{expiresAt:new Date(Date.now() - 15000)}});
    res.status(200).json({});
  } catch (error) {
    console.error('Erro ao buscar dados:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

export default router
