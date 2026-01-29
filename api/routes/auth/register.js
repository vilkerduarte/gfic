import { Router } from 'express'
import prisma from '../../lib/prisma.js'
import { hashPassword, validateEmail, sanitizeUser } from '../../lib/utils.js'

const router = Router()

router.post('/', async (req, res) => {
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

export default router