import { Router } from 'express'
import prisma from '../../lib/prisma.js'
import { authenticateToken } from '../../middleware/authentication.js'
import { requireSupportOrMaster, requireMaster } from '../../middleware/authorization.js'
import Admin from '../../lib/manager.js'

const router = Router()

router.use(authenticateToken)
router.use(requireSupportOrMaster)

const invoiceInclude = {
  users: {
    include: {
      permissions: true
    }
  }
}

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const perPage = parseInt(req.query.perPage) || 20
    const q = (req.query.q || '').trim()
    const status = req.query.status || null

    const where = {}
    const orFilters = []

    if (q) {
      orFilters.push(
        { txid: { contains: q } },
        { users: { email: { contains: q } } },
        { users: { name: { contains: q } } }
      )
    }

    if (orFilters.length) {
      where.OR = orFilters
    }

    if (status) {
      where.status = status
    }

    const [total, list] = await Promise.all([
      prisma.invoices.count({ where }),
      prisma.invoices.findMany({
        where,
        include: invoiceInclude,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage
      })
    ])

    res.json({ list, total, page, perPage })
  } catch (error) {
    console.error('Erro ao listar pagamentos:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) return res.status(400).json({ error: 'ID invalido' })

    const invoice = await prisma.invoices.findUnique({
      where: { id },
      include: invoiceInclude
    })

    if (!invoice) {
      return res.status(404).json({ error: 'Pagamento nao encontrado' })
    }

    res.json({ invoice })
  } catch (error) {
    console.error('Erro ao buscar pagamento:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

router.put('/:id', requireMaster, async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) return res.status(400).json({ error: 'ID invalido' })

    const { status, credits, value, data } = req.body

    const existing = await prisma.invoices.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ error: 'Pagamento nao encontrado' })
    }

    const updateData = {}
    if (typeof status === 'string') updateData.status = status
    if (typeof credits === 'number') updateData.credits = credits
    if (typeof value === 'number') updateData.value = value
    if (data) updateData.data = data

    const updated = await prisma.invoices.update({
      where: { id },
      data: updateData,
      include: invoiceInclude
    })

    if (updateData.status === 'paid' && existing.status !== 'paid') {
      const user = await prisma.user.findUnique({ where: { id: existing.user_id } })
      if (user) {
        await Admin.addCredits(user, updated.credits, 'Confirmacao manual de pagamento')
      }
    }

    res.json({ message: 'Pagamento atualizado', invoice: updated })
  } catch (error) {
    console.error('Erro ao atualizar pagamento:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

export default router
