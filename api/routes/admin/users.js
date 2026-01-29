import { Router } from 'express'
import prisma from '../../lib/prisma.js'
import { authenticateToken } from '../../middleware/authentication.js'
import { requireSupportOrMaster, requireMaster } from '../../middleware/authorization.js'
import { generateToken, hashPassword, sanitizeUser } from '../../lib/utils.js'

const router = Router()

router.use(authenticateToken)
router.use(requireSupportOrMaster)

const userFullInclude = {
  permissions: true,
  userConfigs: true,
  sessions: true,
  credits: true,
  invoices: true,
  my_assets: true,
  reports: true,
  my_learn_products: {
    include: {
      my_learn_products: true
    }
  }
}

const baseInclude = { permissions: true }

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const perPage = parseInt(req.query.perPage) || 20
    const q = (req.query.q || '').trim()
    const permission = req.query.permission || null

    const where = {}
    const orFilters = []

    if (q) {
      orFilters.push(
        { email: { contains: q } },
        { name: { contains: q } }
      )
    }

    if (orFilters.length) {
      where.OR = orFilters
    }

    if (permission) {
      where.permissions = { some: { permission } }
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        include: baseInclude,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage
      })
    ])

    res.json({
      list: users.map(u => sanitizeUser(u)),
      total,
      page,
      perPage
    })
  } catch (error) {
    console.error('Erro ao listar usuarios:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID invalido' })
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: userFullInclude
    })

    if (!user) {
      return res.status(404).json({ error: 'Usuario nao encontrado' })
    }

    res.json({ user: sanitizeUser(user) })
  } catch (error) {
    console.error('Erro ao buscar usuario:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID invalido' })
    }

    const { name, email, password, balance } = req.body
    const data = {}

    if (typeof name === 'string') data.name = name
    if (typeof email === 'string') data.email = email
    if (typeof balance === 'number') data.balance = balance

    if (password) {
      data.password = await hashPassword(password)
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      include: baseInclude
    })

    res.json({
      message: 'Usuario atualizado com sucesso',
      user: sanitizeUser(updatedUser)
    })
  } catch (error) {
    console.error('Erro ao atualizar usuario:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

router.put('/:id/permissions', requireMaster, async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID invalido' })
    }

    const incoming = Array.isArray(req.body.permissions) ? req.body.permissions : []
    const valid = ['master', 'suporte', 'user']
    const uniquePermissions = [...new Set(incoming.filter(p => valid.includes(p)))]

    if (!uniquePermissions.length) {
      uniquePermissions.push('user')
    }

    await prisma.permission.deleteMany({ where: { userId: id } })
    await prisma.permission.createMany({
      data: uniquePermissions.map(permission => ({ userId: id, permission }))
    })

    const user = await prisma.user.findUnique({
      where: { id },
      include: baseInclude
    })

    res.json({
      message: 'Permissoes atualizadas',
      permissions: user?.permissions || []
    })
  } catch (error) {
    console.error('Erro ao atualizar permissoes:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

router.post('/:id/magic-link', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID invalido' })
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: baseInclude
    })

    if (!user) {
      return res.status(404).json({ error: 'Usuario nao encontrado' })
    }

    const token = generateToken(
      { userId: user.id, type: 'recovery' },
      process.env.JWT_SECRET + '_recovery',
      '1h'
    )

    const frontendHost = process.env.FRONTEND_URL || 'http://localhost:5173'
    const link = `${frontendHost}/recovery?token=${token}`

    res.json({
      message: 'Magic link gerado',
      token,
      link,
      expiresIn: 3600
    })
  } catch (error) {
    console.error('Erro ao gerar magic link:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

export default router
